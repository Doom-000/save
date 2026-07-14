import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function runTest() {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let uid = '';

  try {
    console.log(`[1] Testing Registration for ${testEmail}...`);
    const userCred = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    uid = userCred.user.uid;
    console.log(`✅ Registration successful. UID: ${uid}`);

    console.log(`[2] Testing Firestore Profile Creation...`);
    const profileData = {
      uid: uid,
      name: 'Test User',
      email: testEmail,
      avatar: 'avatar1'
    };
    await setDoc(doc(db, 'users', uid), profileData);
    console.log(`✅ Profile created in Firestore collection 'users'`);

    console.log(`[3] Testing Login...`);
    // Sign out first
    await auth.signOut();
    const loginCred = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log(`✅ Login successful. Logged in as: ${loginCred.user.uid}`);

    console.log(`[4] Fetching Profile after Login...`);
    const docSnap = await getDoc(doc(db, 'users', loginCred.user.uid));
    if (docSnap.exists()) {
      console.log(`✅ Profile data fetched:`, docSnap.data());
    } else {
      console.log(`❌ Profile data not found!`);
    }

    // Cleanup
    console.log(`[5] Cleaning up test data...`);
    await deleteDoc(doc(db, 'users', uid));
    await deleteUser(loginCred.user);
    console.log(`✅ Test data cleaned up.`);
    
    console.log(`\n🎉 All tests passed successfully!`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Test failed:`, error);
    process.exit(1);
  }
}

runTest();
