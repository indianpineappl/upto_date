import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import TopicCard from './TopicCard';
import { Topic, UserPreference } from '../types';
import locationService from '../services/locationService';
import twitterService from '../services/twitterService';
import newsService from '../services/newsService';
import llmService from '../services/llmService';
import preferenceService from '../services/preferenceService';

const SwipeContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: pan-y;
`;

const CardStack = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoadingMessage = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.2rem;
  color: #e74c3c;
  padding: 20px;
  text-align: center;
`;

const ProgressIndicator = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 10;
`;

const ProgressDot = styled.div<{ active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.active ? '#6e8efb' : 'rgba(255, 255, 255, 0.3)'};
  transition: background 0.3s ease;
`;

const TopicSwipeView: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  
  // Fetch topics from all services
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get location data
        let locationData;
        try {
          locationData = await locationService.getCurrentLocation();
        } catch (err) {
          console.warn('Location not available, using default data');
        }
        
        // Fetch data from all services
        const [twitterTopics, newsTopics] = await Promise.all([
          twitterService.getTrendingTopics(),
          newsService.getLocalNews(locationData)
        ]);
        
        // Combine and deduplicate topics
        const allTopics = [...twitterTopics, ...newsTopics];
        const uniqueTopics = allTopics.filter((topic, index, self) => 
          index === self.findIndex(t => t.title === topic.title)
        );
        
        // Get user preferences for ranking
        const topicScores = preferenceService.getAllTopicScores();
        
        // Sort by user preferences, then by relevance and trend score
        uniqueTopics.sort((a, b) => {
          // First sort by user preference score (descending)
          const aPrefScore = topicScores[a.id] || 0;
          const bPrefScore = topicScores[b.id] || 0;
          
          if (aPrefScore !== bPrefScore) {
            return bPrefScore - aPrefScore;
          }
          
          // Then sort by relevance and trend score
          const aScore = (a.trendScore || 0) + (a.locationRelevance || 0);
          const bScore = (b.trendScore || 0) + (b.locationRelevance || 0);
          return bScore - aScore;
        });
        
        setTopics(uniqueTopics);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError('Failed to load topics. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchTopics();
  }, []);
  
  const updatePreferences = (topicId: string, preference: number) => {
    const newPreference: UserPreference = {
      topicId,
      preferenceScore: preference,
      timestamp: Date.now()
    };
    
    // Save to preference service
    preferenceService.addPreference(newPreference);
    
    setPreferences(prev => {
      // Remove existing preference for this topic
      const filtered = prev.filter(p => p.topicId !== topicId);
      // Add new preference
      return [...filtered, newPreference];
    });
  };
  
  const handleSwipeLeft = () => {
    // User doesn't like this topic, decrease its rank
    const currentTopic = topics[currentIndex];
    updatePreferences(currentTopic.id, -1);
    
    // Move to next topic
    if (currentIndex < topics.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Loop back to the beginning
      setCurrentIndex(0);
    }
  };
  
  const handleSwipeRight = () => {
    // User likes this topic, increase its rank
    const currentTopic = topics[currentIndex];
    updatePreferences(currentTopic.id, 1);
    
    // Move to next topic
    if (currentIndex < topics.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Loop back to the beginning
      setCurrentIndex(0);
    }
  };
  
  const handleDigDeeper = () => {
    const currentTopic = topics[currentIndex];
    console.log('Dig deeper clicked for:', currentTopic.title);
    // In a full implementation, this would navigate to the detail view
  };
  
  if (loading) {
    return (
      <LoadingMessage
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Loading topics for you...
      </LoadingMessage>
    );
  }
  
  if (error) {
    return (
      <ErrorMessage
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {error}
      </ErrorMessage>
    );
  }
  
  if (topics.length === 0) {
    return (
      <LoadingMessage
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        No topics available at the moment. Check back later!
      </LoadingMessage>
    );
  }
  
  return (
    <SwipeContainer>
      <CardStack>
        <TopicCard 
          topic={topics[currentIndex]} 
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onDigDeeper={handleDigDeeper}
        />
      </CardStack>
      
      <ProgressIndicator>
        {topics.map((_, index) => (
          <ProgressDot 
            key={index} 
            active={index === currentIndex}
          />
        ))}
      </ProgressIndicator>
    </SwipeContainer>
  );
};

export default TopicSwipeView;
