export interface Entity {
  text: string;
  label: string;
}

export interface Analysis {
  intent: string;
  intent_confidence: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_score: number;
  entities: Entity[];
}

export interface Performance {
  response_time_ms: number;
}

export interface MessageItem {
  id?: string | number;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  analysis?: Analysis;
  performance?: Performance;
  provider?: string;
  isError?: boolean;
}

export interface ChatResponse {
  success: boolean;
  session_id: string;
  message: {
    role: 'assistant';
    content: string;
  };
  analysis: Analysis;
  performance: Performance;
  provider: string;
  error?: string;
}

export interface HealthStatus {
  status: string;
  gemini_api_configured: boolean;
  gemini_model: string;
  intent_model_loaded: boolean;
  confidence_threshold: number;
  max_context_messages: number;
}

export interface AnalyticsSummary {
  total_conversations: number;
  total_messages: number;
  user_messages: number;
  assistant_messages: number;
  avg_messages_per_session: number;
  avg_response_time_ms: number;
  api_success_rate: number;
  fallback_rate: number;
  gemini_calls: number;
  gemini_percentage: number;
  fallback_calls: number;
  fallback_percentage: number;
  intent_engine_calls: number;
}

export interface AnalyticsSentiment {
  total_analyzed: number;
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  percentages: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface MostCommonIntent {
  intent: string;
  count: number;
  percentage: number;
}

export interface AnalyticsIntents {
  total_detected: number;
  intents: Record<string, number>;
  most_common_intents?: MostCommonIntent[];
}

export interface ResponseTimeTrendPoint {
  id: number;
  timestamp: string;
  response_time_ms: number;
  provider: string;
}

export interface MessagesOverTimePoint {
  date: string;
  total: number;
  user: number;
  assistant: number;
}

export interface AnalyticsPerformance {
  count: number;
  avg_ms: number;
  p50_ms: number;
  p95_ms: number;
  response_time_trend: ResponseTimeTrendPoint[];
  messages_over_time: MessagesOverTimePoint[];
  provider_distribution: Record<string, number>;
  language_usage: Record<string, number>;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi' | 'hinglish';
  temperature: number;
  showTimestamps: boolean;
  enableSentiment: boolean;
  contextMemory: boolean;
}
