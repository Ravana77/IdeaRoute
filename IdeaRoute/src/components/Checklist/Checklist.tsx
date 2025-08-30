'use client';

import React, { useState, useEffect } from 'react';
import styles from './Checklist.module.css';
import { checklistService, ChecklistData } from '@/services/firebaseChecklistService';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

type StatusType = 'Pass' | 'Fail' | 'N/A';

interface ChecklistItem {
  id: string;
  section: string;
  text: string;
  completed: boolean;
  status: StatusType;
  comment: string;
  createdAt: Date;
}

interface ChecklistProps {
  onClose: () => void;
}

const defaultSections = [
  'Functional Behavior',
  'UI / Accessibility',
  'Performance',
  'Security / Data Handling',
  'Compatibility'
];

const defaultItems = [
  {
    id: '1',
    section: 'Functional Behavior',
    text: 'Buttons work as expected (click handlers fire)',
    completed: false,
    status: 'N/A',
    comment: '',
    createdAt: new Date()
  },
  {
    id: '2',
    section: 'Functional Behavior',
    text: 'Validation errors appear for invalid inputs',
    completed: false,
    status: 'N/A',
    comment: '',
    createdAt: new Date()
  },
  {
    id: '3',
    section: 'Functional Behavior',
    text: 'Submit flows complete successfully',
    completed: false,
    status: 'N/A',
    comment: '',
    createdAt: new Date()
  },
  {
    id: '4',
    section: 'UI / Accessibility',
    text: 'Visual consistency across components',
    completed: false,
    status: 'N/A',
    comment: '',
    createdAt: new Date()
  },
  {
    id: '5',
    section: 'UI / Accessibility',
    text: 'Focus indicators visible for keyboard navigation',
    completed: false,
    status: 'N/A',
    comment: '',
    createdAt: new Date()
  },
  {
    id: '6',
    section: 'UI / Accessibility',
    text: 'Alt texts present for images',
    completed: false,
    status: 'N/A',
    comment: '',
    createdAt: new Date()
  },
  {
    id: '7',
    section: 'UI / Accessibility',
    text: 'Color contrast meets WCAG standards',
    completed: false,
    status: 'N/A',
    comment: '',
    createdAt: new Date()
  },
  {
    id: '8',
    section: 'Performance',
    text: 'Page load time under 2 seconds',
    completed: false,
    status: 'N/A',
    comment: '',
    createdAt: new Date()
  },
  {
    id: '9',
    section: 'Performance',
    text: 'Responsive on all viewport sizes',
    completed: false,
    status: 'N/A',
    comment: '',
    createdAt: new Date()
  },
  {
    id: '10',
    section: 'Security / Data Handling',
    text: 'Input sanitization prevents XSS',
    completed: false,
    status: 'N/A',
    comment: '',
    createdAt: new Date()
  },
  {
    id: '11',
    section: 'Security / Data Handling',
    text: 'Form data not persisted to localStorage unnecessarily',
    completed: false,
    status: 'N/A',
    comment: '',
    createdAt: new Date()
  },
  {
    id: '12',
    section: 'Compatibility',
    text: 'Tested on latest Chrome, Firefox, Safari',
    completed: false,
    status: 'N/A',
    comment: '',
    createdAt: new Date()
  },
  {
    id: '13',
    section: 'Compatibility',
    text: 'Mobile responsive (320px - 1920px)',
    completed: false,
    status: 'N/A',
    comment: '',
    createdAt: new Date()
  }
];

const Checklist: React.FC<ChecklistProps> = ({ onClose }) => {
  const [items, setItems] = useState<ChecklistItem[]>(defaultItems);
  const [newItemText, setNewItemText] = useState('');
  const [newItemSection, setNewItemSection] = useState(defaultSections[0]);
  const [notes, setNotes] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  

 
  useEffect(() => {
    const savedItems = localStorage.getItem('qa-checklist-items');
    const savedNotes = localStorage.getItem('qa-checklist-notes');
    if (savedItems) {
      try {
        const parsed = JSON.parse(savedItems);
        setItems(parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        })));
      } catch (error) {
        console.error('Error loading checklist items:', error);
      }
    }
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  
  useEffect(() => {
    localStorage.setItem('qa-checklist-items', JSON.stringify(items));
    localStorage.setItem('qa-checklist-notes', notes);
  }, [items, notes]);

  useEffect(() => {
    loadChecklist();
  }, [user]);

