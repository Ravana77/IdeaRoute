'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Idea, IdeaContextType } from '@/types/idea';
import { useNotifications } from '@/hooks/useNotifications';

const IdeaContext = createContext<IdeaContextType | undefined>(undefined);

interface IdeaProviderProps {
    children: ReactNode;
}

export const IdeaProvider: React.FC<IdeaProviderProps> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [ideas, setIdeas] = useState<Idea[]>([]); // Initialize empty, load on client
    const { showSuccess, showError, showWarning } = useNotifications();


    // Load ideas from localStorage on mount

    useEffect(() => {
        // Only run on client-side
        if (typeof window !== 'undefined') {
            setLoading(true);
            try {
                const storedIdeas = localStorage.getItem('project-ideas');
                if (storedIdeas) {
                    const parsedIdeas = JSON.parse(storedIdeas);
                    const ideasWithDates = parsedIdeas.map((idea: any) => ({
                        ...idea,
                        createdAt: idea.createdAt ? new Date(idea.createdAt) : new Date(),
                        updatedAt: idea.updatedAt ? new Date(idea.updatedAt) : new Date(),
                    }));
                    setIdeas(ideasWithDates);
                }
            } catch (err) {
                setError('Failed to load ideas from storage');
                showError('Error', 'Failed to load ideas from storage');
                console.error('Error loading ideas:', err);
            } finally {
                setLoading(false);
            }
        }
    }, []);

    const saveIdeasToStorage = useCallback(() => {
        try {
            // Remove existing to ensure clean overwrite
            if (localStorage.getItem('project-ideas') && ideas.length > 0) {
                localStorage.removeItem('project-ideas');
            }
            localStorage.setItem('project-ideas', JSON.stringify(ideas));
            showSuccess('Success', 'Project idea saved successfully!');
        } catch (err) {
            setError('Failed to save project idea to storage');
            showError('Error', 'Failed to save project idea to storage');
            console.error('Error saving project idea:', err);
        }
    }, [ideas, showError]);

    // Automatically save ideas to localStorage when they change
    useEffect(() => {
        saveIdeasToStorage();
    }, [ideas, saveIdeasToStorage]);

    const addIdea = useCallback((ideaData: Omit<Idea, 'id'>) => {
        try {
            const newIdea: Idea = {
                ...ideaData,
                id: Date.now().toString(), // ensure it has an ID
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Replace the array with only the latest idea
            setIdeas([newIdea]);

            showSuccess('Success', 'Idea added successfully!');
        } catch (err) {
            setError('Failed to add idea');
            showError('Error', 'Failed to add idea');
        }
    }, [showSuccess, showError]);

    const updateIdea = useCallback((id: string, updatedIdea: Partial<Idea>) => {
        try {
            setIdeas(prev => prev.map(idea =>
                idea.id === id
                    ? { ...idea, ...updatedIdea, updatedAt: new Date() }
                    : idea
            ));

            showSuccess('Success', 'Idea updated successfully!');
        } catch (err) {
            setError('Failed to update idea');
            showError('Error', 'Failed to update idea');
        }
    }, [showSuccess, showError]);

    const deleteIdea = useCallback((id: string) => {
        try {
            const ideaToDelete = ideas.find(idea => idea.id === id);

            showWarning(
                'Confirm Deletion',
                `Are you sure you want to delete "${ideaToDelete?.idea_name}"? This action cannot be undone.`
            ).then((result) => {
                if (result.isConfirmed) {
                    setIdeas(prev => prev.filter(idea => idea.id !== id));
                    showSuccess('Success', 'Idea deleted successfully!');
                }
            });
        } catch (err) {
            setError('Failed to delete idea');
            showError('Error', 'Failed to delete idea');
        }
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