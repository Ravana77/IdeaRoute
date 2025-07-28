'use client';

import React, { useState } from 'react';
import styles from './AIGenerate.module.css';

interface AIGenerateProps {
  onClose: () => void;
}

interface GeneratedContent {
  id: string;
  type: string;
  prompt: string;
  content: string;
  createdAt: Date;
}

const AIGenerate: React.FC<AIGenerateProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState('idea');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);

  const contentTypes = [
    { value: 'idea', label: 'Business Idea', icon: '💡' },
    { value: 'content', label: 'Content Ideas', icon: '📝' },
    { value: 'plan', label: 'Action Plan', icon: '📋' },
    { value: 'solution', label: 'Problem Solution', icon: '🔧' },
    { value: 'strategy', label: 'Strategy', icon: '🎯' },
    { value: 'creative', label: 'Creative Concept', icon: '🎨' }
  ];

  // Mock AI generation function (in a real app, this would call an AI service)
  const generateContent = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    // Simulate API delay
    setTimeout(() => {
      const mockResponses = {
        idea: [
          "Consider developing a mobile app that connects local farmers directly with consumers, eliminating middlemen and ensuring fresh produce delivery within 24 hours.",
          "Create a subscription-based service for eco-friendly household products, delivered monthly with educational content about sustainability.",
          "Build a platform that matches remote workers with temporary workspace solutions in their neighborhoods."
        ],
        content: [
          "1. Behind-the-scenes content showing your daily workflow\n2. Customer success stories and testimonials\n3. Educational tutorials related to your industry\n4. Interactive Q&A sessions with your audience\n5. Collaborative content with industry experts",
          "Create a content series featuring:\n• Weekly tips and tricks\n• Industry news commentary\n• User-generated content showcases\n• Live demonstrations\n• Thought leadership articles",
          "Develop content pillars around:\n- Educational content (40%)\n- Entertainment (30%)\n- Promotional content (20%)\n- User-generated content (10%)"
        ],
        plan: [
          "Phase 1 (Week 1-2): Research and Planning\n• Define objectives and success metrics\n• Conduct market research\n• Identify target audience\n\nPhase 2 (Week 3-4): Development\n• Create initial prototype\n• Gather feedback from stakeholders\n• Iterate based on input\n\nPhase 3 (Week 5-6): Testing and Launch\n• Conduct thorough testing\n• Prepare launch materials\n• Execute go-to-market strategy",
          "30-Day Action Plan:\n\nWeek 1: Foundation\n- Set clear goals and KPIs\n- Assemble your team\n- Create project timeline\n\nWeek 2-3: Execution\n- Begin core development\n- Regular progress reviews\n- Address blockers quickly\n\nWeek 4: Launch Preparation\n- Final testing and quality assurance\n- Marketing and communication plan\n- Stakeholder alignment",
          "Strategic Implementation Plan:\n\n1. Discovery Phase (Days 1-7)\n2. Planning Phase (Days 8-14)\n3. Execution Phase (Days 15-21)\n4. Review and Optimization (Days 22-30)"
        ],
        solution: [
          "Problem Analysis:\nThe issue stems from inefficient communication channels and lack of clear processes.\n\nSolution Framework:\n1. Implement a centralized communication platform\n2. Establish clear workflows and responsibilities\n3. Create regular check-in schedules\n4. Develop performance metrics and feedback loops\n\nExpected Outcomes:\n• 40% improvement in team efficiency\n• Reduced miscommunication\n• Higher project success rates",
          "Root Cause Analysis:\nIdentify the core issues affecting productivity and user experience.\n\nProposed Solution:\n• Streamline existing processes\n• Implement automation where possible\n• Provide comprehensive training\n• Establish monitoring and improvement cycles\n\nImplementation Steps:\n1. Audit current systems\n2. Design new workflows\n3. Pilot test with small group\n4. Full rollout with support",
          "Systematic Problem-Solving Approach:\n\n1. Define the Problem Clearly\n2. Gather Relevant Data\n3. Analyze Root Causes\n4. Generate Multiple Solutions\n5. Evaluate and Select Best Option\n6. Implement with Clear Timeline\n7. Monitor and Adjust as Needed"
        ],
        strategy: [
          "Strategic Framework:\n\n1. Market Positioning\n• Identify unique value proposition\n• Analyze competitive landscape\n• Define target market segments\n\n2. Growth Strategy\n• Focus on customer acquisition\n• Develop retention programs\n• Explore new market opportunities\n\n3. Operational Excellence\n• Optimize internal processes\n• Invest in technology and tools\n• Build strong team capabilities",
          "Three-Pillar Strategy:\n\nPillar 1: Innovation\n- Continuous product development\n- Technology advancement\n- Creative problem solving\n\nPillar 2: Customer-Centricity\n- Deep customer understanding\n- Personalized experiences\n- Exceptional service delivery\n\nPillar 3: Operational Efficiency\n- Process optimization\n- Cost management\n- Quality assurance",
          "Strategic Roadmap:\n\nShort-term (0-6 months):\n• Establish foundation\n• Quick wins implementation\n• Team alignment\n\nMedium-term (6-18 months):\n• Scale operations\n• Market expansion\n• Process refinement\n\nLong-term (18+ months):\n• Innovation leadership\n• Market dominance\n• Sustainable growth"
        ],
        creative: [
          "Creative Concept: 'The Innovation Garden'\n\nCore Idea: Transform your workspace into zones that inspire different types of thinking:\n\n🌱 Seed Zone: Brainstorming and initial ideas\n🌿 Growth Zone: Development and collaboration\n🌺 Bloom Zone: Presentation and showcase\n\nEach zone has specific colors, lighting, and tools designed to stimulate creativity and productivity.",
          "Creative Campaign: 'Stories Behind the Success'\n\nConcept: Share the authentic journey of your brand through:\n• Visual storytelling with before/after content\n• Interactive timeline of milestones\n• User testimonials in creative formats\n• Behind-the-scenes documentary style videos\n• Community-driven content creation",
          "Innovation Workshop Format:\n\n'The Creative Collision Method'\n\n1. Diverse Perspectives Round (15 min)\n2. Random Word Association (10 min)\n3. Role Reversal Exercise (20 min)\n4. Visual Thinking Session (15 min)\n5. Rapid Prototyping (30 min)\n6. Feedback and Iteration (15 min)\n\nThis format encourages breakthrough thinking through structured creativity."
        ]
      };

      const responses = mockResponses[selectedType as keyof typeof mockResponses] || mockResponses.idea;
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const newContent: GeneratedContent = {
        id: Date.now().toString(),
        type: selectedType,
        prompt: prompt,
        content: randomResponse,
        createdAt: new Date()
      };

      setGeneratedContent(prev => [newContent, ...prev]);
      setPrompt('');
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  const deleteContent = (id: string) => {
    setGeneratedContent(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.icon}>🤖</span>
            AI Content Generator
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.generateSection}>
            <div className={styles.typeSelector}>
              <label className={styles.label}>Content Type:</label>
              <div className={styles.typeGrid}>
                {contentTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`${styles.typeButton} ${
                      selectedType === type.value ? styles.active : ''
                    }`}
                  >
                    <span className={styles.typeIcon}>{type.icon}</span>
                    <span className={styles.typeLabel}>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.promptSection}>
              <label htmlFor="prompt" className={styles.label}>
                Describe what you need:
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Describe your ${contentTypes.find(t => t.value === selectedType)?.label.toLowerCase()} needs...`}
                className={styles.textarea}
                rows={4}
              />
              <button
                onClick={generateContent}
                disabled={!prompt.trim() || isGenerating}
                className={styles.generateButton}
              >
                {isGenerating ? (
                  <>
                    <span className={styles.spinner}></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Generate Content
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={styles.resultsSection}>
            <h3 className={styles.resultsTitle}>Generated Content</h3>
            
            {generatedContent.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🤖</div>
                <p className={styles.emptyText}>
                  No content generated yet. Enter a prompt above to get started!
                </p>
              </div>
            ) : (
              <div className={styles.contentList}>
                {generatedContent.map(item => (
                  <div key={item.id} className={styles.contentItem}>
                    <div className={styles.contentHeader}>
                      <div className={styles.contentMeta}>
                        <span className={styles.contentType}>
                          {contentTypes.find(t => t.value === item.type)?.icon}
                          {contentTypes.find(t => t.value === item.type)?.label}
                        </span>
                        <span className={styles.contentDate}>
                          {item.createdAt.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className={styles.contentActions}>
                        <button
                          onClick={() => copyToClipboard(item.content)}
                          className={styles.actionButton}
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => deleteContent(item.id)}
                          className={styles.actionButton}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className={styles.contentPrompt}>
                      <strong>Prompt:</strong> {item.prompt}
                    </div>
                    <div className={styles.contentText}>
                      {item.content.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          {index < item.content.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
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

export default AIGenerate;
