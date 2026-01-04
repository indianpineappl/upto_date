import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { SubTopic, Topic } from '../types';

const DetailContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
`;

const DetailHeader = styled.div`
  padding: 20px;
  background: #282c34;
  color: white;
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const BackButton = styled(motion.button)`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px 10px;
  margin-right: 10px;
  
  &:hover {
    opacity: 0.8;
  }
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.3rem;
  flex: 1;
  text-align: center;
  padding-right: 40px; /* Space for back button */
`;

const DetailContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  line-height: 1.6;
`;

const LoadingContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled(motion.div)`
  padding: 20px;
  color: #e74c3c;
  text-align: center;
`;

const SummarySection = styled(motion.div)`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: #282c34;
  border-bottom: 2px solid #6e8efb;
  padding-bottom: 5px;
  margin-top: 0;
`;

const RelatedImage = styled(motion.img)`
  width: 100%;
  border-radius: 10px;
  margin: 20px 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

interface SubTopicDetailProps {
  topic: Topic;
  subTopic: SubTopic;
  onBack: () => void;
}

const SubTopicDetail: React.FC<SubTopicDetailProps> = ({ topic, subTopic, onBack }) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  useEffect(() => {
    const fetchSummaryAndImage = async () => {
      try {
        setLoading(true);
        setError(null);

        setSummary(subTopic.summary);
        setImageUrl(topic.imageUrl || '');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching summary or image:', err);
        setError('Failed to load content. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchSummaryAndImage();
  }, [topic, subTopic]);
  
  if (loading) {
    return (
      <DetailContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DetailHeader>
          <BackButton 
            onClick={onBack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Go back"
          >
            ←
          </BackButton>
          <HeaderTitle>{subTopic.title}</HeaderTitle>
        </DetailHeader>
        <LoadingContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading content...
        </LoadingContainer>
      </DetailContainer>
    );
  }
  
  if (error) {
    return (
      <DetailContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DetailHeader>
          <BackButton 
            onClick={onBack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Go back"
          >
            ←
          </BackButton>
          <HeaderTitle>{subTopic.title}</HeaderTitle>
        </DetailHeader>
        <ErrorMessage
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {error}
        </ErrorMessage>
      </DetailContainer>
    );
  }
  
  return (
    <DetailContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DetailHeader>
        <BackButton 
          onClick={onBack}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Go back"
        >
          ←
        </BackButton>
        <HeaderTitle>{subTopic.title}</HeaderTitle>
      </DetailHeader>
      
      <DetailContent>
        <SummarySection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SectionTitle>Summary</SectionTitle>
          <p>{summary}</p>
        </SummarySection>
        
        {imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <SectionTitle>Related Visualization</SectionTitle>
            <RelatedImage 
              src={imageUrl} 
              alt={`Visualization of ${subTopic.title}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            />
          </motion.div>
        )}
        
        <SummarySection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SectionTitle>Original Content</SectionTitle>
          <p>{subTopic.summary}</p>
        </SummarySection>
      </DetailContent>
    </DetailContainer>
  );
};

export default SubTopicDetail;
