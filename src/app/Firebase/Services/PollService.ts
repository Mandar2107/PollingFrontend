import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, deleteDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface PollOption {
  text: string;
  voteCount: number;
}

export interface Poll {
  id?: string;
  question: string;
  createdAt: Date;
  expiresAt?: Date;
  options: PollOption[];
  totalVotes: number;
}

@Injectable({
  providedIn: 'root'
})
export class FirebasePollService {
  constructor(private firestore: Firestore) {}

  private get pollsRef() {
    return collection(this.firestore, 'polls');
  }

  // Create poll
  createPoll(poll: Poll): Promise<any> {
    return addDoc(this.pollsRef, { ...poll, createdAt: new Date() });
  }

  // Get all polls
  getPolls(): Observable<Poll[]> {
    return collectionData(this.pollsRef, { idField: 'id' }) as Observable<Poll[]>;
  }

  // Get poll by id
  getPollById(id: string): Promise<Poll | undefined> {
    const docRef = doc(this.firestore, `polls/${id}`);
    return getDoc(docRef).then(snap =>
      snap.exists() ? ({ id: snap.id, ...snap.data() } as Poll) : undefined
    );
  }

  // Update poll (e.g., voting)
  updatePoll(id: string, data: Partial<Poll>): Promise<void> {
    const docRef = doc(this.firestore, `polls/${id}`);
    return updateDoc(docRef, data);
  }

  // Delete poll
  deletePoll(id: string): Promise<void> {
    const docRef = doc(this.firestore, `polls/${id}`);
    return deleteDoc(docRef);
  }
}
