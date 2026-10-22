import React, { useState } from 'react';
import {
  ArrowUp,
  Bot,
  Check,
  ChevronDown,
  CircleHelp,
  Cpu,
  History,
  Layers,
  Orbit,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Hero3DCanvas } from './Hero3DCanvas';

interface ChatPreviewProps {
  isDark?: boolean;
}

const examples = [
  {
    label: 'Explore NLP',
    question: 'How does natural language processing work?',
    answer:
      'NLP helps computers understand human language. In this project, your message is normalized and tokenized before intent, sentiment, and entity analysis.',
    followup: 'And how do you remember our conversation?',
    reply:
      'Recent messages from your session are retrieved before a response is generated. That context helps connect your next question to what we’ve already discussed.',
    intent: 'technical_question',
    sentiment: 'Neutral',
    context: 'Previous topic: natural language processing',
  },
  {
    label: 'Understand sentiment',
    question: 'I’m frustrated. My code keeps failing.',
    answer:
      'I understand that debugging can be frustrating. Share the error message and the relevant code so we can work through the problem step by step.',
    followup: 'It says a module is missing.',
    reply:
      'Let’s start with the missing module’s name and your environment. Check that the package is installed in the same environment running your code.',
    intent: 'technical_question',
    sentiment: 'Negative',
    context: 'Previous topic: debugging a failing program',
  },
  {
    label: 'Try Hinglish',
    question: 'Machine learning kya hai?',
    answer:
      'Machine learning AI ka ek branch hai. Isme models data ke patterns se seekhte hain aur naye examples par predictions karte hain.',
    followup: 'Aur is chatbot mein iska use?',
    reply:
      'Is chatbot mein trained model aapke message ka likely intent identify karta hai. Uske baad response router suitable answer choose karta hai.',
    intent: 'machine_learning',
    sentiment: 'Neutral',
    context: 'Previous topic: machine learning · Hinglish',
  },
];

export const ChatPreview: React.FC<ChatPreviewProps> = ({ isDark = true }) => {
  const [example, setExample] = useState(0);
  const [tab, setTab] = useState<'conversation' | 'analysis' | '3d-core'>('conversation');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const item = examples[example];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -(y * 12), y: x * 12 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="preview-stage">
      <div className="preview-orbit orbit-one" aria-hidden="true" />
      <div className="preview-orbit orbit-two" aria-hidden="true" />

      {/* Floating 3D AI Metric Badge */}
      <div className="floating-3d-model-pill" aria-hidden="true">
        <Zap size={14} className="text-amber-400" />
        <span>Gemini 3.5 Flash + Scikit-Learn NLP</span>
      </div>

      <div
        className="chat-preview preview-3d-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: tilt.x === 0 ? 'transform 0.5s ease-out' : 'transform 0.08s ease-out',
        }}
      >
        <div className="preview-topbar">
          <div className="preview-brand">
            <span className="mini-logo">
              <Bot size={19} />
            </span>
            <div>
              <strong>Dynamic AI</strong>
              <span>suragzidio · Interactive Preview</span>
            </div>
          </div>
          <span className="preview-label">
            <span /> {tab === '3d-core' ? 'Live 3D Core' : 'Scripted preview'}
          </span>
        </div>

        <div className="preview-tabs" role="group" aria-label="Preview view">
          <button
            type="button"
            aria-pressed={tab === 'conversation'}
            className={tab === 'conversation' ? 'selected' : ''}
            onClick={() => setTab('conversation')}
          >
            <Layers size={13} /> Conversation
          </button>
          <button
            type="button"
            aria-pressed={tab === 'analysis'}
            className={tab === 'analysis' ? 'selected' : ''}
            onClick={() => setTab('analysis')}
          >
            <Cpu size={13} /> Understanding
          </button>
          <button
            type="button"
            aria-pressed={tab === '3d-core'}
            className={tab === '3d-core' ? 'selected highlight-3d-tab' : 'highlight-3d-tab'}
            onClick={() => setTab('3d-core')}
            title="Interactive 3D Neural Core"
          >
            <Orbit size={13} className="spin-slow" /> 3D AI Core
          </button>
          <span className="demo-indicator">
            <CircleHelp size={12} /> Interactive
          </span>
        </div>

        <div className="preview-messages" aria-live="polite">
          {tab === 'conversation' ? (
            <>
              <div className="preview-user">
                <span className="message-author">YOU</span>
                <p>{item.question}</p>
              </div>
              <div className="preview-assistant">
                <span className="assistant-symbol">
                  <Sparkles size={16} />
                </span>
                <div>
                  <span className="message-author">DYNAMIC AI</span>
                  <p>{item.answer}</p>
                  <span className="response-status">
                    <Check size={11} /> Example response
                  </span>
                </div>
              </div>
              <div className="preview-user followup">
                <span className="message-author">YOU</span>
                <p>{item.followup}</p>
              </div>
              <div className="preview-assistant">
                <span className="assistant-symbol">
                  <Sparkles size={16} />
                </span>
                <div>
                  <span className="message-author">DYNAMIC AI</span>
                  <p>{item.reply}</p>
                  <span className="context-hint">
                    <History size={11} /> Using conversation context
                  </span>
                </div>
              </div>
            </>
          ) : tab === 'analysis' ? (
            <div className="analysis-preview">
              <span className="eyebrow">ILLUSTRATIVE MESSAGE ANALYSIS</span>
              <blockquote>“{item.question}”</blockquote>
              <dl>
                <div>
                  <dt>Recognized intent</dt>
                  <dd>{item.intent}</dd>
                </div>
                <div>
                  <dt>Sentiment</dt>
                  <dd>{item.sentiment}</dd>
                </div>
                <div>
                  <dt>Context retrieved</dt>
                  <dd>{item.context}</dd>
                </div>
                <div>
                  <dt>Response status</dt>
                  <dd>Example complete</dd>
                </div>
              </dl>
              <p>These values illustrate the interface. Real intelligence runs on the backend.</p>
            </div>
          ) : (
            <div className="preview-3d-container">
              <Hero3DCanvas isDark={isDark} />
              <div className="preview-3d-caption">
                <span>Interactive 3D Neural Synapse Core</span>
                <p>Move your cursor to orbit and tilt the multidimensional neural nodes in real-time.</p>
              </div>
            </div>
          )}
        </div>

        {tab !== '3d-core' ? (
          <>
            <div className="preview-composer">
              <span>Choose an example below to explore</span>
              <ArrowUp size={17} />
            </div>
            <div className="preview-examples" role="group" aria-label="Choose a scripted conversation">
              {examples.map((sample, i) => (
                <button
                  type="button"
                  key={sample.label}
                  aria-pressed={example === i}
                  onClick={() => setExample(i)}
                  className={example === i ? 'selected' : ''}
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="preview-3d-footer">
            <button
              type="button"
              className="preview-3d-action-btn"
              onClick={() => setTab('conversation')}
            >
              Switch back to Chat Stream
            </button>
          </div>
        )}
      </div>

      <div className="floating-insight">
        <span className="insight-icon">
          <Cpu size={19} />
        </span>
        <div>
          <small>BUILT TO UNDERSTAND</small>
          <strong>Context makes the difference.</strong>
        </div>
        <ChevronDown size={14} />
      </div>
      <span className="stage-caption">Physical 3D perspective enabled. Move mouse over card to tilt.</span>
    </div>
  );
};
