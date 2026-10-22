import { useEffect, useRef, useState } from 'react';
import { Activity, ArrowUpRight, BarChart3, RefreshCw } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../services/api';
import { AnalyticsIntents, AnalyticsPerformance, AnalyticsSentiment, AnalyticsSummary } from '../../types';

type Data = { summary: AnalyticsSummary; sentiment: AnalyticsSentiment; intents: AnalyticsIntents; performance: AnalyticsPerformance };
export default function LandingAnalytics() {
  const section = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Data | null>(null);
  const [state, setState] = useState<'waiting' | 'loading' | 'ready' | 'error'>('waiting');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const load = async () => {
      setState('loading');
      try {
        const [summary, sentiment, intents, performance] = await Promise.all([api.getAnalyticsSummary(), api.getAnalyticsSentiment(), api.getAnalyticsIntents(), api.getAnalyticsPerformance()]);
        if (active) { setData({ summary, sentiment, intents, performance }); setState('ready'); }
      } catch { if (active) setState('error'); }
    };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); void load(); }
    }, { rootMargin: '120px' });
    if (section.current) observer.observe(section.current);
    return () => { active = false; observer.disconnect(); };
  }, [attempt]);
  const metrics = data ? [
    ['Conversations', data.summary.total_conversations.toLocaleString()],
    ['Messages', data.summary.total_messages.toLocaleString()],
    ['Average response', `${data.summary.avg_response_time_ms} ms`],
    ['Fallback usage', `${data.summary.fallback_rate}%`],
  ] : [];
  return <div className="analytics-panel" ref={section} aria-busy={state === 'loading'}>
    <div className="panel-heading"><span><Activity size={17} /> Conversation overview</span><span className="data-label">Backend data</span></div>
    <div aria-live="polite">
      {(state === 'waiting' || state === 'loading') && <div className="analytics-state"><RefreshCw size={25} className="loading-spin" /><h3>Loading conversation insights</h3><p>Reading metrics from the project’s analytics API.</p></div>}
      {state === 'error' && <div className="analytics-state"><BarChart3 size={32} /><h3>Your conversations become insights.</h3><p>The analytics backend is unavailable. Start the Flask server to view real conversation counts, sentiment, intents, and response times.</p><button type="button" className="button secondary small" onClick={() => setAttempt(value => value + 1)}><RefreshCw size={14} /> Retry connection</button><small>No simulated performance data is displayed.</small></div>}
      {state === 'ready' && data && <>
        <div className="analytics-metrics">{metrics.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
        {data.summary.total_messages === 0 ? <div className="analytics-state"><BarChart3 size={28} /><h3>A fresh start.</h3><p>No conversations have been recorded yet. Send a message in the chatbot to begin collecting insights.</p><a href="#app/chat" className="text-link">Start a conversation <ArrowUpRight size={14} /></a></div> : <div className="analytics-charts">
          <div><h3>Messages over time</h3>{data.performance.messages_over_time.length ? <div className="trend-chart" role="img" aria-label={`Daily message volume: ${data.performance.messages_over_time.map(point => `${point.date}: ${point.total}`).join(', ')}`}><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.performance.messages_over_time} margin={{ left: -20, right: 10 }}><defs><linearGradient id="message-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b7cf8" stopOpacity={0.3} /><stop offset="100%" stopColor="#8b7cf8" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#232735" /><XAxis dataKey="date" stroke="#a6adc3" fontSize={10} /><YAxis stroke="#a6adc3" fontSize={10} allowDecimals={false} /><Tooltip contentStyle={{ background: '#161927', border: '1px solid #363b50', borderRadius: 8 }} /><Area isAnimationActive={false} type="monotone" dataKey="total" name="Messages" stroke="#9b8aff" strokeWidth={2} fill="url(#message-fill)" /></AreaChart></ResponsiveContainer></div> : <p className="muted">No daily data available.</p>}</div>
          <div className="distribution"><h3>Intent distribution</h3>{Object.entries(data.intents.intents).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([intent, count]) => <div className="distribution-row" key={intent}><span>{intent.replace(/_/g, ' ')} <b>{count}</b></span><div><i style={{ width: `${count / Math.max(1, data.intents.total_detected) * 100}%` }} /></div></div>)}{!data.intents.total_detected && <p className="muted">No intent data available.</p>}<h3>Message sentiment</h3><div className="sentiment-legend">{Object.entries(data.sentiment.distribution).map(([label, count]) => <span key={label}><i className={label} />{label} <b>{count}</b></span>)}</div></div>
        </div>}
        <div className="analytics-bottom"><span>{data.summary.assistant_messages > 0 ? `Successful response routing: ${data.summary.api_success_rate}% · Includes local handlers; this is not a Gemini uptime metric.` : 'No assistant responses recorded yet. Response rates become available after a conversation.'}</span><button type="button" aria-label="Refresh analytics" onClick={() => setAttempt(value => value + 1)}><RefreshCw size={14} /></button></div>
      </>}
    </div>
  </div>;
}


