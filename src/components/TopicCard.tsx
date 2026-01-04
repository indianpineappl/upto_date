import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Topic } from '../types';

const CardContainer = styled(motion.div)`
  position: absolute;
  width: 90%;
  max-width: 350px;
  height: 70%;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: grab;
  user-select: none;
`;

const CardHeader = styled.div`
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  text-align: center;
`;

const CardTitle = styled.h2`
  margin: 0;
  color: white;
  font-size: 1.5rem;
  text-align: center;
`;

const CardContent = styled.div`
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  color: white;
  font-size: 1rem;
  line-height: 1.5;
`;

const CardFooter = styled.div`
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.1);
`;

const ActionButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.4);
  }
`;

const SubTopicList = styled.ul`
  padding-left: 20px;
  margin: 10px 0;
`;

const SubTopicItem = styled(motion.li)`
  margin-bottom: 8px;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const TrendingBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 0.8rem;
  margin-left: 10px;
  vertical-align: middle;
`;

const SourceInfo = styled.div`
  font-size: 0.8rem;
  opacity: 0.8;
  margin-top: 10px;
  text-align: right;
`;

interface TopicCardProps {
  topic: Topic;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onDigDeeper: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onSwipeLeft, onSwipeRight, onDigDeeper }) => {
  return (
    <CardContainer
      drag="x"
      dragConstraints={{ left: -300, right: 300 }}
      onDragEnd={(event, info) => {
        if (info.offset.x > 100) {
          onSwipeRight();
        } else if (info.offset.x < -100) {
          onSwipeLeft();
        }
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 300 }}
    >
      <CardHeader>
        <CardTitle>
          {topic.title}
          {topic.trendScore && topic.trendScore > 80 && (
            <TrendingBadge>Hot</TrendingBadge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <p>{topic.summary}</p>
        
        <h3>Sub-topics:</h3>
        <SubTopicList>
          <AnimatePresence>
            {topic.subTopics.map((subTopic, index) => (
              <SubTopicItem 
                key={subTopic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <strong>{subTopic.title}:</strong> {subTopic.summary}
              </SubTopicItem>
            ))}
          </AnimatePresence>
        </SubTopicList>
        
        {topic.source && (
          <SourceInfo>Source: {topic.source}</SourceInfo>
        )}
      </CardContent>
      
      <CardFooter>
        <ActionButton 
          onClick={onSwipeLeft}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Not interested"
        >
          ✕
        </ActionButton>
        <ActionButton 
          onClick={onDigDeeper}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Dig deeper"
        >
          ↓
        </ActionButton>
        <ActionButton 
          onClick={onSwipeRight}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Interested"
        >
          ✓
        </ActionButton>
      </CardFooter>
    </CardContainer>
  );
};

export default TopicCard;
