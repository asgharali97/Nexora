import crypto from 'crypto';

export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

export function generateApiKey(): string {
  const prefix = 'nx';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${randomBytes}`;
}

export function isValidApiKeyFormat(apiKey: string): boolean {
  return /^nx_[a-f0-9]{64}$/.test(apiKey);
}