'use client';

import React, { useState, useEffect } from 'react';
import styles from './Checklist.module.css';

// Define the structure of each QA checklist item
interface QAItem {
  id: string;         // unique ID for the item
  category: string;   // group/category like "Functional"
  label: string;      // the text shown for the checklist item
  completed: boolean; // whether the item is marked complete
  note?: string;      // optional notes for this item
}

// Props to receive from parent (like the onClose function)
interface ChecklistProps {
  onClose: () => void;
}

const Checklist: React.FC<ChecklistProps> = ({ onClose }) => {
  const [items, setItems] = useState<QAItem[]>([]);
  const [newNote, setNewNote] = useState<{ [key: string]: string }>({});

  // Load saved checklist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('qa-checklist');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading checklist:', e);
      }
    }
  }, []);

  // Save checklist to localStorage when it updates
  useEffect(() => {
    localStorage.setItem('qa-checklist', JSON.stringify(items));
  }, [items]);

  // Toggle whether a checkbox is completed
  const toggle = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Update the text inside the notes field
  const updateNote = (id: string, value: string) => {
    setNewNote({ ...newNote, [id]: value }); // update temporary state
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, note: value } : item)
    );
  };

  // These are your predefined QA items (we'll group them by category)
  const defaultItems: QAItem[] = [
    { id: 'f1', category: 'Functional', label: 'Form inputs validate correctly', completed: false },
    { id: 'f2', category: 'Functional', label: 'Buttons trigger expected actions', completed: false },
    { id: 'ui1', category: 'UI / UX', label: 'Layout is consistent across screens', completed: false },
    { id: 'ui2', category: 'UI / UX', label: 'Hover/focus effects work correctly', completed: false },
    { id: 'access1', category: 'Accessibility', label: 'Keyboard navigation supported', completed: false },
    { id: 'access2', category: 'Accessibility', label: 'Alt text present for images', completed: false },
    { id: 'perf1', category: 'Performance', label: 'Popup loads within 1 second', completed: false },
    { id: 'perf2', category: 'Performance', label: 'Typing has no visible lag', completed: false },
  ];

  // If no items are loaded yet, load the default ones
  useEffect(() => {
    if (items.length === 0) {
      setItems(defaultItems);
    }
  }, [items]);

  // Group checklist items by category (to render by section)
  const grouped = items.reduce((acc: Record<string, QAItem[]>, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.icon}>🛠️</span> QA Checklist
          </h2>
          <button onClick={onClose} className={styles.closeButton}>✕</button>
        </div>

        <div className={styles.content}>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className={styles.section}>
              <h3 className={styles.category}>{category}</h3>
              {items.map(item => (
                <div key={item.id} className={`${styles.item} ${item.completed ? styles.completed : ''}`}>
                  {/* Checkbox toggle */}
                  <button onClick={() => toggle(item.id)} className={styles.checkbox}>
                    {item.completed && <span className={styles.checkmark}>✓</span>}
                  </button>

                  {/* Task label */}
                  <span className={styles.itemText}>{item.label}</span>

                  {/* Notes input */}
                  <textarea
                    placeholder="Optional note..."
                    className={styles.noteBox}
                    value={item.note || ''}
                    onChange={(e) => updateNote(item.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Checklist;
