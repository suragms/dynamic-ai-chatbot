import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Bot, Check, CheckCheck, ChevronRight, Code2, Copy, ExternalLink, Github, Linkedin, Menu, Moon, ShieldCheck, Sparkles, Sun, X } from 'lucide-react';
import { ChatPreview } from './ChatPreview';
import { architecture, features, links, navigation, purposes, roadmap, steps, technologies } from './content';
import './landing.css';

const LandingAnalytics = lazy(() => import('./LandingAnalytics'));
const codeExamples = {
  Python: 'import os\nfrom dotenv import load_dotenv\n\nload_dotenv()\n\nGOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")\nGEMINI_MODEL = os.getenv("GEMINI_MODEL")',
  '.env': '# Backend only — never commit this file\nGOOGLE_API_KEY=your_api_key_here\nGEMINI_MODEL=your_supported_model_name',
};

function External({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
}
function SectionIntro({ number, label, title, text }: { number: string; label: string; title: React.ReactNode; text?: string }) {
  return <div className="section-intro"><span className="eyebrow"><span>{number}</span> {label}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [category, setCategory] = useState('All features');
  const [step, setStep] = useState(0);
  const [codeTab, setCodeTab] = useState<keyof typeof codeExamples>('Python');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('dynamic_ai_theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    return 'dark';
  });
  const root = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    try {
      localStorage.setItem('dynamic_ai_theme', theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio); else visible.delete(entry.target.id); });
      const nearest = [...visible.keys()].sort((a, b) => Math.abs(document.getElementById(a)!.getBoundingClientRect().top - 100) - Math.abs(document.getElementById(b)!.getBoundingClientRect().top - 100))[0];
      if (nearest) setActive(nearest);
    }, { rootMargin: '-80px 0px -45% 0px', threshold: [0, 0.1, 0.5] });
    navigation.forEach(([id]) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
    }), { threshold: 0.05 });
    root.current?.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    const hash = window.location.hash.slice(1);
    if (hash) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
    return () => { observer.disconnect(); clearTimeout(copyTimer.current); };
  }, []);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menuOpen]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codeExamples[codeTab]);
      setCopied(true); setCopyError(false);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch { setCopyError(true); }
  };
  const selectedStep = steps[step];
  const StepIcon = selectedStep.icon;
  return <div className={`landing ${theme === 'light' ? 'light-theme' : 'dark-theme'}`} ref={root}>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className="landing-header">
      <div className="nav-shell">
        <a className="brand" href="#home" onClick={() => setMenuOpen(false)} aria-label="Dynamic AI - suragzidio">
          <span className="brand-logo"><Bot size={20} /></span>
          <span className="brand-text">Dynamic AI<span className="brand-subtitle">suragzidio</span></span>
        </a>
        <nav id="landing-navigation" aria-label="Main navigation" className={menuOpen ? 'landing-nav open' : 'landing-nav'}>
          {navigation.map(([id, label]) => <a href={`#${id}`} key={id} aria-current={active === id ? 'location' : undefined} className={active === id ? 'active' : ''} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <External href={links.github} className="mobile-github"><Github size={16} /> View on GitHub</External>
        </nav>
        <div className="nav-actions">
          <button
            type="button"
            className="landing-theme-toggle"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <External href={links.github} className="nav-github"><Github size={16} /><span>GitHub</span></External>
          <a href="#features" className="button primary small nav-cta">Explore Features <ArrowUpRight size={14} /></a>
          <button ref={menuButton} type="button" className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="landing-navigation" onClick={() => setMenuOpen(value => !value)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
    </header>
    <main id="main-content" tabIndex={-1}>
      <section id="home" className="hero section-shell">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-content">
          <div className="project-pill"><span /> ZIDIO DEVELOPMENT · TEAM 17 <ChevronRight size={13} /></div>
          <h1>Intelligence That<br />Understands Your<br /><span>Conversation.</span></h1>
          <p className="hero-description">An intelligent conversational AI application combining Natural Language Processing, machine learning, sentiment analysis, contextual memory, and generative AI to deliver more meaningful chatbot interactions.</p>
          <div className="hero-buttons">
            <a className="button primary" href="#app/chat"><Bot size={17} /> Chat Here <ArrowRight size={16} /></a>
            <a className="button secondary" href="#features">Explore Features <ArrowRight size={16} /></a>
            <External className="button secondary" href={links.github}><Github size={17} /> View Source Code</External>
          </div>
          <div className="hero-badges">
            <span><Sparkles size={12} /> AI-Powered</span>
            <span><Code2 size={12} /> NLP + Machine Learning</span>
            <span><span className="gemini-star">✧</span> Gemini API Integration</span>
            <span className="internship-badge">Zidio Internship Project</span>
          </div>
          <div className="hero-credit"><span className="avatar-mini">SM</span><div>Individually built by <strong>Surag M S</strong><small>A practical exploration of conversational intelligence.</small></div></div>
        </div>
        <ChatPreview isDark={theme === 'dark'} />
        <a className="scroll-cue" href="#overview"><ArrowDown size={14} /> A closer look at the intelligence</a>
      </section>
      <div className="tech-ribbon"><div className="section-shell"><span className="ribbon-caption">BUILT WITH A PURPOSE.<br /><strong>POWERED BY A HYBRID STACK.</strong></span>{['Python', 'React', 'Flask', 'scikit-learn', 'spaCy', 'Gemini'].map((name, index) => <span className="ribbon-tech" key={name}><span>{['Py', '⚛', 'ƒ', 'sk', 'sp', '✧'][index]}</span>{name}</span>)}</div></div>
      <section id="overview" className="section-shell section-space reveal">
        <div className="overview-heading"><SectionIntro number="01" label="THE PURPOSE" title={<>More than answers.<br /><span className="muted-heading">A better understanding.</span></>} /><div className="overview-copy"><h3>Why Dynamic AI Chatbot?</h3><p>The Dynamic AI Chatbot demonstrates how traditional NLP techniques and modern generative AI can work together to understand user messages, recognize intent, analyze sentiment, maintain conversational context, and generate relevant responses.</p></div></div>
        <div className="purpose-grid">{purposes.map(({ icon: Icon, title, text, tag }, i) => <article className="purpose-card" key={title}><span className={`icon-box accent-${i}`}><Icon size={21} /></span><h3>{title}</h3><p>{text}</p><span className="purpose-tag">{tag}<ArrowUpRight size={13} /></span></article>)}</div>
      </section>
      <section id="features" className="section-band"><div className="section-shell section-space reveal">
        <div className="section-heading-row"><SectionIntro number="02" label="CAPABILITIES" title={<>Thoughtful features.<br /><span className="muted-heading">Smarter interactions.</span></>} text="A hybrid approach that brings language understanding and a useful conversation experience together." /><div className="feature-filters" role="group" aria-label="Filter features">{['All features', 'AI & NLP', 'Experience'].map(filter => <button type="button" key={filter} aria-pressed={category === filter} className={category === filter ? 'selected' : ''} onClick={() => setCategory(filter)}>{filter}</button>)}</div></div>
        <div className="feature-grid">{features.filter(feature => category === 'All features' || feature.category === category).map(({ icon: Icon, title, text, status }) => <article className="feature-card" key={title}><div className="feature-card-top"><span className="icon-box"><Icon size={20} /></span><span className={status === 'Implemented' ? 'feature-status' : 'feature-status conditional'}>{status === 'Implemented' && <Check size={10} />}{status}</span></div><h3>{title}</h3><p>{text}</p></article>)}</div>
        <p className="section-note"><ShieldCheck size={14} /> Implemented means present in this repository. Runtime availability depends on backend setup, model resources, and configuration.</p>
      </div></section>
      <section id="how-it-works" className="section-shell section-space reveal">
        <SectionIntro number="03" label="FROM MESSAGE TO MEANING" title={<>Every response has<br /><span className="muted-heading">a thoughtful journey.</span></>} text="Eight connected stages turn a message into an informed response. Select a stage to look inside." />
        <div className="pipeline-grid" role="group" aria-label="Processing pipeline">{steps.map(({ icon: Icon, title }, i) => <button type="button" key={title} className={step === i ? 'pipeline-step selected' : 'pipeline-step'} onClick={() => setStep(i)} aria-pressed={step === i}><span className="step-number">0{i + 1}</span><Icon size={23} /><strong>{title}</strong><ChevronRight className="pipeline-arrow" size={17} /></button>)}</div>
        <div className="pipeline-detail" aria-live="polite"><span className="icon-box"><StepIcon size={22} /></span><div><span className="eyebrow">STAGE 0{step + 1}</span><h3>{selectedStep.title}</h3><p>{selectedStep.text}</p></div><code>{selectedStep.file}</code></div>
      </section>
      <section id="technology" className="section-band"><div className="section-shell section-space reveal"><SectionIntro number="04" label="THE BUILDING BLOCKS" title={<>A practical stack.<br /><span className="muted-heading">Working in harmony.</span></>} text="The tools used in the project, each with a specific job. No unnecessary complexity." /><div className="technology-grid">{technologies.map(({ mark, name, role, color }) => <article key={name} className="technology-card"><span className={`technology-mark ${color}`}>{mark}</span><div><h3>{name}</h3><p>{role}</p></div></article>)}</div><p className="section-note">Also used: NumPy for model inference, Lucide for icons, and Git / GitHub for source control. The landing page adds CSS animations with reduced-motion support.</p></div></section>
      <section id="integration" className="section-shell section-space reveal">
        <div className="integration-grid"><div><SectionIntro number="05" label="GEMINI API INTEGRATION" title={<>Bring Generative Intelligence<br /><span className="gradient-text">Into the Conversation.</span></>} text="Gemini complements traditional NLP and machine learning with contextual responses for suitable open-ended requests." /><span className="integration-status"><span /> Backend integration implemented · live connectivity unverified</span><ol className="setup-list"><li>Obtain an API key through <External href="https://aistudio.google.com/apikey">Google AI Studio <ExternalLink size={11} /></External>.</li><li>Store the key in a local <code>.env</code> file.</li><li>Set <code>GEMINI_MODEL</code> to a currently supported model.</li><li>Load credentials exclusively on the backend.</li><li>Send requests through the backend response router.</li><li>Handle errors, timeouts, and rate limits with retries and local fallbacks.</li></ol><div className="integration-links"><External href={`${links.github}/blob/main/backend/services/llm_service.py`} className="text-link">View Integration on GitHub <ArrowUpRight size={15} /></External><External href={links.gemini} className="muted-link">Official documentation <ExternalLink size={13} /></External></div></div>
          <div className="integration-visual"><div className="code-window"><div className="code-window-header"><span className="window-dots"><i /><i /><i /></span><span>Secure configuration</span><ShieldCheck size={14} /></div><div className="code-tabs" role="group" aria-label="Configuration example">{(['Python', '.env'] as const).map(tab => <button type="button" key={tab} aria-pressed={codeTab === tab} className={tab === codeTab ? 'selected' : ''} onClick={() => { setCodeTab(tab); setCopied(false); }}>{tab}</button>)}<button type="button" className="copy-code" aria-label={copied ? 'Code copied' : 'Copy configuration example'} onClick={copy}>{copied ? <CheckCheck size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy'}</button></div><pre><code>{codeExamples[codeTab].split('\n').map((line, i) => <span className="code-line" key={i}><span className="line-number" aria-hidden="true">{i + 1}</span><span className={line.startsWith('#') ? 'code-comment' : line.includes('os.getenv') ? 'code-variable' : 'code-source'}>{line || ' '}</span></span>)}</code></pre><span className="copy-feedback" role="status">{copyError ? 'Clipboard unavailable. Select the example to copy it manually.' : copied ? 'Configuration example copied.' : ''}</span><div className="code-security"><ShieldCheck size={14} /><span>Your keys stay on the backend. Always.</span></div></div><div className="api-flow">{['User message', 'Backend API', 'Response router', 'Gemini API', 'Chatbot response'].map((label, i) => <span key={label}>{i > 0 && <ChevronRight size={12} />}<b>{label}</b></span>)}</div><p className="security-note">Commit only placeholder values in <code>.env.example</code>. Never commit <code>.env</code> or place API keys in frontend code. This page does not collect keys or call Gemini.</p></div>
        </div>
      </section>
      <section id="architecture" className="section-band"><div className="section-shell section-space reveal"><div className="section-heading-row"><SectionIntro number="06" label="SYSTEM ARCHITECTURE" title={<>Connected by design.<br /><span className="muted-heading">Clear at every layer.</span></>} text="The implemented architecture separates the interface, language understanding, response generation, and persistence." /><External href={`${links.github}/blob/main/docs/ARCHITECTURE.md`} className="button secondary small">Explore architecture <ArrowUpRight size={14} /></External></div><div className="architecture-grid">{architecture.map(({ icon: Icon, title, detail }, i) => <div key={title} className="architecture-node"><span className="architecture-order">0{i + 1}</span><Icon size={23} /><h3>{title}</h3><p>{detail}</p><ArrowRight className="architecture-arrow" size={16} /></div>)}</div><div className="architecture-branches"><span><Check size={13} /> Known intent → Deterministic / FAQ response</span><span><Sparkles size={13} /> Open-ended request → Gemini, when configured</span><span><ShieldCheck size={13} /> Provider unavailable → Local fallback</span></div></div></section>
      <section id="analytics" className="section-shell section-space reveal"><div className="section-heading-row"><SectionIntro number="07" label="CONVERSATIONAL INSIGHTS" title={<>Understand the conversation.<br /><span className="muted-heading">See the bigger picture.</span></>} text="Conversation counts, intent patterns, sentiment, and response latency — read directly from the existing analytics endpoints." /><a href="#app/analytics" className="text-link">Open full dashboard <ArrowUpRight size={15} /></a></div><Suspense fallback={<div className="analytics-panel analytics-state" role="status">Loading analytics view…</div>}><LandingAnalytics /></Suspense></section>
      <section id="roadmap" className="section-band"><div className="section-shell section-space reveal"><SectionIntro number="08" label="THE ROAD AHEAD" title={<>What’s Next for<br /><span className="muted-heading">Dynamic AI Chatbot?</span></>} text="A considered roadmap for deeper understanding, more useful experiences, and a stronger foundation." /><div className="roadmap-grid">{roadmap.map(({ icon: Icon, title, text }, i) => <article className="roadmap-card" key={title}><div><span className="roadmap-number">0{i + 1}</span><span className="planned-badge">Planned</span></div><Icon size={20} /><h3>{title}</h3><p>{text}</p></article>)}</div><p className="section-note">These are future enhancements. Basic browser voice, model evaluation scripts, and analytics already exist; the roadmap expands them.</p></div></section>
      <section id="developer" className="section-shell section-space reveal"><div className="developer-panel"><div className="developer-identity"><span className="eyebrow">09 · THE DEVELOPER</span><div className="developer-avatar">SM<span><Code2 size={18} /></span></div><h3>Surag M S</h3><p>Developer behind Dynamic AI Chatbot</p><span className="developer-team">Zidio Development — Team 17</span><div className="developer-socials"><External href={links.github} className="social-icon"><Github size={19} /><span className="sr-only">GitHub repository</span></External><External href={links.linkedin} className="social-icon"><Linkedin size={19} /><span className="sr-only">Surag on LinkedIn</span></External><External href={links.portfolio} className="social-icon"><ArrowUpRight size={20} /><span className="sr-only">Surag’s portfolio</span></External></div></div><div className="developer-story"><span className="eyebrow">INDIVIDUAL DEVELOPMENT. PRACTICAL LEARNING.</span><h2>Built Independently as<br /><span className="muted-heading">My Internship Final Project.</span></h2><p>This project was developed individually by Surag M S as the final project for the Zidio Development Internship under Team 17. The implementation, integration, and project development were completed independently without team development support.</p><div className="contribution-grid">{['Individual development', 'Practical AI and NLP implementation', 'Machine-learning experimentation', 'Backend and frontend integration', 'API integration and error handling', 'Testing and documentation'].map(item => <span key={item}><Check size={14} />{item}</span>)}</div><External href={links.portfolio} className="text-link">Get to know the developer <ArrowUpRight size={15} /></External></div></div></section>
      <section className="cta-section section-shell reveal"><span className="cta-spark"><Sparkles size={28} /></span><span className="eyebrow">CURIOUS ABOUT WHAT’S UNDER THE HOOD?</span><h2>Explore the Project.<br /><span className="gradient-text">Discover the Intelligence Behind It.</span></h2><p>Explore the implementation, review the source code, and learn more about the developer behind Dynamic AI Chatbot.</p><div className="cta-buttons"><External className="button primary" href={links.github}><Github size={17} />View GitHub Repository <ArrowUpRight size={15} /></External><External className="button secondary" href={links.linkedin}><Linkedin size={16} />Connect on LinkedIn</External><External className="button secondary" href={links.portfolio}>Visit My Portfolio <ArrowUpRight size={15} /></External></div><a href="#app/chat" className="text-link open-chat">Open chatbot workspace <ArrowRight size={14} /></a><small>Running the chatbot requires the project backend. Gemini responses also require backend configuration.</small></section>
    </main>
    <footer className="landing-footer"><div className="section-shell"><div className="footer-top"><div className="footer-brand"><a href="#home" className="brand"><span className="brand-logo"><Bot size={22} /></span><span>Dynamic AI Chatbot</span></a><p>Building smarter conversations through NLP,<br />machine learning, and generative AI.</p><strong>Zidio Development | Surag M S</strong></div><div className="footer-links"><span>EXPLORE</span>{navigation.slice(1, 5).map(([id, label]) => <a href={`#${id}`} key={id}>{label}</a>)}</div><div className="footer-links"><span>THE PROJECT</span><a href="#architecture">Architecture</a><a href="#analytics">Analytics</a><a href="#roadmap">Future Enhancements</a><a href="#developer">About Developer</a></div><div className="footer-links"><span>LET’S CONNECT</span><External href={links.github}>GitHub <ArrowUpRight size={12} /></External><External href={links.linkedin}>LinkedIn <ArrowUpRight size={12} /></External><External href={links.portfolio}>Website / Portfolio <ArrowUpRight size={12} /></External><a href="#app/chat">Open chatbot <ArrowUpRight size={12} /></a></div></div><div className="footer-bottom"><p>© 2026 Surag M S. Dynamic AI Chatbot — Zidio Development Internship Final Project, Team 17.</p><a href="#home">Back to top <ArrowUpRight size={13} /></a></div></div></footer>
  </div>;
}
