import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, BarChart3, Calendar, CheckCircle2, Clock, Cpu, Globe2, MessageSquare, PieChart as PieIcon, RefreshCw, ShieldAlert, Sparkles, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../services/api';
import { AnalyticsIntents, AnalyticsPerformance, AnalyticsSentiment, AnalyticsSummary } from '../../types';

const colors = ['#a08bed', '#829fe1', '#88b9a8', '#ca9bbd', '#d1b381', '#8a96b1'];
const axis = { stroke: 'var(--ws-muted)', fontSize: 10, tickLine: false, axisLine: false };
const tooltip = { contentStyle: { background: 'var(--ws-panel)', border: '1px solid var(--ws-line)', borderRadius: 8, color: 'var(--ws-text)', fontSize: 11 }, labelStyle: { color: 'var(--ws-text)' }, itemStyle: { color: 'var(--ws-text)' } };
const legend = { fontSize: 10, color: 'var(--ws-muted)' };

function ChartCard({ icon: Icon, title, detail, available, children, emptyText = 'No recorded data yet.', emptyDetail = 'Conversation activity will appear here.' }: { icon: typeof Activity; title: string; detail: string; available: boolean; children?: React.ReactNode; emptyText?: string; emptyDetail?: string }) {
  return <section className="ws-panel dashboard-chart"><div className="chart-card-heading"><h2><Icon size={16} />{title}</h2><span>{detail}</span></div><div className="dashboard-chart-canvas">{available ? children : <div className="chart-empty"><BarChart3 size={25} /><p>{emptyText}</p><span>{emptyDetail}</span></div>}</div></section>;
}

