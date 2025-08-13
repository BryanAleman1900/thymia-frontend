import { Injectable, OnDestroy } from '@angular/core';
import { doc, serverTimestamp, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

@Injectable({ providedIn: 'root' })
export class PresenceService implements OnDestroy {
  private timer: any;

  start(userId: number, intervalMs = 10_000) {
    this.stop();

    this.beat(userId);

    this.timer = setInterval(() => this.beat(userId), intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async beat(userId: number) {
    const ref = doc(db, 'presence', String(userId));
    await setDoc(ref, { lastActive: serverTimestamp() }, { merge: true });
  }

  watch(userId: number, onChange: (lastActive: Date | null) => void) {
    const ref = doc(db, 'presence', String(userId));
    return onSnapshot(ref, (snap) => {
      const data: any = snap.data();
      const ts = data?.lastActive?.toDate ? data.lastActive.toDate() : null;
      onChange(ts);
    });
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
