export interface SubTopic {
  id: string;
  title: string;
  summary: string;
}

export interface Topic {
  id: string;
  title: string;
  summary: string;
  subTopics: SubTopic[];
  imageUrl?: string;
  source?: string;
  trendScore?: number;
  locationRelevance?: number;
}

export interface UserPreference {
  topicId: string;
  preferenceScore: number; // -1 for dislike, 1 for like
  timestamp: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}
