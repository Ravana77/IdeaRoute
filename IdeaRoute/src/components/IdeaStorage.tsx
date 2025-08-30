'use client';

import React, { useState } from 'react';
import styles from './IdeaStorage.module.css';
import { useIdea } from '@/context/IdeaContext';

interface IdeaStorageProps {
  onClose: () => void;
}

const IdeaStorage: React.FC<IdeaStorageProps> = ({ onClose }) => {
  const { ideas } = useIdea();
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIdeaId(expandedIdeaId === id ? null : id);
  };

  const formatTasks = (tasks: { [key: string]: string }) => {
    return Object.entries(tasks).map(([sprint, task]) => (
      <div key={sprint} className={styles.taskItem}>
        <strong>{sprint}:</strong> {task}
      </div>
    ));
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            <span>💡</span>
            <span>My Project Ideas</span>
          </h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </header>
        
        <div className={styles.main}>
          <div className={styles.ideasContainer}>
            {ideas.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No project ideas yet. Generate some ideas first!</p>
              </div>
            ) : (
              <div className={styles.ideasList}>
                {ideas.map((idea) => (
                  <div key={idea.id} className={styles.ideaItem}>
                    <div 
                      className={styles.ideaHeader}
                      onClick={() => toggleExpand(idea.id!)}
                    >
                      <h3 className={styles.ideaName}>{idea.idea_name}</h3>
                      <span className={styles.expandIcon}>
                        {expandedIdeaId === idea.id ? '▲' : '▼'}
                      </span>
                    </div>
                    
                    {expandedIdeaId === idea.id && (
                      <div className={styles.ideaDetails}>
                        <div className={styles.detailSection}>
                          <strong>Description:</strong>
                          <p>{idea.description}</p>
                        </div>
                        
                        <div className={styles.detailSection}>
                          <strong>Platforms:</strong>
                          <p>{idea.platform}</p>
                        </div>
                        
                        <div className={styles.detailSection}>
                          <strong>Status:</strong>
                          <span className={styles.statusBadge}>{idea.status}</span>
                        </div>
                        
                        {idea.tasks && Object.keys(idea.tasks).length > 0 && (
                          <div className={styles.detailSection}>
                            <strong>Tasks:</strong>
                            <div className={styles.tasksList}>
                              {formatTasks(idea.tasks)}
                            </div>
                          </div>
                        )}
                        
                        <div className={styles.detailSection}>
                          <strong>Created:</strong>
                          <span>{idea.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaStorage;