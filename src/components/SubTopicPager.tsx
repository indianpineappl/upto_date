import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { SubTopic, Topic } from '../types';
import SubTopicDetail from './SubTopicDetail';

const PagerContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
`;

const PagerHeader = styled.div`
  padding: 15px 20px;
  background: #282c34;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const CloseButton = styled(motion.button)`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px 10px;
  
  &:hover {
    opacity: 0.8;
  }
`;

const TopicTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  flex: 1;
  text-align: center;
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PagerContent = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const PagerFooter = styled.div`
  padding: 15px 20px;
  background: #282c34;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const PageIndicator = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const NavButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
  }
  
  &:active:not(:disabled) {
    background: rgba(255, 255, 255, 0.4);
  }
`;

const DetailButton = styled(motion.button)`
  margin-top: 20px;
  padding: 12px 24px;
  background: #6e8efb;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #5a7cff;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
`;

interface SubTopicPagerProps {
  topic: Topic;
  initialIndex?: number;
  onClose: () => void;
}

const SubTopicPager: React.FC<SubTopicPagerProps> = ({ topic, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedSubTopic, setSelectedSubTopic] = useState<SubTopic | null>(null);
  
  const currentSubTopic = topic.subTopics[currentIndex];
  
  const handleNext = () => {
    if (currentIndex < topic.subTopics.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleViewDetail = () => {
    setSelectedSubTopic(currentSubTopic);
    setShowDetail(true);
  };
  
  const handleBackFromDetail = () => {
    setShowDetail(false);
    setSelectedSubTopic(null);
  };
  
  // Reset to first subtopic when topic changes
  useEffect(() => {
    setCurrentIndex(0);
    setShowDetail(false);
  }, [topic.id]);
  
  if (showDetail && selectedSubTopic) {
    return (
      <SubTopicDetail 
        topic={topic} 
        subTopic={selectedSubTopic} 
        onBack={handleBackFromDetail} 
      />
    );
  }
  
  return (
    <PagerContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PagerHeader>
        <CloseButton 
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Close"
        >
          ✕
        </CloseButton>
        <TopicTitle>{topic.title}</TopicTitle>
        <div style={{ width: '40px' }}></div> {/* Spacer for alignment */}
      </PagerHeader>
      
      <PagerContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <h2>{currentSubTopic.title}</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '500px' }}>{currentSubTopic.summary}</p>
            <DetailButton 
              onClick={handleViewDetail}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="View detailed analysis"
            >
              View Detailed Analysis
            </DetailButton>
          </motion.div>
        </AnimatePresence>
      </PagerContent>
      
      <PagerFooter>
        <NavButton 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          whileHover={{ scale: !currentIndex ? 1 : 1.1 }}
          whileTap={{ scale: !currentIndex ? 1 : 0.9 }}
          aria-label="Previous sub-topic"
        >
          ←
        </NavButton>
        <PageIndicator>
          {currentIndex + 1} of {topic.subTopics.length}
        </PageIndicator>
        <NavButton 
          onClick={handleNext} 
          disabled={currentIndex === topic.subTopics.length - 1}
          whileHover={{ scale: currentIndex === topic.subTopics.length - 1 ? 1 : 1.1 }}
          whileTap={{ scale: currentIndex === topic.subTopics.length - 1 ? 1 : 0.9 }}
          aria-label="Next sub-topic"
        >
          →
        </NavButton>
      </PagerFooter>
    </PagerContainer>
  );
};

export default SubTopicPager;
