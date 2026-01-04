// Mock implementation for demonstration
// In a real implementation, this would use localStorage or a backend database

import { UserPreference } from '../types';

export class PreferenceService {
  private static instance: PreferenceService;
  private storageKey = 'uptodate_preferences';
  
  private constructor() {}
  
  public static getInstance(): PreferenceService {
    if (!PreferenceService.instance) {
      PreferenceService.instance = new PreferenceService();
    }
    return PreferenceService.instance;
  }
  
  /**
   * Save user preferences to storage
   */
  public savePreferences(preferences: UserPreference[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }
  
  /**
   * Load user preferences from storage
   */
  public loadPreferences(): UserPreference[] {
    try {
      const preferences = localStorage.getItem(this.storageKey);
      return preferences ? JSON.parse(preferences) : [];
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return [];
    }
  }
  
  /**
   * Add a new preference
   */
  public addPreference(preference: UserPreference): void {
    const preferences = this.loadPreferences();
    // Remove existing preference for this topic
    const filtered = preferences.filter(p => p.topicId !== preference.topicId);
    // Add new preference
    const updated = [...filtered, preference];
    this.savePreferences(updated);
  }
  
  /**
   * Calculate topic score based on user preferences
   */
  public calculateTopicScore(topicId: string): number {
    const preferences = this.loadPreferences();
    const topicPreferences = preferences.filter(p => p.topicId === topicId);
    
    if (topicPreferences.length === 0) {
      return 0; // Neutral score
    }
    
    // Calculate weighted average, giving more weight to recent preferences
    const now = Date.now();
    let totalScore = 0;
    let totalWeight = 0;
    
    topicPreferences.forEach(pref => {
      // Weight decreases as preference gets older (7 days half-life)
      const ageInDays = (now - pref.timestamp) / (1000 * 60 * 60 * 24);
      const weight = Math.pow(0.5, ageInDays / 7);
      
      totalScore += pref.preferenceScore * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }
  
  /**
   * Get all topic scores
   */
  public getAllTopicScores(): Record<string, number> {
    const preferences = this.loadPreferences();
    const topicScores: Record<string, number> = {};
    
    // Get unique topic IDs
    const topicIds = Array.from(new Set(preferences.map(p => p.topicId)));
    
    // Calculate score for each topic
    topicIds.forEach(topicId => {
      topicScores[topicId] = this.calculateTopicScore(topicId);
    });
    
    return topicScores;
  }
  
  /**
   * Clear all preferences
   */
  public clearPreferences(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear preferences:', error);
    }
  }
}

export default PreferenceService.getInstance();
