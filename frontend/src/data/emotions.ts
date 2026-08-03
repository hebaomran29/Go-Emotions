import type { EmotionConfig, EmotionName, PredictionResult } from '@/types/emotion';

export const EMOTIONS: Record<EmotionName, EmotionConfig> = {
  Joy: {
    name: 'Joy',
    color: '#ffd60a',
    glowColor: '#ffd60a',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(255,214,10,0.25) 0%, rgba(255,180,0,0.12) 35%, rgba(15,20,50,0) 70%)',
    floorColor: 'rgba(255,214,10,0.35)',
    accentColor: '#ffe066',
    lightColor: '#fff3b0',
    darkColor: '#b8860b',
    label: 'JOY',
    personality: 'energetic',
  },
  Sadness: {
    name: 'Sadness',
    color: '#3b82f6',
    glowColor: '#6ba3ff',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(59,130,246,0.25) 0%, rgba(30,90,200,0.12) 35%, rgba(15,20,50,0) 70%)',
    floorColor: 'rgba(59,130,246,0.35)',
    accentColor: '#93c5fd',
    lightColor: '#bfdbfe',
    darkColor: '#1e3a8a',
    label: 'SADNESS',
    personality: 'slow',
  },
  Anger: {
    name: 'Anger',
    color: '#ef4444',
    glowColor: '#ff6b6b',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(239,68,68,0.30) 0%, rgba(200,30,30,0.15) 35%, rgba(15,20,50,0) 70%)',
    floorColor: 'rgba(239,68,68,0.35)',
    accentColor: '#fca5a5',
    lightColor: '#fecaca',
    darkColor: '#991b1b',
    label: 'ANGER',
    personality: 'aggressive',
  },
  Fear: {
    name: 'Fear',
    color: '#a855f7',
    glowColor: '#c084fc',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(168,85,247,0.25) 0%, rgba(120,40,180,0.12) 35%, rgba(15,20,50,0) 70%)',
    floorColor: 'rgba(168,85,247,0.35)',
    accentColor: '#d8b4fe',
    lightColor: '#e9d5ff',
    darkColor: '#6b21a8',
    label: 'FEAR',
    personality: 'nervous',
  },
  Disgust: {
    name: 'Disgust',
    color: '#22c55e',
    glowColor: '#4ade80',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(34,197,94,0.25)  0%, rgba(20,150,60,0.12) 35%, rgba(15,20,50,0) 70%)',
    floorColor: 'rgba(34,197,94,0.35)',
    accentColor: '#86efac',
    lightColor: '#bbf7d0',
    darkColor: '#166534',
    label: 'DISGUST',
    personality: 'unimpressed',
  },
  Surprise: {
    name: 'Surprise',
    color: '#f97316',
    glowColor: '#fb923c',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(249,115,22,0.25) 0%, rgba(220,90,10,0.12) 35%, rgba(15,20,50,0) 70%)',
    floorColor: 'rgba(249,115,22,0.35)',
    accentColor: '#fdba74',
    lightColor: '#fed7aa',
    darkColor: '#9a3412',
    label: 'SURPRISE',
    personality: 'sudden',
  },
};

export const EMOTION_ORDER: EmotionName[] = ['Joy', 'Sadness', 'Anger', 'Fear', 'Disgust', 'Surprise'];

// Backend returns lowercase emotion names; map to frontend PascalCase
const BACKEND_TO_FRONTEND: Record<string, EmotionName> = {
  joy: 'Joy',
  sadness: 'Sadness',
  anger: 'Anger',
  fear: 'Fear',
  surprise: 'Surprise',
  disgust: 'Disgust',
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function analyzeEmotion(text: string): Promise<PredictionResult> {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(detail.detail || `Server error ${response.status}`);
  }

  const data = await response.json();
  const dominant: EmotionName = BACKEND_TO_FRONTEND[data.emotion] ?? 'Joy';

  const scores = EMOTION_ORDER.map((e) => ({
    name: e,
    score: Math.round((data.probabilities[e.toLowerCase()] ?? 0) * 100),
  }));

  return {
    dominant,
    scores,
    attentionWords: [],
    model: 'DistilBERT V8',
  };
}
