import test from 'node:test';
import assert from 'node:assert/strict';
import { signToken, verifyToken, hashPassword, verifyPassword, sha256, isLegacyPasswordHash } from '../supabase/functions/_shared/session-tokens.ts';

const secret='local-test-secret-at-least-32-bytes!';
test('token válido, papel e identidade preservados',async()=>{
  const token=await signToken({sub:'id-123',role:'student',exp:Date.now()+60000},secret);
  const payload=await verifyToken(token,secret);
  assert.equal(payload.sub,'id-123');
  assert.equal(payload.role,'student');
});
test('token alterado e expirado são rejeitados',async()=>{
  const token=await signToken({sub:'id-123',role:'admin',exp:Date.now()+60000},secret);
  assert.equal(await verifyToken(token+'X',secret),null);
  const expired=await signToken({sub:'id-123',role:'admin',exp:Date.now()-1000},secret);
  assert.equal(await verifyToken(expired,secret),null);
});

test('hash com salt por conta e verificação de senha', async () => {
  const one = await hashPassword('senha-de-teste-123');
  const two = await hashPassword('senha-de-teste-123');
  assert.match(one, /^pbkdf2_sha256\$310000\$/);
  assert.notEqual(one, two, 'salts individuais');
  assert.equal(await verifyPassword('senha-de-teste-123', one), true);
  assert.equal(await verifyPassword('errada', one), false);
  assert.equal(await verifyPassword('senha-de-teste-123', two), true);
});
test('hash SHA-256 legado funciona durante migração e novas senhas fracas são rejeitadas', async () => {
  const legacy = await sha256('antiga123');
  assert.equal(isLegacyPasswordHash(legacy), true);
  assert.equal(await verifyPassword('antiga123', legacy), true);
  assert.equal(await verifyPassword('errada123', legacy), false);
  await assert.rejects(() => hashPassword('1234567'));
});
test('token sem expiração não é aceito', async () => {
  const missing = await signToken({ sub: 'id-123', role: 'student' }, secret);
  assert.equal(await verifyToken(missing, secret), null);
});
