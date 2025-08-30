import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, canUseFirestore } from '../lib/firebase';
import { Idea } from '@/types/idea';

export const firebaseService = {
  
  async saveIdea(idea: Idea): Promise<string> {
    if (!canUseFirestore()) {
      throw new Error('Firestore not available');
    }

    try {
    
      const { id, ...ideaWithoutId } = idea;

      const docRef = await addDoc(collection(db, 'ideas'), {
        ...ideaWithoutId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving idea to Firestore:', error);
      throw error;
    }
  },


  async updateIdea(id: string, updatedIdea: Partial<Idea>): Promise<void> {
    if (!canUseFirestore()) {
      throw new Error('Firestore not available');
    }

    try {
      const docRef = doc(db, 'ideas', id);
      await updateDoc(docRef, {
        ...updatedIdea,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating idea in Firestore:', error);
      throw error;
    }
  },

  
  async deleteIdea(id: string): Promise<void> {
    if (!canUseFirestore()) {
      throw new Error('Firestore not available');
    }

    try {
      const docRef = doc(db, 'ideas', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting idea from Firestore:', error);
      throw error;
    }
  },

 
  async getUserIdeas(userId: string): Promise<Idea[]> {
    if (!canUseFirestore()) {
      throw new Error('Firestore not available');
    }

    try {
      const q = query(
        collection(db, 'ideas'),
        where('user_id', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const ideas: Idea[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ideas.push({
          id: doc.id,
          idea_name: data.idea_name,
          description: data.description,
          platform: data.platform,
          status: data.status,
          user_id: data.user_id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          tasks: data.tasks || {},
          waterfall: data.waterfall || [],
          agile: data.agile || []
        } as Idea);
      });

      return ideas;
    } catch (error) {
      console.error('Error getting user ideas from Firestore:', error);
      throw error;
    }
  }
};