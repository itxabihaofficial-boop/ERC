const { readIdToken, readLogin } = require('./auth.validator');
const { openSession, loginWithEmail } = require('./auth.service');
const { loginPage, signedInPage } = require('./auth.page');

async function postSession(req, res) {
  const idToken = readIdToken(req.get('authorization'));
  if (!idToken) {
    return res.status(400).json({ error: 'Sign in with email and password first.' });
  }

  try {
    const user = await openSession(idToken);
    return res.json({ user });
  } catch (error) {
    req.log.error({ err: error }, 'session verification failed');
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
}

async function getMe(req, res) {
  return res.json({ user: req.user });
}

function wantsPage(req) {
  return req.is('application/x-www-form-urlencoded') || (req.get('accept') || '').includes('text/html');
}

async function postLogin(req, res) {
  const login = readLogin(req.body);
  if (login.error) {
    if (wantsPage(req)) {
      return res.status(400).type('html').send(loginPage({ error: login.error }));
    }
    return res.status(400).json({ error: login.error });
  }

  try {
    const user = await loginWithEmail(login.email, login.password);
    if (wantsPage(req)) {
      return res.type('html').send(signedInPage(user.email));
    }
    return res.json({ user });
  } catch (error) {
    const status = error.status || 401;
    if (wantsPage(req)) {
      return res.status(status).type('html').send(loginPage({ error: error.message }));
    }
    return res.status(status).json({ error: error.message });
  }
}

module.exports = { postSession, getMe, postLogin, loginPage };
