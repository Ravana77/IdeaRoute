'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Idea, IdeaContextType } from '@/types/idea';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/AuthContext';
import { firebaseService } from '@/services/firebaseService';

const IdeaContext = createContext<IdeaContextType | undefined>(undefined);

interface IdeaProviderProps {
    children: ReactNode;
}

export const IdeaProvider: React.FC<IdeaProviderProps> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const { showSuccess, showError, showWarning } = useNotifications();
    const { user } = useAuth();

    // Load ideas from Firestore when user changes
    useEffect(() => {
        loadIdeas();
    }, [user]);

    const loadIdeas = useCallback(async () => {
        if (!user) {
            setIdeas([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const userIdeas = await firebaseService.getUserIdeas(user.uid);
            setIdeas(userIdeas);
        } catch (err) {
            console.error('Error loading ideas from Firestore:', err);
            setError('Failed to load ideas');
            showError('Error', 'Failed to load ideas from server');
            setIdeas([]); // Set empty array instead of trying localStorage
        } finally {
            setLoading(false);
        }
    }, [user, showError]);

    const addIdea = useCallback(async (ideaData: Omit<Idea, 'id'>) => {
        if (!user) {
            showError('Error', 'You must be logged in to save ideas');
            return;
        }

        setLoading(true);
        try {
            const newIdea: Idea = {
                ...ideaData,
                id: '', // Firestore will generate ID
                user_id: user.uid,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Save to Firestore
            const firestoreId = await firebaseService.saveIdea(newIdea);
            
            // Update with Firestore ID
            const savedIdea: Idea = {
                ...newIdea,
                id: firestoreId
            };

            setIdeas(prev => [savedIdea, ...prev]);
            showSuccess('Success', 'Idea added successfully!');
        } catch (err) {
            console.error('Error adding idea:', err);
            setError('Failed to add idea');
            showError('Error', 'Failed to save idea');
        } finally {
            setLoading(false);
        }
    }, [user, showSuccess, showError]);

    const updateIdea = useCallback(async (id: string, updatedIdea: Partial<Idea>) => {
        setLoading(true);
        try {
            // Update in Firestore
            await firebaseService.updateIdea(id, updatedIdea);

            // Update local state
            setIdeas(prev => prev.map(idea =>
                idea.id === id
                    ? { ...idea, ...updatedIdea, updatedAt: new Date() }
                    : idea
            ));

            showSuccess('Success', 'Idea updated successfully!');
        } catch (err) {
            console.error('Error updating idea:', err);
            setError('Failed to update idea');
            showError('Error', 'Failed to update idea');
        } finally {
            setLoading(false);
        }
    }, [showSuccess, showError]);

    const deleteIdea = useCallback(async (id: string) => {
        const ideaToDelete = ideas.find(idea => idea.id === id);

        showWarning(
            'Confirm Deletion',
            `Are you sure you want to delete "${ideaToDelete?.idea_name}"? This action cannot be undone.`
        ).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                try {
                    // Delete from Firestore
                    await firebaseService.deleteIdea(id);

                    // Update local state
                    setIdeas(prev => prev.filter(idea => idea.id !== id));
                    showSuccess('Success', 'Idea deleted successfully!');
                } catch (err) {
                    console.error('Error deleting idea:', err);
                    setError('Failed to delete idea');
                    showError('Error', 'Failed to delete idea');
                } finally {
                    setLoading(false);
                }
            }
        });
    }, [ideas, showWarning, showSuccess, showError]);

    const clearError = () => setError(null);

    const value: IdeaContextType = {
        ideas,
        addIdea,
        updateIdea,
        deleteIdea,
        loading,
        error,
        clearError
    };

    return (
        <IdeaContext.Provider value={value}>
            {children}
        </IdeaContext.Provider>
    );
};

export const useIdea = (): IdeaContextType => {
    const context = useContext(IdeaContext);
    if (context === undefined) {
        throw new Error('useIdea must be used within an IdeaProvider');
    }
    return context;
};