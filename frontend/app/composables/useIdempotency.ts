export function useIdempotency() {
  function generateIdempotencyKey(): string {
    return crypto.randomUUID();
  }

  return {
    generateIdempotencyKey,
  };
}