export const AnalyticsDashboard: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [sentiment, setSentiment] = useState<AnalyticsSentiment | null>(null);
  const [intents, setIntents] = useState<AnalyticsIntents | null>(null);
  const [performance, setPerformance] = useState<AnalyticsPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(false);
    Promise.all([api.getAnalyticsSummary(), api.getAnalyticsSentiment(), api.getAnalyticsIntents(), api.getAnalyticsPerformance()])
      .then(([sum, sent, intent, perf]) => { if (active) { setSummary(sum); setSentiment(sent); setIntents(intent); setPerformance(perf); } })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      await api.seedAnalyticsData();
      setAttempt(previous => previous + 1);
    } catch (e) {
      console.error('Failed to seed analytics data', e);
    } finally {
      setSeeding(false);
    }
  };

  const sentimentData = sentiment ? Object.entries(sentiment.distribution).map(([name, value]) => ({ name, value, color: name === 'positive' ? '#88b9a8' : name === 'negative' ? '#ce8c9f' : '#8a96b1' })).filter(item => item.value > 0) : [];
  const intentData = intents ? Object.entries(intents.intents).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name: name.replace(/_/g, ' '), count })) : [];
  const trend = performance?.response_time_trend.map((point, index) => ({ ...point, response: index + 1 })) || [];
  const daily = performance?.messages_over_time || [];
  const providers = Object.entries(performance?.provider_distribution || {}).map(([name, value]) => ({ name, value }));
  // The current backend synthesizes language counts instead of recording them.
  const hasResponses = (summary?.assistant_messages || 0) > 0;
  const metrics = summary ? [
    { icon: Users, label: 'Conversations', value: summary.total_conversations.toLocaleString(), detail: `${summary.avg_messages_per_session} messages per session` },
    { icon: MessageSquare, label: 'Total messages', value: summary.total_messages.toLocaleString(), detail: `${summary.user_messages} user · ${summary.assistant_messages} assistant` },
    { icon: Clock, label: 'Average response', value: hasResponses ? `${summary.avg_response_time_ms} ms` : '—', detail: hasResponses ? `P50 ${performance?.p50_ms ?? 0} ms · P95 ${performance?.p95_ms ?? 0} ms` : 'No response times recorded' },
    { icon: CheckCircle2, label: 'Successful routes', value: hasResponses ? `${summary.api_success_rate}%` : '—', detail: 'Includes Gemini and local handlers' },
    { icon: ShieldAlert, label: 'Fallback usage', value: hasResponses ? `${summary.fallback_rate}%` : '—', detail: `${summary.fallback_calls} local fallback responses` },
  ] : [];
  return <div className="workspace-page analytics-workspace" aria-busy={loading}>
    <div className="ws-page-heading heading-with-action">
      <div>
        <span className="ws-eyebrow">CONVERSATIONAL INSIGHTS</span>
        <h1>Every conversation<br /><span>tells a story.</span></h1>
        <p>Explore intent, sentiment, and response performance from your conversation database.</p>
      </div>
      <div className="analytics-heading-actions">
        <span className="ws-data-label"><i />Backend data</span>
        <button
          type="button"
          className="ws-button"
          disabled={loading || seeding}
          onClick={handleSeedData}
          title="Populate or reload realistic demo conversation metrics"
        >
          <Sparkles size={14} className={seeding ? 'ws-spin' : ''} />
          {seeding ? 'Loading sample...' : 'Load sample data'}
        </button>
        <button
          type="button"
          className="ws-button"
          disabled={loading}
          onClick={() => setAttempt(previous => previous + 1)}
        >
          <RefreshCw size={14} className={loading ? 'ws-spin' : ''} />
          Refresh data
        </button>
      </div>
    </div>
    {loading ? <div className="dashboard-loading" role="status"><RefreshCw size={24} className="ws-spin" /><h2>Reading your conversation insights…</h2><p>Fetching metrics from the project backend.</p></div> : error ? <div className="ws-panel dashboard-error" role="status"><AlertTriangle size={28} /><h2>Let’s reconnect the insights.</h2><p>The analytics backend is unavailable. Start the Flask server and try again.</p><button type="button" className="ws-button primary" onClick={() => setAttempt(previous => previous + 1)}><RefreshCw size={14} />Retry connection</button></div> : <>
      <div className="dashboard-metrics">{metrics.map(({ icon: Icon, label, value, detail }) => <article className="ws-panel dashboard-metric" key={label}><div><span>{label}</span><Icon size={17} /></div><strong>{value}</strong><p>{detail}</p></article>)}</div>
      {summary?.total_messages === 0 && (
        <div className="dashboard-empty-banner">
          <SparkleMessage />
          <div>
            <strong>A fresh start for your insights.</strong>
            <p>Send a message in Chat or populate sample conversation data.</p>
          </div>
          <button
            type="button"
            className="ws-button primary"
            style={{ marginLeft: 'auto' }}
            disabled={seeding}
            onClick={handleSeedData}
          >
            <Sparkles size={14} />
            {seeding ? 'Populating...' : 'Populate sample data'}
          </button>
        </div>
      )}
      <div className="dashboard-charts">
        <ChartCard icon={Calendar} title="Messages over time" detail="Daily message volume" available={daily.length > 0}><ResponsiveContainer width="100%" height="100%"><BarChart data={daily} margin={{ left: -15, top: 15, right: 5 }}><CartesianGrid vertical={false} stroke="var(--ws-line)" strokeDasharray="3 5" /><XAxis dataKey="date" {...axis} /><YAxis {...axis} allowDecimals={false} /><Tooltip {...tooltip} cursor={{ fill: 'var(--ws-hover)' }} /><Legend wrapperStyle={legend} verticalAlign="top" height={32} /><Bar dataKey="user" name="User" fill={colors[0]} radius={[4, 4, 0, 0]} isAnimationActive={false} /><Bar dataKey="assistant" name="Assistant" fill={colors[1]} radius={[4, 4, 0, 0]} isAnimationActive={false} /></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard icon={PieIcon} title="Sentiment distribution" detail={`${sentiment?.total_analyzed ?? 0} messages analyzed`} available={sentimentData.length > 0}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={sentimentData} innerRadius={62} outerRadius={88} paddingAngle={4} dataKey="value" stroke="none" isAnimationActive={false}>{sentimentData.map(item => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip {...tooltip} /><Legend wrapperStyle={{ ...legend, textTransform: 'capitalize' }} /></PieChart></ResponsiveContainer></ChartCard>
        <ChartCard icon={BarChart3} title="Intent distribution" detail="Most frequent intents" available={intentData.length > 0}><ResponsiveContainer width="100%" height="100%"><BarChart data={intentData} layout="vertical" margin={{ left: 5, top: 5, right: 15 }}><CartesianGrid horizontal={false} stroke="var(--ws-line)" strokeDasharray="3 5" /><XAxis type="number" {...axis} allowDecimals={false} /><YAxis dataKey="name" type="category" {...axis} width={110} /><Tooltip {...tooltip} cursor={{ fill: 'var(--ws-hover)' }} /><Bar dataKey="count" name="Messages" radius={[0, 4, 4, 0]} isAnimationActive={false}>{intentData.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}</Bar></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard icon={Activity} title="Response-time trend" detail="Recent responses · milliseconds" available={trend.length > 0}><ResponsiveContainer width="100%" height="100%"><LineChart data={trend} margin={{ left: -15, top: 15, right: 15 }}><CartesianGrid vertical={false} stroke="var(--ws-line)" strokeDasharray="3 5" /><XAxis dataKey="response" {...axis} /><YAxis {...axis} /><Tooltip {...tooltip} /><Line type="monotone" dataKey="response_time_ms" name="Response time (ms)" stroke={colors[0]} strokeWidth={2} dot={{ r: 3, fill: colors[0] }} isAnimationActive={false} /></LineChart></ResponsiveContainer></ChartCard>
        <ChartCard icon={Cpu} title="Response providers" detail="How replies were generated" available={providers.length > 0}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={providers} innerRadius={62} outerRadius={88} paddingAngle={4} dataKey="value" stroke="none" isAnimationActive={false}>{providers.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip {...tooltip} /><Legend wrapperStyle={legend} /></PieChart></ResponsiveContainer></ChartCard>
        <ChartCard icon={Globe2} title="Language usage" detail="English · Hindi · Hinglish" available={false} emptyText="Language usage is not recorded yet." emptyDetail="All three response languages are available in settings." />
      </div>
      {!!intents?.most_common_intents?.length && <section className="ws-panel common-intents"><h2>Most common intents</h2><div>{intents.most_common_intents.map(item => <article key={item.intent}><span>{item.intent.replace(/_/g, ' ')}</span><strong>{item.count}<small>{item.percentage}%</small></strong></article>)}</div></section>}
      <p className="dashboard-note">Metrics reflect recorded backend data. Successful routing includes local handlers and is not a Gemini uptime or model accuracy measure.</p>
    </>}
  </div>;
};

function SparkleMessage() { return <MessageSquare size={23} />; }
