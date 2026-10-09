import { ChatResponse, HealthStatus, AnalyticsSummary, AnalyticsSentiment, AnalyticsIntents, AnalyticsPerformance } from '../types';

const API_BASE = '/api';

export const api = {
  async checkHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async sendMessage(payload: {
    message: string;
    session_id?: string;
    language?: string;
    temperature?: number;
  }): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send message');
    }
    return res.json();
  },

  async getConversation(sessionId: string) {
    const res = await fetch(`${API_BASE}/conversations/${sessionId}`);
    if (!res.ok) throw new Error('Failed to fetch conversation');
    return res.json();
  },

  async clearConversation(sessionId: string) {
    const res = await fetch(`${API_BASE}/conversations/${sessionId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to clear conversation');
    return res.json();
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    if (!res.ok) throw new Error('Failed to fetch analytics summary');
    return res.json();
  },

  async getAnalyticsSentiment(): Promise<AnalyticsSentiment> {
    const res = await fetch(`${API_BASE}/analytics/sentiment`);
    if (!res.ok) throw new Error('Failed to fetch sentiment analytics');
    return res.json();
  },

  async getAnalyticsIntents(): Promise<AnalyticsIntents> {
    const res = await fetch(`${API_BASE}/analytics/intents`);
    if (!res.ok) throw new Error('Failed to fetch intent analytics');
    return res.json();
  },

  async getAnalyticsPerformance(): Promise<AnalyticsPerformance> {
    const res = await fetch(`${API_BASE}/analytics/performance`);
    if (!res.ok) throw new Error('Failed to fetch performance analytics');
    return res.json();
  },

  async exportChat(sessionId: string, format: 'json' | 'csv' | 'txt') {
    const res = await fetch(`${API_BASE}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, format }),
    });
    if (!res.ok) throw new Error('Failed to export chat');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_export_${sessionId.slice(0, 8)}.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};
