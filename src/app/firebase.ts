import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { environment } from '../environments/environment';

const app = initializeApp(environment.firebase);
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function initFirebaseAuth(): Promise<void> {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          await signInAnonymously(auth);
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
}