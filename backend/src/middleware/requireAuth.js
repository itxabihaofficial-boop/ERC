const { readIdToken } = require('../modules/auth/auth.validator');
const { openSession } = require('../modules/auth/auth.service');

async function requireAuth(req, res, next) {
  const idToken = readIdToken(req.get('authorization'));
  if (!idToken) {
    return res.status(401).json({ error: 'Sign in required.' });
  }

  try {
    req.user = await openSession(idToken);
    return next();
  } catch {
    return res.status(401).json({ error: 'Sign in required.' });
  }
}

module.exports = { requireAuth };
