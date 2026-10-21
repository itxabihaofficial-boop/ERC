/**
 * Creates (or verifies) a Firebase Auth email/password account for local testing.
 *
 * Usage:
 *   node scripts/seed-user.js <email> <password>
 *
 * Do not commit real passwords. Pass them on the command line only.
 */
const { initializeApp } = require('firebase/app');
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} = require('firebase/auth');

const firebaseConfig = {
  apiKey: 'AIzaSyDIdGSzIPL_j6iIxsYt9JV-2ZJMYqFaZ98',
  authDomain: 'enfield-royal-app.firebaseapp.com',
  projectId: 'enfield-royal-app',
  storageBucket: 'enfield-royal-app.firebasestorage.app',
  messagingSenderId: '813358301406',
  appId: '1:813358301406:web:d55b1a925e8d68b0ea824f',
  measurementId: 'G-ZEN8K5JJ71',
};

async function main() {
  const email = (process.argv[2] || '').trim();
  const password = process.argv[3] || '';

  if (!email || !password) {
    console.error('Usage: node scripts/seed-user.js <email> <password>');
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: 'Abiha' });
    console.log(`Created user ${credential.user.uid} <${email}>`);
  } catch (error) {
    if (error?.code !== 'auth/email-already-in-use') {
      throw error;
    }

    // Account exists — confirm the given password works for Expo Go sign-in.
    const credential = await signInWithEmailAndPassword(auth, email, password);
    console.log(`User already exists; password verified for ${credential.user.uid} <${email}>`);
  }
}

main().catch((error) => {
  console.error(error?.code || error?.message || error);
  process.exit(1);
});
