const { z } = require('zod');

const bearerToken = z
  .string()
  .regex(/^Bearer\s+\S+$/, 'Authorization must be a Bearer token');

function readIdToken(header) {
  const parsed = bearerToken.safeParse(header || '');
  if (!parsed.success) {
    return null;
  }
  return parsed.data.replace(/^Bearer\s+/, '');
}

const loginBody = z.object({
  email: z.string().trim().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

function readLogin(body) {
  const parsed = loginBody.safeParse(body || {});
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue?.message || 'Enter your email and password.' };
  }
  return parsed.data;
}

module.exports = { readIdToken, readLogin };
