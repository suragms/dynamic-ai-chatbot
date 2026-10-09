import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Activity,
  Calendar,
  Globe2,
  Cpu,
  ShieldAlert,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { api } from '../../services/api';
import {
  AnalyticsSummary,
  AnalyticsSentiment,
  AnalyticsIntents,
  AnalyticsPerformance,
} from '../../types';

const SENTIMENT_COLORS = {
  positive: '#10b981', // Emerald
  neutral: '#64748b',  // Slate
  negative: '#f43f5e', // Rose
};

const INTENT_COLORS = ['#14b8a6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6'];
const PROVIDER_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#64748b'];

export const AnalyticsDashboard: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [sentiment, setSentiment] = useState<AnalyticsSentiment | null>(null);
  const [intents, setIntents] = useState<AnalyticsIntents | null>(null);
  const [performance, setPerformance] = useState<AnalyticsPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, sentRes, intRes, perfRes] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getAnalyticsSentiment(),
        api.getAnalyticsIntents(),
        api.getAnalyticsPerformance(),
      ]);
      setSummary(sumRes);
      setSentiment(sentRes);
      setIntents(intRes);
      setPerformance(perfRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const sentimentData = sentiment
    ? [
        { name: 'Positive', value: sentiment.distribution.positive, color: SENTIMENT_COLORS.positive },
        { name: 'Neutral', value: sentiment.distribution.neutral, color: SENTIMENT_COLORS.neutral },
        { name: 'Negative', value: sentiment.distribution.negative, color: SENTIMENT_COLORS.negative },
      ].filter((d) => d.value > 0)
    : [];

  const intentData = intents
    ? Object.entries(intents.intents)
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }))
    : [];

  const responseTrendData = performance?.response_time_trend || [];
  const messagesOverTimeData = performance?.messages_over_time || [];

  const providerDistributionData = performance?.provider_distribution
    ? Object.entries(performance.provider_distribution).map(([name, value]) => ({ name, value }))
    : [];

  const languageUsageData = performance?.language_usage
    ? Object.entries(performance.language_usage).map(([name, count]) => ({ name, count }))
    : [];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-900 space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-500" />
            <span>Chatbot Analytics & Intelligence Dashboard</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time performance metrics, sentiment analysis breakdown, and ML intent statistics from database.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Conversations */}
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Conversations</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {summary?.total_conversations ?? 0}
          </div>
          <p className="text-[11px] text-slate-400">Avg {summary?.avg_messages_per_session ?? 0} msgs/session</p>
        </div>

        {/* Total Messages */}
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Messages</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {summary?.total_messages ?? 0}
          </div>
          <p className="text-[11px] text-slate-400">
            {summary?.user_messages ?? 0} User / {summary?.assistant_messages ?? 0} AI
          </p>
        </div>

        {/* Avg Response Time */}
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Latency</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {summary?.avg_response_time_ms ? `${summary.avg_response_time_ms} ms` : '0 ms'}
          </div>
          <p className="text-[11px] text-slate-400">P50: {performance?.p50_ms ?? 0}ms | P95: {performance?.p95_ms ?? 0}ms</p>
        </div>

        {/* API Success Rate */}
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">API Success Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {summary?.api_success_rate ?? 100}%
          </div>
          <p className="text-[11px] text-slate-400">
            Gemini ({summary?.gemini_percentage ?? 0}%) + Intent ({summary?.intent_engine_calls ?? 0})
          </p>
        </div>

        {/* Fallback Rate */}
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Fallback Rate</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {summary?.fallback_rate ?? 0}%
          </div>
          <p className="text-[11px] text-slate-400">
            {summary?.fallback_calls ?? 0} Local fallback instances
          </p>
        </div>
      </div>

      {/* 6 Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Messages Over Time */}
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-500" />
              <span>1. Messages Over Time</span>
            </h3>
            <span className="text-xs text-slate-400">Daily Message Volume</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            {messagesOverTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={messagesOverTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="user" fill="#14b8a6" name="User Messages" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="assistant" fill="#6366f1" name="Assistant Messages" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 italic">No daily message data available.</p>
            )}
          </div>
        </div>

        {/* Chart 2: Sentiment Distribution */}
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-500" />
              <span>2. Sentiment Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">
              {sentiment?.total_analyzed ?? 0} Analyzed
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            {sentimentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 italic">No sentiment analysis data recorded yet.</p>
            )}
          </div>
        </div>

        {/* Chart 3: Intent Distribution */}
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>3. Intent Distribution (Top ML Intents)</span>
            </h3>
            <span className="text-xs text-slate-400">
              {intents?.total_detected ?? 0} Classified
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            {intentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={intentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#14b8a6" radius={[6, 6, 0, 0]}>
                    {intentData.map((_, index) => (
                      <Cell key={`bar-${index}`} fill={INTENT_COLORS[index % INTENT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 italic">No intent predictions recorded yet.</p>
            )}
          </div>
        </div>

        {/* Chart 4: Response Time Trend */}
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              <span>4. Response-Time Trend (Recent Latencies)</span>
            </h3>
            <span className="text-xs text-slate-400">Latency in ms</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            {responseTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="response_time_ms" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Latency (ms)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 italic">No latency trend data recorded yet.</p>
            )}
          </div>
        </div>

        {/* Chart 5: Provider Success/Distribution */}
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-500" />
              <span>5. Provider Call Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">Gemini vs Intent vs Fallback</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            {providerDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={providerDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {providerDistributionData.map((_, index) => (
                      <Cell key={`prov-${index}`} fill={PROVIDER_COLORS[index % PROVIDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 italic">No provider distribution data available.</p>
            )}
          </div>
        </div>

        {/* Chart 6: Language Usage */}
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-purple-500" />
              <span>6. Multilingual Usage Stats</span>
            </h3>
            <span className="text-xs text-slate-400">English, Hindi, Hinglish</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            {languageUsageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={languageUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Sessions/Messages" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 italic">No language usage statistics recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information: Top Intent Breakdown & Percentages */}
      {intents?.most_common_intents && intents.most_common_intents.length > 0 && (
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Most Common Intent Categories Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {intents.most_common_intents.map((item) => (
              <div key={item.intent} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
                <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider truncate">
                  {item.intent}
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {item.count} <span className="text-xs font-normal text-slate-400">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

