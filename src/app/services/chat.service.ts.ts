import { Injectable } from '@angular/core';
import {addDoc, collection, doc, setDoc, serverTimestamp, onSnapshot, orderBy, query, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';

export interface ChatMessage {
  senderId: number;
  text: string;
  createdAt: any;
}

@Injectable({ providedIn: 'root' })
export class ChatService {

  private pairId(a: number, b: number): string {
    return [a, b].sort((x, y) => x - y).join('_');
  }

  async openOrCreateConversation(currentUserId: number, otherUserId: number): Promise<string> {
    const id = this.pairId(currentUserId, otherUserId);
    const convRef = doc(db, 'conversations', id);
    await setDoc(convRef, {
      participants: [currentUserId, otherUserId].sort((x, y) => x - y),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: '',
      lastSenderId: null
    }, { merge: true });
    return id;
  }

  listenMessages(conversationId: string, onChange: (msgs: ChatMessage[]) => void): Unsubscribe {
    const msgsCol = collection(db, `conversations/${conversationId}/messages`);
    const q = query(msgsCol, orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => d.data() as ChatMessage);
      onChange(items);
    });
  }

  async sendMessage(conversationId: string, senderId: number, text: string): Promise<void> {
    const msgsCol = collection(db, `conversations/${conversationId}/messages`);
    await addDoc(msgsCol, {
      senderId,
      text,
      createdAt: serverTimestamp()
    });
    const convRef = doc(db, 'conversations', conversationId);
    await setDoc(convRef, {
      lastMessage: text,
      lastSenderId: senderId,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
}