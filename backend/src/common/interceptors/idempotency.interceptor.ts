import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { idempotency_key } from 'src/db/schema';
import { eq, and, gt } from 'drizzle-orm';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(@Inject('DB') private readonly db: any) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const idempotencyKey = request.headers['idempotency-key'] as string;
    
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    if (idempotencyKey.length < 16 || idempotencyKey.length > 255) {
      throw new BadRequestException('Idempotency-Key must be between 16 and 255 characters');
    }

    const user = (request as any).user;
    if (!user || !user.id) {
      throw new BadRequestException('User authentication required for idempotent requests');
    }

    const requestPath = request.path;
    const requestMethod = request.method;
    const now = new Date();

    const existingKey = await this.db.query.idempotency_key.findFirst({
      where: and(
        eq(idempotency_key.key, idempotencyKey),
        eq(idempotency_key.user_id, user.id),
        gt(idempotency_key.expires_at, now)
      ),
    });

    if (existingKey) {
      if (
        existingKey.request_path !== requestPath ||
        existingKey.request_method !== requestMethod
      ) {
        throw new ConflictException(
          'Idempotency key has been used for a different request',
        );
      }

      response.status(existingKey.response_code);
      return of(JSON.parse(existingKey.response_body));
    }

    return next.handle().pipe(
      tap(async (data) => {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await this.db.insert(idempotency_key).values({
          key: idempotencyKey,
          request_path: requestPath,
          request_method: requestMethod,
          user_id: user.id,
          response_code: response.statusCode,
          response_body: JSON.stringify(data),
          expires_at: expiresAt,
        });
      }),
    );
  }
}
