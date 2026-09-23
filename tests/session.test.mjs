import test from 'node:test';
import assert from 'node:assert/strict';
import { signToken, verifyToken } from '../supabase/functions/_shared/session-tokens.ts';

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
