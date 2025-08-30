import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, canUseFirestore } from '../lib/firebase';

export interface ChecklistData {
  user_id: string;
  items: any[];
  notes: string;
  completedCount: number;
  totalCount: number;
  passCount: number;
  failCount: number;
  passRate: number;
  lastSaved: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const checklistService = {
 
  async saveChecklist(userId: string, checklistData: Omit<ChecklistData, 'user_id'>): Promise<void> {
    if (!canUseFirestore()) {
      throw new Error('Firestore not available');
    }

    try {
      const checklistRef = doc(db, 'checklists', userId);
      
      await setDoc(checklistRef, {
        ...checklistData,
        user_id: userId, 
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }, { merge: true });

    } catch (error) {
      console.error('Error saving checklist to Firestore:', error);
      throw error;
    }
  },

 
  async getChecklist(userId: string): Promise<ChecklistData | null> {
    if (!canUseFirestore()) {
      return null;
    }

    try {
      const checklistRef = doc(db, 'checklists', userId);
      const checklistDoc = await getDoc(checklistRef);

      if (checklistDoc.exists()) {
        const data = checklistDoc.data();
        return {
          user_id: data.user_id,
          items: data.items || [],
          notes: data.notes || '',
          completedCount: data.completedCount || 0,
          totalCount: data.totalCount || 0,
          passCount: data.passCount || 0,
          failCount: data.failCount || 0,
          passRate: data.passRate || 0,
          lastSaved: data.lastSaved?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting checklist from Firestore:', error);
      return null;
    }
  },

  
  async deleteChecklist(userId: string): Promise<void> {
    if (!canUseFirestore()) {
      throw new Error('Firestore not available');
    }

    try {
      const checklistRef = doc(db, 'checklists', userId);
      await deleteDoc(checklistRef);
    } catch (error) {
      console.error('Error deleting checklist from Firestore:', error);
      throw error;
    }
  }
};