import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const PermissionContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
`;

const PermissionIcon = styled(motion.div)`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const PermissionTitle = styled(motion.h2)`
  margin: 0 0 10px 0;
  color: #333;
`;

const PermissionText = styled(motion.p)`
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.5;
`;

const PermissionButton = styled(motion.button)`
  background: #6e8efb;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 30px;
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

interface LocationPermissionProps {
  onPermissionGranted: () => void;
  error?: string | null;
}

const LocationPermission: React.FC<LocationPermissionProps> = ({ onPermissionGranted, error }) => {
  return (
    <PermissionContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PermissionIcon
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.1 
        }}
      >
        📍
      </PermissionIcon>
      <PermissionTitle
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Enable Location Services
      </PermissionTitle>
      <PermissionText
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        To get personalized news and updates around you, 
        please enable location permissions for this app.
      </PermissionText>
      {error && (
        <PermissionText 
          style={{ color: '#e74c3c' }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {error}
        </PermissionText>
      )}
      <PermissionButton 
        onClick={onPermissionGranted}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Enable Location
      </PermissionButton>
    </PermissionContainer>
  );
};

export default LocationPermission;
