import { Injectable, Inject } from '@nestjs/common';
import { eq, and, isNull, isNotNull, lt } from 'drizzle-orm';
import { refresh_token, user } from 'src/db/schema';

@Injectable()
export class AuthRepository {
  constructor(@Inject('DB') private readonly db: any) {}

  async createRefreshToken(userId: number, token: string, expiresAt: Date) {
    return this.db
      .insert(refresh_token)
      .values({
        user_id: userId,
        token,
        expires_at: expiresAt,
      })
      .returning();
  }

  async findRefreshToken(token: string) {
    return this.db
      .select({
        id: refresh_token.id,
        token: refresh_token.token,
        user_id: refresh_token.user_id,
        expires_at: refresh_token.expires_at,
        created_at: refresh_token.created_at,
        revoked_at: refresh_token.revoked_at,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          deleted_at: user.deleted_at,
        },
      })
      .from(refresh_token)
      .innerJoin(user, eq(refresh_token.user_id, user.id))
      .where(eq(refresh_token.token, token))
      .limit(1);
  }

  async revokeRefreshToken(token: string) {
    return this.db
      .update(refresh_token)
      .set({ revoked_at: new Date() })
      .where(eq(refresh_token.token, token))
      .returning();
  }

  async revokeAllUserTokens(userId: number) {
    return this.db
      .update(refresh_token)
      .set({ revoked_at: new Date() })
      .where(and(eq(refresh_token.user_id, userId), isNull(refresh_token.revoked_at)))
      .returning();
  }

  async deleteExpiredTokens() {
    return this.db
      .delete(refresh_token)
      .where(lt(refresh_token.expires_at, new Date()))
      .returning();
  }

  async deleteRevokedTokens() {
    const result = await this.db
      .delete(refresh_token)
      .where(isNotNull(refresh_token.revoked_at))
      .returning();
    
    return result.length;
  }
}
