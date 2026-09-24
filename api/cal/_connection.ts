import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { getSupabaseAdmin } from '../_supabaseAdmin';

const algorithm = 'aes-256-gcm';

export async function saveCalApiKey(userId: string, apiKey: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('cal_calendar_connections').upsert(
    {
      user_id: userId,
      encrypted_api_key: encrypt(apiKey),
      key_hint: keyHint(apiKey),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) throw error;
}

export async function getCalApiKey(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('cal_calendar_connections')
    .select('encrypted_api_key')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.encrypted_api_key ? decrypt(data.encrypted_api_key) : null;
}

export async function getCalConnectionStatus(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('cal_calendar_connections')
    .select('key_hint, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function removeCalConnection(userId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('cal_calendar_connections').delete().eq('user_id', userId);
  if (error) throw error;
}

function encrypt(value: string) {
  const key = encryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString('base64')}.${tag.toString('base64')}.${ciphertext.toString('base64')}`;
}

function decrypt(value: string) {
  const [version, iv, tag, ciphertext] = value.split('.');
  if (version !== 'v1' || !iv || !tag || !ciphertext) throw new Error('Stored Cal.com connection is invalid.');

  const decipher = createDecipheriv(algorithm, encryptionKey(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]).toString('utf8');
}

function encryptionKey() {
  const value = process.env.CAL_CONNECTION_ENCRYPTION_KEY;
  const key = value ? Buffer.from(value, 'base64') : null;
  if (!key || key.length !== 32) throw new Error('CAL_CONNECTION_ENCRYPTION_KEY must be a base64-encoded 32-byte value.');
  return key;
}

function keyHint(apiKey: string) {
  return `••••${apiKey.slice(-4)}`;
}
