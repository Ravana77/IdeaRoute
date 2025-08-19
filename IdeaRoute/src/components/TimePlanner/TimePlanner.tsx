'use client';

import React, { useState, useEffect } from 'react';
import { STORAGE_KEYS, TIME_BLOCK_CATEGORIES, SDLC_PHASES } from '@/constants';
import styles from './TimePlanner.module.css';
import { saveAs } from 'file-saver';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface TimeBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
}

interface ProjectPlan {
  id: string;
  name: string;
  durationWeeks: number;
  startDate: string;
  phases: {
    name: string;
    weeks: number;
    tasks: string[];
  }[];
  createdAt: Date;
}

interface TimePlannerProps {
  onClose: () => void;
}

const TimePlanner: React.FC<TimePlannerProps> = ({ onClose }) => {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [projectPlans, setProjectPlans] = useState<ProjectPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'daily' | 'project'>('daily');
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBlock, setNewBlock] = useState({
    title: '',
    startTime: '',
    endTime: '',
    category: 'work',
    description: ''
  });
  const [newProject, setNewProject] = useState({
    name: '',
    durationWeeks: 4,
    startDate: new Date().toISOString().split('T')[0]
  });

  const categories = TIME_BLOCK_CATEGORIES;

  // Load data from localStorage
  useEffect(() => {
    const savedBlocks = localStorage.getItem(STORAGE_KEYS.TIME_PLANNER_BLOCKS);
    const savedProjects = localStorage.getItem(STORAGE_KEYS.TIME_PLANNER_PROJECTS);
    
    if (savedBlocks) {
      try {
        const parsed = JSON.parse(savedBlocks);
        setTimeBlocks(parsed.map((block: any) => ({
          ...block,
          createdAt: new Date(block.createdAt)
        })));
      } catch (error) {
        console.error('Error loading time blocks:', error);
      }
    }
    
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        setProjectPlans(parsed.map((project: any) => ({
          ...project,
          createdAt: new Date(project.createdAt),
          phases: project.phases || []
        })));
      } catch (error) {
        console.error('Error loading project plans:', error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIME_PLANNER_BLOCKS, JSON.stringify(timeBlocks));
    localStorage.setItem(STORAGE_KEYS.TIME_PLANNER_PROJECTS, JSON.stringify(projectPlans));
  }, [timeBlocks, projectPlans]);

  // Time Block Functions
  const addTimeBlock = () => {
    if (!newBlock.title.trim() || !newBlock.startTime || !newBlock.endTime) return;

    const block: TimeBlock = {
      id: Date.now().toString(),
      title: newBlock.title.trim(),
      startTime: newBlock.startTime,
      endTime: newBlock.endTime,
      category: newBlock.category,
      description: newBlock.description.trim(),
      completed: false,
      createdAt: new Date()
    };

    setTimeBlocks(prev => [...prev, block].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    ));

    resetNewBlockForm();
    setIsAddingBlock(false);
  };

  const resetNewBlockForm = () => {
    setNewBlock({
      title: '',
      startTime: '',
      endTime: '',
      category: 'work',
      description: ''
    });
  };

  const toggleBlockCompletion = (id: string) => {
    setTimeBlocks(prev => 
      prev.map(block => 
        block.id === id ? { ...block, completed: !block.completed } : block
      )
    );
  };

  const deleteBlock = (id: string) => {
    setTimeBlocks(prev => prev.filter(block => block.id !== id));
  };

  // Project Plan Functions
  const generateSDLCPlan = (durationWeeks: number) => {
    const totalPhases = SDLC_PHASES.length;
    const baseWeeks = Math.floor(durationWeeks / totalPhases);
    let remainingWeeks = durationWeeks % totalPhases;
    
    return SDLC_PHASES.map((phase, index) => {
      // Give more weeks to implementation and testing phases
      let weeks = baseWeeks;
      if (phase.name === 'Implementation' || phase.name === 'Testing') {
        weeks += 1;
        remainingWeeks -= 1;
      }
      
      // Distribute any remaining weeks
      if (remainingWeeks > 0 && index === SDLC_PHASES.length - 1) {
        weeks += remainingWeeks;
      }
      
      return {
        name: phase.name,
        weeks: Math.max(1, weeks), // Ensure at least 1 week per phase
        tasks: phase.tasks
      };
    });
  };

  const addProjectPlan = () => {
    if (!newProject.name.trim() || newProject.durationWeeks < 1) return;

    const phases = generateSDLCPlan(newProject.durationWeeks);
    
    const project: ProjectPlan = {
      id: Date.now().toString(),
      name: newProject.name.trim(),
      durationWeeks: newProject.durationWeeks,
      startDate: newProject.startDate,
      phases,
      createdAt: new Date()
    };

    setProjectPlans(prev => [...prev, project]);
    resetNewProjectForm();
    setIsAddingProject(false);
  };

  const resetNewProjectForm = () => {
    setNewProject({
      name: '',
      durationWeeks: 4,
      startDate: new Date().toISOString().split('T')[0]
    });
  };

  const deleteProject = (id: string) => {
    setProjectPlans(prev => prev.filter(project => project.id !== id));
  };

  // Utility Functions
  const getCurrentTimeBlocks = () => {
    return timeBlocks.filter(block => {
      const blockDate = new Date(block.createdAt).toISOString().split('T')[0];
      return blockDate === selectedDate;
    });
  };

  const formatTime = (time: string) => {
    const date = new Date(`2000-01-01T${time}`);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryInfo = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue) || categories[0];
  };

  const getTimeProgress = () => {
    const currentBlocks = getCurrentTimeBlocks();
    const completedCount = currentBlocks.filter(block => block.completed).length;
    return {
      completed: completedCount,
      total: currentBlocks.length,
      percentage: currentBlocks.length > 0 ? Math.round((completedCount / currentBlocks.length) * 100) : 0
    };
  };

  // Export Functions
  const exportProjectToCSV = (project: ProjectPlan) => {
    const headers = ['Phase', 'Weeks', 'Tasks'];
    const csvRows = [
      headers.join(','),
      ...project.phases.flatMap(phase => [
        `"${phase.name}"`,
        phase.weeks,
        `"${phase.tasks.join('; ')}"`
      ].join(','))
    ];
    
    const csvContent = `Project: ${project.name}\nDuration: ${project.durationWeeks} weeks\nStart Date: ${project.startDate}\n\n${csvRows.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${project.name.replace(/[^a-z0-9]/gi, '_')}_plan.csv`);
  };

  const exportProjectToPDF = async (project: ProjectPlan) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let y = height - 50;
    
    // Title
    page.drawText(project.name, {
      x: 50,
      y,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    y -= 30;
    
    // Metadata
    page.drawText(`Duration: ${project.durationWeeks} weeks | Start Date: ${project.startDate}`, {
      x: 50,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0)
    });
    y -= 40;
    
    // Phases
    page.drawText('Project Plan:', {
      x: 50,
      y,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    y -= 30;
    
    for (const phase of project.phases) {
      // Phase header
      page.drawText(`${phase.name} (${phase.weeks} week${phase.weeks > 1 ? 's' : ''})`, {
        x: 50,
        y,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0.5)
      });
      y -= 20;
      
      // Tasks
      for (const task of phase.tasks) {
        if (y < 50) {
          page = pdfDoc.addPage([600, 800]);
          y = height - 50;
        }
        
        page.drawText(`• ${task}`, {
          x: 60,
          y,
          size: 12,
          font,
          color: rgb(0, 0, 0)
        });
        y -= 20;
      }
      
      y -= 10;
    }
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, `${project.name.replace(/[^a-z0-9]/gi, '_')}_plan.pdf`);
  };

  const progress = getTimeProgress();
  const currentBlocks = getCurrentTimeBlocks();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.icon}>⏰</span>
            Time Planner
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === 'daily' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            Daily Planner
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'project' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('project')}
          >
            Project Planner
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'daily' ? (
            <>
              <div className={styles.controls}>
                <div className={styles.dateSection}>
                  <label htmlFor="date-selector" className={styles.label}>
                    Select Date:
                  </label>
                  <input
                    id="date-selector"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={styles.dateInput}
                  />
                </div>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>{progress.completed}</span>
                    <span className={styles.statLabel}>Completed</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>{progress.total - progress.completed}</span>
                    <span className={styles.statLabel}>Remaining</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>{progress.percentage}%</span>
                    <span className={styles.statLabel}>Progress</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddingBlock(true)}
                  className={styles.addButton}
                >
                  <span>+</span>
                  Add Time Block
                </button>
              </div>

              {isAddingBlock && (
                <div className={styles.addForm}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Title *</label>
                      <input
                        type="text"
                        value={newBlock.title}
                        onChange={(e) => setNewBlock(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Team Meeting"
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Category</label>
                      <select
                        value={newBlock.category}
                        onChange={(e) => setNewBlock(prev => ({ ...prev, category: e.target.value }))}
                        className={styles.select}
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Start Time *</label>
                      <input
                        type="time"
                        value={newBlock.startTime}
                        onChange={(e) => setNewBlock(prev => ({ ...prev, startTime: e.target.value }))}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>End Time *</label>
                      <input
                        type="time"
                        value={newBlock.endTime}
                        onChange={(e) => setNewBlock(prev => ({ ...prev, endTime: e.target.value }))}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Description (Optional)</label>
                    <textarea
                      value={newBlock.description}
                      onChange={(e) => setNewBlock(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Additional details..."
                      className={styles.textarea}
                      rows={2}
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button
                      onClick={() => {
                        setIsAddingBlock(false);
                        resetNewBlockForm();
                      }}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addTimeBlock}
                      className={styles.saveButton}
                      disabled={!newBlock.title.trim() || !newBlock.startTime || !newBlock.endTime}
                    >
                      Add Block
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.blocksSection}>
                <h3 className={styles.sectionTitle}>
                  Schedule for {new Date(selectedDate).toLocaleDateString()}
                </h3>

                {currentBlocks.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📅</div>
                    <p className={styles.emptyText}>
                      No time blocks scheduled for this date. Add your first block above!
                    </p>
                  </div>
                ) : (
                  <div className={styles.blocksList}>
                    {currentBlocks.map(block => {
                      const categoryInfo = getCategoryInfo(block.category);
                      return (
                        <div 
                          key={block.id} 
                          className={`${styles.timeBlock} ${block.completed ? styles.completed : ''}`}
                          style={{ '--category-color': categoryInfo.color } as React.CSSProperties}
                        >
                          <div className={styles.blockTime}>
                            <span className={styles.timeRange}>
                              {formatTime(block.startTime)} - {formatTime(block.endTime)}
                            </span>
                            <div className={styles.categoryBadge}>
                              <span className={styles.categoryIcon}>{categoryInfo.icon}</span>
                              <span className={styles.categoryName}>{categoryInfo.label}</span>
                            </div>
                          </div>
                          
                          <div className={styles.blockContent}>
                            <div className={styles.blockHeader}>
                              <h4 className={styles.blockTitle}>{block.title}</h4>
                              <div className={styles.blockActions}>
                                <button
                                  onClick={() => toggleBlockCompletion(block.id)}
                                  className={styles.completeButton}
                                  title={block.completed ? 'Mark as incomplete' : 'Mark as complete'}
                                >
                                  {block.completed ? '✓' : '○'}
                                </button>
                                <button
                                  onClick={() => deleteBlock(block.id)}
                                  className={styles.deleteButton}
                                  title="Delete block"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                            
                            {block.description && (
                              <p className={styles.blockDescription}>{block.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className={styles.controls}>
                <button
                  onClick={() => setIsAddingProject(true)}
                  className={styles.addButton}
                >
                  <span>+</span>
                  Create New Project Plan
                </button>
              </div>

              {isAddingProject && (
                <div className={styles.addForm}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Project Name *</label>
                      <input
                        type="text"
                        value={newProject.name}
                        onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Website Redesign"
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Start Date</label>
                      <input
                        type="date"
                        value={newProject.startDate}
                        onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Duration (weeks) *</label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={newProject.durationWeeks}
                      onChange={(e) => setNewProject(prev => ({ ...prev, durationWeeks: parseInt(e.target.value) || 1 }))}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.previewSection}>
                    <h4 className={styles.previewTitle}>Project Plan Preview</h4>
                    {newProject.durationWeeks > 0 && (
                      <div className={styles.planPreview}>
                        {generateSDLCPlan(newProject.durationWeeks).map((phase, index) => (
                          <div key={index} className={styles.phasePreview}>
                            <div className={styles.phaseHeader}>
                              <span className={styles.phaseName}>{phase.name}</span>
                              <span className={styles.phaseWeeks}>{phase.weeks} week{phase.weeks !== 1 ? 's' : ''}</span>
                            </div>
                            <ul className={styles.phaseTasks}>
                              {phase.tasks.map((task, taskIndex) => (
                                <li key={taskIndex}>{task}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.formActions}>
                    <button
                      onClick={() => {
                        setIsAddingProject(false);
                        resetNewProjectForm();
                      }}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addProjectPlan}
                      className={styles.saveButton}
                      disabled={!newProject.name.trim() || newProject.durationWeeks < 1}
                    >
                      Create Project Plan
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.blocksSection}>
                <h3 className={styles.sectionTitle}>
                  Your Project Plans
                </h3>

                {projectPlans.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📋</div>
                    <p className={styles.emptyText}>
                      No project plans yet. Create your first plan above!
                    </p>
                  </div>
                ) : (
                  <div className={styles.projectList}>
                    {projectPlans.map(project => (
                      <div key={project.id} className={styles.projectCard}>
                        <div className={styles.projectHeader}>
                          <h4 className={styles.projectName}>{project.name}</h4>
                          <div className={styles.projectMeta}>
                            <span>{project.durationWeeks} weeks</span>
                            <span>Starts: {project.startDate}</span>
                          </div>
                          <div className={styles.projectActions}>
                            <button
                              onClick={() => exportProjectToCSV(project)}
                              className={styles.exportButton}
                              title="Export to CSV"
                            >
                              CSV
                            </button>
                            <button
                              onClick={() => exportProjectToPDF(project)}
                              className={styles.exportButton}
                              title="Export to PDF"
                            >
                              PDF
                            </button>
                            <button
                              onClick={() => deleteProject(project.id)}
                              className={styles.deleteButton}
                              title="Delete project"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        
                        <div className={styles.projectPhases}>
                          {project.phases.map((phase, index) => (
                            <div key={index} className={styles.projectPhase}>
                              <div className={styles.phaseHeader}>
                                <h5 className={styles.phaseName}>{phase.name}</h5>
                                <span className={styles.phaseDuration}>{phase.weeks} week{phase.weeks !== 1 ? 's' : ''}</span>
                              </div>
                              <ul className={styles.phaseTasks}>
                                {phase.tasks.map((task, taskIndex) => (
                                  <li key={taskIndex}>{task}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimePlanner;