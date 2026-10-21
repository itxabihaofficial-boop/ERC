const admin = require('firebase-admin');

const projectId = process.env.FIREBASE_PROJECT_ID || 'enfield-royal-app';

function createAdminApp() {
  if (admin.apps.length) {
    return admin.app();
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }

  return admin.initializeApp({ projectId });
}

function adminAuth() {
  createAdminApp();
  return admin.auth();
}

module.exports = { adminAuth };
