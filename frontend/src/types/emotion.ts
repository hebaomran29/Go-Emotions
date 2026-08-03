export type EmotionName = 'Joy' | 'Sadness' | 'Anger' | 'Fear' | 'Disgust' | 'Surprise';

export interface EmotionScore {
  name: EmotionName;
  score: number;
}

export interface AttentionWord {
  word: string;
  weight: number;
}

export interface PredictionResult {
  dominant: EmotionName;
  scores: EmotionScore[];
  attentionWords: AttentionWord[];
  model: string;
}

export interface EmotionConfig {
  name: EmotionName;
  color: string;
  glowColor: string;
  bgGradient: string;
  floorColor: string;
  accentColor: string;
  lightColor: string;
  darkColor: string;
  label: string;
  personality: string;
}
