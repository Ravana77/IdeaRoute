'use client';

import React, { useState, useEffect } from 'react';
import { useIdea } from '@/context/IdeaContext';
import { useAuth } from '@/context/AuthContext';
import styles from './TimePlanner.module.css';

interface TimePlannerProps {
  onClose: () => void;
}

interface Phase {
  name: string;
  tasks: string[];
}

const TimePlanner: React.FC<TimePlannerProps> = ({ onClose }) => {
  const { ideas } = useIdea();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'waterfall' | 'agile' | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);

  useEffect(() => {
    if (!user) throw new Error('User not authenticated');
    if (!ideas || ideas.length === 0) console.warn('No ideas loaded');
  }, [ideas, user]);

  const generateWaterfall = () => {
    const idea = ideas[0];
    const phases: Phase[] = [
      { name: 'Planning Phase', tasks: ['Requirement gathering', 'Feasibility study'] },
      { name: 'Design Phase', tasks: ['System & UI design mockups'] },
      { name: 'Development Phase', tasks: Object.values(idea.tasks) }, // actual dev tasks
      { name: 'Testing Phase', tasks: ['Functional testing', 'Bug fixing'] },
      { name: 'Deployment Phase', tasks: ['Release to production', 'Post-deployment checks'] }
    ];
    setPhases(phases);
  };

  const generateAgile = () => {
    const idea = ideas[0];
    // Simplified 10 sprints
    const sprintTasks = Object.values(idea.tasks);
    const phases: Phase[] = [
      { name: 'Sprint 1 - Planning', tasks: ['Plan backlog, define priorities'] },
      { name: 'Sprint 2 - Development', tasks: sprintTasks.slice(0, 2) },
      { name: 'Sprint 3 - Development', tasks: sprintTasks.slice(2, 3) },
      { name: 'Sprint 4 - Development', tasks: sprintTasks.slice(3, 4) },
      { name: 'Sprint 5 - Development', tasks: sprintTasks.slice(4, 5) },
      { name: 'Sprint 6 - Development', tasks: sprintTasks.slice(5, 6) },
      { name: 'Sprint 7 - Development', tasks: sprintTasks.slice(6, 7) },
      { name: 'Sprint 8 - Development', tasks: sprintTasks.slice(7, 8) },
      { name: 'Sprint 9 - Testing', tasks: ['Test implemented features', 'Fix bugs'] },
      { name: 'Sprint 10 - Finalization & Deployment', tasks: ['Finalize app', 'Deploy to production'] },
    ];
    const updatedPhases = phases.map(phase => ({
      ...phase,
      tasks: phase.tasks.length === 0 ? ['Buffer'] : phase.tasks
    }));
    setPhases(updatedPhases);
  };

  const handleTabClick = (tab: 'waterfall' | 'agile') => {
    setActiveTab(tab);
    if (tab === 'waterfall') generateWaterfall();
    else generateAgile();
  };

  if (!user || !ideas || ideas.length === 0) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 className={styles.title}>Time Planner</h2>
            <button onClick={onClose} className={styles.closeButton}>✕</button>
          </div>
          <div className={styles.content}>
            <p>No idea loaded or user not authenticated</p>
          </div>
        </div>
      </div>
    );
  }

  const idea = ideas[0];

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.icon}>⏰</span> {idea.idea_name}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>✕</button>
        </div>

        <div className={styles.content}>
          <div className={styles.tabButtons}>
            {activeTab !== 'waterfall' && (
              <button onClick={() => handleTabClick('waterfall')} className={styles.addButton}>
                Show Waterfall
              </button>
            )}
            {activeTab !== 'agile' && (
              <button onClick={() => handleTabClick('agile')} className={styles.addButton}>
                Show Agile
              </button>
            )}
          </div>

          {activeTab && (
            <div className={styles.phasesContainer}>
              {phases.map((phase, index) => (
                <div key={index} className={styles.phaseCard}>
                  <h3 className={styles.phaseTitle}>{phase.name}</h3>
                  <ul className={styles.taskList}>
                    {phase.tasks.map((task, idx) => (
                      <li key={idx} className={styles.taskItem}>{task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimePlanner;
