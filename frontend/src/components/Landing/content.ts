import { BrainCircuit, ScanText, HeartPulse, Tags, Sparkles, History, GitBranch, ShieldCheck, BarChart3, Languages, Download, SlidersHorizontal, MessageSquare, Cpu, BookOpen, Mic, FlaskConical, ThumbsUp, Plug, Cloud, Database } from 'lucide-react';

export const links = {
  github: 'https://github.com/suragms/dynamic-ai-chatbot',
  linkedin: 'https://www.linkedin.com/in/suragsunil',
  portfolio: 'https://surag-portfolio.web.app/about',
  gemini: 'https://ai.google.dev/gemini-api/docs',
};
export const navigation = [
  ['home', 'Home'], ['features', 'Features'], ['how-it-works', 'How It Works'],
  ['technology', 'Technology'], ['integration', 'API Integration'],
  ['roadmap', 'Future Enhancements'], ['developer', 'About Developer'],
];
export const purposes = [
  { icon: MessageSquare, title: 'Intelligent communication', text: 'A natural interface for asking questions, exploring ideas, and receiving useful responses.', tag: 'Designed around the conversation' },
  { icon: Cpu, title: 'NLP meets machine learning', text: 'Text preprocessing, intent classification, entity extraction, and sentiment analysis working together.', tag: 'Understand before responding' },
  { icon: BarChart3, title: 'AI-driven insights', text: 'Database-backed analytics reveal conversation patterns, response performance, and fallback usage.', tag: 'Make every interaction measurable' },
];
export const features = [
  { icon: ScanText, title: 'Natural language processing', text: 'NLTK normalization, tokenization, and lemmatization prepare messages for analysis.', category: 'AI & NLP', status: 'Implemented' },
  { icon: BrainCircuit, title: 'Intent recognition', text: 'A trained scikit-learn classifier identifies likely intent and returns a confidence score.', category: 'AI & NLP', status: 'Implemented' },
  { icon: HeartPulse, title: 'Sentiment analysis', text: 'VADER estimates positive, neutral, or negative sentiment. Keyword fallback is available.', category: 'AI & NLP', status: 'Implemented' },
  { icon: Tags, title: 'Named entity recognition', text: 'spaCy extracts supported entities. A limited rule-based fallback runs when the model is unavailable.', category: 'AI & NLP', status: 'Implemented' },
  { icon: Sparkles, title: 'Generative AI responses', text: 'Backend Gemini integration enriches open-ended replies. Requires a valid key and supported model.', category: 'AI & NLP', status: 'Configuration required' },
  { icon: History, title: 'Contextual memory', text: 'A configurable window of recent messages provides session context, persisted with SQLAlchemy.', category: 'AI & NLP', status: 'Implemented' },
  { icon: GitBranch, title: 'Intelligent response routing', text: 'Five routing tiers combine intent handlers, technical FAQs, Gemini, and local fallbacks.', category: 'AI & NLP', status: 'Implemented' },
  { icon: ShieldCheck, title: 'Smart fallback system', text: 'Local responses handle missing credentials, provider failures, and unsupported requests.', category: 'AI & NLP', status: 'Implemented' },
  { icon: BarChart3, title: 'Conversation analytics', text: 'Real API endpoints provide counts, intent and sentiment distribution, latency, and provider usage.', category: 'Experience', status: 'Implemented' },
  { icon: Languages, title: 'Multilingual experience', text: 'English, Hindi, and Hinglish replies and fallbacks. Local NLP models are primarily English.', category: 'Experience', status: 'Implemented' },
  { icon: Download, title: 'Take your conversations with you', text: 'Export conversation transcripts as JSON, CSV, or TXT from the chatbot settings.', category: 'Experience', status: 'Implemented' },
  { icon: SlidersHorizontal, title: 'Make it your own', text: 'Choose a theme, response language, generation temperature, and timestamp display.', category: 'Experience', status: 'Implemented' },
];
export const steps = [
  { icon: MessageSquare, title: 'User input', text: 'Submit a message through the React chat interface. The Flask API validates the input and supported preferences.', file: 'POST /api/chat' },
  { icon: ScanText, title: 'NLP preprocessing', text: 'Normalize, tokenize, filter punctuation, and lemmatize text using the existing NLTK preprocessing service.', file: 'backend/nlp/preprocessor.py' },
  { icon: BrainCircuit, title: 'Intent & entities', text: 'The trained classifier estimates intent and confidence. spaCy extracts supported entities, with a limited fallback.', file: 'intent_service.py + ner_service.py' },
  { icon: HeartPulse, title: 'Sentiment analysis', text: 'VADER estimates sentiment to give the router additional context and help adapt response tone.', file: 'backend/services/sentiment_service.py' },
  { icon: History, title: 'Context retrieval', text: 'Fetch recent messages for the session from SQLite. The configured sliding window bounds the amount of history.', file: 'backend/services/memory_service.py' },
  { icon: GitBranch, title: 'Response routing', text: 'Choose a deterministic handler, technical FAQ, Gemini request, local intent response, or friendly fallback.', file: 'backend/services/response_router.py' },
  { icon: Sparkles, title: 'Response generation', text: 'Return the selected local response or call Gemini on the backend with conversation context, timeouts, and retry handling.', file: 'backend/services/llm_service.py' },
  { icon: BarChart3, title: 'Analytics & storage', text: 'Persist messages and interaction metadata. The analytics endpoints aggregate real conversation and performance data.', file: 'backend/routes/analytics.py' },
];
export const technologies = [
  { mark: 'Py', name: 'Python', role: 'Backend & AI services', color: 'blue' },
  { mark: 'ƒ', name: 'Flask', role: 'REST API & application server', color: 'white' },
  { mark: '⚛', name: 'React', role: 'Interactive user interface', color: 'cyan' },
  { mark: 'TS', name: 'TypeScript', role: 'Typed frontend components', color: 'blue' },
  { mark: 'ϟ', name: 'Vite', role: 'Development & production builds', color: 'purple' },
  { mark: '≈', name: 'Tailwind CSS', role: 'Application styling', color: 'cyan' },
  { mark: 'nl', name: 'NLTK', role: 'Preprocessing & VADER sentiment', color: 'green' },
  { mark: 'sp', name: 'spaCy', role: 'Named entity recognition', color: 'cyan' },
  { mark: 'sk', name: 'scikit-learn', role: 'Intent model training & inference', color: 'orange' },
  { mark: '✧', name: 'Gemini API', role: 'Backend generative response provider', color: 'purple' },
  { mark: 'DB', name: 'SQLite / SQLAlchemy', role: 'Conversations & session persistence', color: 'blue' },
  { mark: '↗', name: 'Recharts', role: 'Conversation data visualizations', color: 'green' },
];
export const roadmap = [
  { icon: History, title: 'Advanced conversational memory', text: 'Long-term context with configurable memory and retrieval.' },
  { icon: BookOpen, title: 'Retrieval-augmented generation', text: 'Ground answers in verified documents and knowledge sources.' },
  { icon: Mic, title: 'Expanded voice interaction', text: 'Build on existing browser speech input and output with broader support.' },
  { icon: Languages, title: 'Multilingual intelligence', text: 'Evaluate more languages and improve mixed-language understanding.' },
  { icon: FlaskConical, title: 'Broader model evaluation', text: 'Extend existing evaluation with precision, recall, F1, and confusion matrices.' },
  { icon: ThumbsUp, title: 'Feedback-driven improvement', text: 'Review user feedback and evaluate datasets before retraining.' },
  { icon: BarChart3, title: 'Advanced analytics', text: 'Add deeper failure analysis and performance monitoring to existing metrics.' },
  { icon: Plug, title: 'Additional integrations', text: 'Explore messaging platforms through secured backend APIs.' },
  { icon: Cloud, title: 'Deployment & scalability', text: 'Improve automation, monitoring, and database reliability.' },
];
export const architecture = [
  { icon: MessageSquare, title: 'Frontend chat interface', detail: 'React · TypeScript' },
  { icon: Cloud, title: 'Backend REST API', detail: 'Flask · input validation' },
  { icon: ScanText, title: 'NLP processing layer', detail: 'NLTK preprocessing' },
  { icon: BrainCircuit, title: 'Language understanding', detail: 'Intent classifier + NER + sentiment' },
  { icon: History, title: 'Conversation memory', detail: 'Recent session context' },
  { icon: GitBranch, title: 'Response router', detail: 'Deterministic / FAQ / Gemini / fallback' },
  { icon: Sparkles, title: 'Final response', detail: 'Response + analysis metadata' },
  { icon: Database, title: 'Analytics & database', detail: 'SQLite · SQLAlchemy' },
];

