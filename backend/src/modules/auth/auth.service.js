const { adminAuth } = require('../../config/firebase');

const apiKey = process.env.FIREBASE_WEB_API_KEY || 'AIzaSyDIdGSzIPL_j6iIxsYt9JV-2ZJMYqFaZ98';
const projectId = process.env.FIREBASE_PROJECT_ID || 'enfield-royal-app';

function authError(code) {
  const error = new Error('Something went wrong. Please try again.');
  error.status = 401;

  if (code === 'INVALID_EMAIL') {
    error.message = 'Enter a valid email address.';
    error.status = 400;
  } else if (code === 'MISSING_PASSWORD') {
    error.message = 'Enter your password.';
    error.status = 400;
  } else if (String(code).startsWith('WEAK_PASSWORD')) {
    error.message = 'Use a password of at least 6 characters.';
    error.status = 400;
  } else if (code === 'EMAIL_EXISTS' || code === 'INVALID_PASSWORD' || code === 'INVALID_LOGIN_CREDENTIALS') {
    error.message = 'Email or password is incorrect.';
  } else if (code === 'USER_DISABLED') {
    error.message = 'This account has been disabled.';
  } else if (code === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
    error.message = 'Too many attempts. Try again in a few minutes.';
  }

  return error;
}

async function firebasePassword(method, email, password) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw authError(data?.error?.message || 'UNKNOWN');
  }
  return {
    uid: data.localId,
    email: data.email,
    idToken: data.idToken,
  };
}

async function saveUser(user) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}` +
    `/databases/(default)/documents/users/${user.uid}` +
    '?updateMask.fieldPaths=email&updateMask.fieldPaths=lastLoginAt';

  await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${user.idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        email: { stringValue: user.email },
        lastLoginAt: { timestampValue: new Date().toISOString() },
      },
    }),
  }).catch(() => {});
}

async function loginWithEmail(email, password) {
  let user;
  try {
    user = await firebasePassword('signInWithPassword', email, password);
  } catch (error) {
    if (error.message !== 'Email or password is incorrect.') {
      throw error;
    }
    try {
      user = await firebasePassword('signUp', email, password);
    } catch (createError) {
      if (createError.message === 'Email or password is incorrect.') {
        throw error;
      }
      throw createError;
    }
  }

  await saveUser(user);
  return { uid: user.uid, email: user.email };
}

async function openSession(idToken) {
  const decoded = await adminAuth().verifyIdToken(idToken);
  return {
    uid: decoded.uid,
    email: decoded.email || '',
  };
}

module.exports = { openSession, loginWithEmail };
