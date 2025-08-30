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
  const [timeValue, setTimeValue] = useState<number | ''>('');
  const [timeUnit, setTimeUnit] = useState<'days' | 'weeks' | 'months'>('weeks');


  useEffect(() => {
    if (!user) throw new Error('User not authenticated');
    if (!ideas || ideas.length === 0) console.warn('No ideas loaded');
  }, [ideas, user]);

  const generateWaterfall = () => {
    const idea = ideas[ideas.length - 1];
    const rawPercentages = [0.1, 0.15, 0.45, 0.2, 0.1];
    const phases: Phase[] = [
      { name: 'Planning Phase', tasks: ['Requirement gathering', 'Feasibility study'] },
      { name: 'Design Phase', tasks: ['System & UI design mockups'] },
      { name: 'Development Phase', tasks: Object.values(idea.tasks) },
      { name: 'Testing Phase', tasks: ['Functional testing', 'Bug fixing'] },
      { name: 'Deployment Phase', tasks: ['Release to production', 'Post-deployment checks'] }
    ];

    if (timeValue !== '') {
      const totalDays = convertToDays(Number(timeValue), timeUnit);

     
      const allocated = rawPercentages.map(p => totalDays * p);

    
      let rounded = allocated.map(a => Math.max(Math.round(a), 1));

      
      let diff = totalDays - rounded.reduce((a, b) => a + b, 0);

     
      if (diff !== 0) {
        const devIndex = 2; 
        rounded[devIndex] += diff;
      }

      phases.forEach((phase, idx) => {
        phase.name += ` (${readableDays(rounded[idx])})`;
      });
    }

    setPhases(phases);
  };

 
  const convertToDays = (value: number, unit: 'days' | 'weeks' | 'months') => {
    if (unit === 'days') return value;
    if (unit === 'weeks') return value * 7;
    return value * 30;
  };

  
  const readableDays = (days: number) => {
    if (days >= 30) return `${Math.round(days / 30)} months`;
    if (days >= 7) return `${Math.round(days / 7)} weeks`;
    return `${days} days`;
  };


  const generateAgile = () => {
    const idea = ideas[ideas.length - 1];
    const devTasks = Object.values(idea.tasks);

    let sprintCount = 10;
    let sprintLength = 0;
    let remainder = 0;
    let devSprints = 0;

    if (timeValue !== '') {
      const res = getAgileSprints(Number(timeValue), timeUnit, devTasks.length);
      sprintCount = res.sprintCount;
      sprintLength = res.sprintLength;
      remainder = res.remainder;
      devSprints = res.devSprints;
    } else {
      devSprints = Math.max(1, devTasks.length); // fallback
    }

    const phases: Phase[] = [];

    for (let i = 0; i < sprintCount; i++) {
      let name = '';
      let tasks: string[] = [];

      if (i === 0) {
        name = 'Planning';
        tasks = ['Plan backlog, define priorities'];
      } else if (i === sprintCount - 2) {
        name = 'Testing';
        tasks = ['Test implemented features', 'Fix bugs'];
      } else if (i === sprintCount - 1) {
        name = 'Finalization & Deployment';
        tasks = ['Finalize app', 'Deploy to production'];
      } else {
        name = 'Development';
        const devSprintIndex = i - 1; 
        const tasksPerSprint = Math.ceil(devTasks.length / devSprints);
        const startIdx = devSprintIndex * tasksPerSprint;
        const endIdx = startIdx + tasksPerSprint;
        tasks = devTasks.slice(startIdx, endIdx);
        if (tasks.length === 0) tasks = ['Buffer'];
      }

      phases.push({
        name: name + (timeValue !== '' ? ` (${convertDuration(sprintLength, 'days')})` : ''),
        tasks
      });
    }

  
    if (remainder > 0 && phases.length > 0) {
      phases[phases.length - 1].name += ` (+${readableDays(remainder)})`;
    }

    setPhases(phases);
  };



  const convertDuration = (value: number, unit: 'days' | 'weeks' | 'months'): string => {
    let days = 0;

    if (unit === 'days') days = value;
    if (unit === 'weeks') days = value * 7;
    if (unit === 'months') days = value * 30; 

   
    if (days < 1) days = 1;

    if (days >= 30) {
      const months = (days / 30).toFixed(1);
      return `${months} months`;
    } else if (days >= 7) {
      const weeks = (days / 7).toFixed(1);
      return `${weeks} weeks`;
    } else {
      return `${Math.round(days)} days`;
    }
  };

  const getAgileSprints = (
    totalTime: number,
    unit: 'days' | 'weeks' | 'months',
    devTaskCount: number,
    maxSprints = 30 
  ) => {
    const totalDays = convertToDays(totalTime, unit);

    const minSprintLength = 1;  

   
    let sprintCount = 4;
    let devSprints = 1;

  
    const remainingDays = totalDays - 3 * minSprintLength;

   
    devSprints = Math.min(devTaskCount, remainingDays);
    if (devSprints < 1) devSprints = 1;

    sprintCount = devSprints + 3;

    
    if (sprintCount > maxSprints) {
      devSprints = maxSprints - 3;
      sprintCount = maxSprints;
    }

    const sprintLength = Math.floor(totalDays / sprintCount);
    const usedDays = sprintLength * sprintCount;
    const remainder = totalDays - usedDays;

    return { sprintCount, sprintLength, remainder, devSprints };
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

  const idea = ideas[ideas.length - 1];

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.icon}>⏰</span> {idea.idea_name}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>✕</button>
        </div>

        <div className={styles.timeInputRow}>


          <div className={styles.content}>
            <input
              type="number"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Enter duration"
              className={styles.numberInput}
            />
            <select
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value as 'days' | 'weeks' | 'months')}
              className={styles.dropdown}
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
            </select>
          </div>
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
