export interface Idea {
    id?: string;
    idea_name: string;
    description: string;
    platform: string;
    status: string;
    user_id: string;
    createdAt: Date;
    updatedAt: Date;
    tasks: { [sprint: string]: string };
    waterfall: string[];
    agile: string[];
}

export interface IdeaContextType {
    ideas: Idea[];
    addIdea: (ideaData: Omit<Idea, 'id'>) => void;
    updateIdea: (id: string, updatedIdea: Partial<Idea>) => void;
    deleteIdea: (id: string) => void;
    loading: boolean;
    error: string | null;
    clearError: () => void;
}
