import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDCN73HVkPbWObNdufQlwDqOsz02GW9gJA',
  authDomain: 'street-bite-0.firebaseapp.com',
  projectId: 'street-bite-0',
  storageBucket: 'street-bite-0.firebasestorage.app',
  messagingSenderId: '583874633047',
  appId: '1:583874633047:web:26e2f10e10d7ed36137212',
  measurementId: 'G-27HZY7TY3C',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export const analyticsPromise = isSupported().then((supported) => {
  if (!supported || typeof window === 'undefined') {
    return null;
  }
  return getAnalytics(firebaseApp);
});
