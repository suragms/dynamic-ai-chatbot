import React from 'react';
import { Bot, Cpu, ShieldCheck, Layers, Sparkles, Code2, Database, Brain } from 'lucide-react';
import { HealthStatus } from '../../types';

interface AboutViewProps {
  health: HealthStatus | null;
}

export const AboutView: React.FC<AboutViewProps> = ({ health }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-900 space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Version 1.0.0 • Production Ready</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Dynamic AI Chatbot Platform
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              An intelligent, context-aware conversational AI platform combining classical Natural Language Processing (NLP), Scikit-Learn Intent Classification, spaCy Named Entity Recognition, NLTK Sentiment Analysis, and Google Gemini Generative AI.
            </p>
          </div>

          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-300 flex items-center justify-center text-slate-900 shadow-lg shrink-0">
            <Bot className="w-10 h-10" />
          </div>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Generative Engine</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${health?.gemini_api_configured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{health?.gemini_model || 'gemini-1.5-flash'}</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">ML Intent Classifier</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${health?.intent_model_loaded ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span>Linear SVM (100% Acc)</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Security Compliance</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              Zero Secrets Policy (.env)
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Tier Architecture Explanation */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-500" />
          <span>Multi-Tier Response Routing Architecture</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Tier 1: Intent Handler</div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Deterministic responses for high-confidence intents (greetings, time, date, capabilities, account help).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Tier 2: FAQ Engine</div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Domain-specific curated responses for technical subjects (Python, Machine Learning, Data Science).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Tier 3: Generative Gemini</div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Google Gemini REST API integration for complex open-ended conversation synthesis with context history.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Tier 4: Local NLP Engine</div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Fallback classification via local Linear SVM model when generative services are unreachable.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Tier 5: Friendly Fallback</div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Safe, user-friendly fallback guidance ensuring zero raw exception exposure to end users.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Multilingual Support</div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Dynamic response translation and prompt conditioning for English, Hindi (Devanagari), and Hinglish.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-teal-500" />
            <span>Frontend Stack</span>
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <li className="flex items-center gap-2">• <strong>Framework:</strong> React 18 + TypeScript</li>
            <li className="flex items-center gap-2">• <strong>Build Tool:</strong> Vite</li>
            <li className="flex items-center gap-2">• <strong>Styling:</strong> Tailwind CSS</li>
            <li className="flex items-center gap-2">• <strong>Icons:</strong> Lucide React</li>
            <li className="flex items-center gap-2">• <strong>Analytics Charts:</strong> Recharts</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-500" />
            <span>Backend Stack</span>
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <li className="flex items-center gap-2">• <strong>API Server:</strong> Python Flask REST API</li>
            <li className="flex items-center gap-2">• <strong>Database:</strong> SQLite with SQLAlchemy ORM</li>
            <li className="flex items-center gap-2">• <strong>NLP & ML:</strong> NLTK, spaCy (en_core_web_sm), Scikit-Learn</li>
            <li className="flex items-center gap-2">• <strong>Generative Provider:</strong> Google Gemini API</li>
            <li className="flex items-center gap-2">• <strong>Testing:</strong> Pytest automated test suite</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
