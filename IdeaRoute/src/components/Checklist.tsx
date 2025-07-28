'use client';

import React, { useState, useEffect } from 'react';
import styles from './Checklist.module.css';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface ChecklistProps {
  onClose: () => void;
}

const Checklist: React.FC<ChecklistProps> = ({ onClose }) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');

  // Load items from localStorage on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem('checklist-items');
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
  }, []);

  // Save items to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('checklist-items', JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    if (newItemText.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newItemText.trim(),
        completed: false,
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

  const clearCompleted = () => {
    setItems(prev => prev.filter(item => !item.completed));
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.icon}>✓</span>
            My Checklist
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{completedCount}</span>
              <span className={styles.statLabel}>Completed</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{totalCount - completedCount}</span>
              <span className={styles.statLabel}>Remaining</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{totalCount}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
          </div>

          <div className={styles.addSection}>
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a new task..."
              className={styles.input}
            />
            <button onClick={addItem} className={styles.addButton}>
              Add
            </button>
          </div>

          <div className={styles.itemsList}>
            {items.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📝</div>
                <p className={styles.emptyText}>No tasks yet. Add your first task above!</p>
              </div>
            ) : (
              items.map(item => (
                <div 
                  key={item.id} 
                  className={`${styles.item} ${item.completed ? styles.completed : ''}`}
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={styles.checkbox}
                  >
                    {item.completed && <span className={styles.checkmark}>✓</span>}
                  </button>
                  <span className={styles.itemText}>{item.text}</span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className={styles.deleteButton}
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {completedCount > 0 && (
            <div className={styles.actions}>
              <button onClick={clearCompleted} className={styles.clearButton}>
                Clear Completed ({completedCount})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checklist;