const loadChecklist = async () => {
    if (!user) return;

    try {
      const savedChecklist = await checklistService.getChecklist(user.uid);
      if (savedChecklist) {
        setItems(savedChecklist.items);
        setNotes(savedChecklist.notes);
      } else {
        
        const savedItems = localStorage.getItem('qa-checklist-items');
        const savedNotes = localStorage.getItem('qa-checklist-notes');
        if (savedItems) {
          try {
            const parsed = JSON.parse(savedItems);
            setItems(parsed.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt)
            })));
          } catch (error) {
            console.error('Error loading checklist items:', error);
          }
        }
        if (savedNotes) {
          setNotes(savedNotes);
        }
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
    
      const savedItems = localStorage.getItem('qa-checklist-items');
      const savedNotes = localStorage.getItem('qa-checklist-notes');
      if (savedItems) {
        try {
          const parsed = JSON.parse(savedItems);
          setItems(parsed.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt)
          })));
        } catch (error) {
          console.error('Error loading checklist items:', error);
        }
      }
      if (savedNotes) {
        setNotes(savedNotes);
      }
    }
  };

  const saveChecklistToFirestore = async () => {
    if (!user) {
      showError('Error', 'You must be logged in to save checklists');
      return;
    }

    setIsSaving(true);
    try {
      const checklistData = {
        items,
        notes,
        completedCount,
        totalCount,
        passCount,
        failCount,
        passRate,
        lastSaved: new Date()
      };

      await checklistService.saveChecklist(user.uid, checklistData);
      showSuccess('Success', 'Checklist saved to cloud!');
    } catch (error) {
      console.error('Error saving checklist:', error);
      showError('Error', 'Failed to save checklist to cloud');
    } finally {
      setIsSaving(false);
    }
  };

  const autoSaveChecklist = async () => {
    if (!user) return;
    
   
    try {
      const checklistData = {
        items,
        notes,
        completedCount,
        totalCount,
        passCount,
        failCount,
        passRate,
        lastSaved: new Date()
      };
      
      await checklistService.saveChecklist(user.uid, checklistData);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

   useEffect(() => {
    if (!user) return;

    const autoSaveInterval = setInterval(autoSaveChecklist, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [user, items, notes]);

 
  useEffect(() => {
    localStorage.setItem('qa-checklist-items', JSON.stringify(items));
    localStorage.setItem('qa-checklist-notes', notes);
  }, [items, notes]);


  const addItem = () => {
    if (newItemText.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        section: newItemSection,
        text: newItemText.trim(),
        completed: false,
        status: 'N/A',
        comment: '',
        createdAt: new Date()
      };
      setItems(prev => [...prev, newItem]);
      setNewItemText('');
    }
  };

  const toggleItem = (id: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItemStatus = (id: string, status: 'Pass' | 'Fail' | 'N/A') => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status } : item
      )
    );
  };

  const updateItemComment = (id: string, comment: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, comment } : item
      )
    );
  };

  const clearCompleted = () => {
    setItems(prev => prev.filter(item => !item.completed));
  };

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const passCount = items.filter(item => item.status === 'Pass').length;
  const failCount = items.filter(item => item.status === 'Fail').length;
  const passRate = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  const exportToCSV = () => {
    const headers = ['Section', 'Item', 'Status', 'Completed', 'Comment'];
    const csvRows = [
      headers.join(','),
      ...items.map(item => [
        `"${item.section.replace(/"/g, '""')}"`,
        `"${item.text.replace(/"/g, '""')}"`,
        item.status,
        item.completed ? 'Yes' : 'No',
        `"${item.comment.replace(/"/g, '""')}"`
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'qa-checklist-report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
    URL.revokeObjectURL(url);
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.icon}>✓</span>
            QA Checklist
          </h2>
          <div className={styles.headerActions}>
            {user && (
              <button 
                onClick={saveChecklistToFirestore} 
                className={styles.saveButton}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save to Cloud'}
              </button>
            )}
            <button onClick={onClose} className={styles.closeButton}>
              ✕
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{completedCount}/{totalCount}</span>
              <span className={styles.statLabel}>Completed</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{passRate}%</span>
              <span className={styles.statLabel}>Pass Rate</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{failCount}</span>
              <span className={styles.statLabel}>Failures</span>
            </div>
          </div>

          <div className={styles.addSection}>
            <select
              value={newItemSection}
              onChange={(e) => setNewItemSection(e.target.value)}
              className={styles.sectionSelect}
            >
              {defaultSections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a new test case..."
              className={styles.input}
            />
            <button onClick={addItem} className={styles.addButton}>
              Add
            </button>
          </div>

          <div className={styles.itemsContainer}>
            {Object.entries(groupedItems).map(([section, sectionItems]) => (
              <div key={section} className={styles.section}>
                <div 
                  className={styles.sectionHeader}
                  onClick={() => toggleSection(section)}
                >
                  <h3>{section}</h3>
                  <span className={styles.collapseIcon}>
                    {collapsedSections[section] ? '▼' : '▲'}
                  </span>
                </div>
                {!collapsedSections[section] && (
                  <div className={styles.itemsList}>
                    {sectionItems.map(item => (
                      <div 
                        key={item.id} 
                        className={`${styles.item} ${item.completed ? styles.completed : ''}`}
                      >
                        <div className={styles.itemMain}>
                          <button
                            onClick={() => toggleItem(item.id)}
                            className={styles.checkbox}
                          >
                            {item.completed && <span className={styles.checkmark}>✓</span>}
                          </button>
                          <span className={styles.itemText}>{item.text}</span>
                          <select
                            value={item.status}
                            onChange={(e) => updateItemStatus(item.id, e.target.value as 'Pass' | 'Fail' | 'N/A')}
                            className={`${styles.statusSelect} ${styles[`status-${item.status.toLowerCase()}`]}`}
                          >
                            <option value="N/A">N/A</option>
                            <option value="Pass">Pass</option>
                            <option value="Fail">Fail</option>
                          </select>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className={styles.deleteButton}
                            title="Delete test case"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className={styles.commentSection}>
                          <textarea
                            value={item.comment}
                            onChange={(e) => updateItemComment(item.id, e.target.value)}
                            placeholder="Add comments..."
                            className={styles.commentInput}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button onClick={exportToCSV} className={styles.exportButton}>
              Export to CSV
            </button>
            {completedCount > 0 && (
              <button onClick={clearCompleted} className={styles.clearButton}>
                Clear Completed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checklist;