import React, { useState } from 'react';
import './App.css';
import TopicSwipeView from './components/TopicSwipeView';
import LocationPermission from './components/LocationPermission';
import SubTopicPager from './components/SubTopicPager';
import useLocation from './hooks/useLocation';
import { Topic } from './types';

function App() {
  const { location, loading, error, requestLocation } = useLocation();
  const [showDetailMode, setShowDetailMode] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  
  const handleDigDeeper = (topic: Topic) => {
    setSelectedTopic(topic);
    setShowDetailMode(true);
  };
  
  const handleDetailClose = () => {
    setShowDetailMode(false);
    setSelectedTopic(null);
  };
  
  // Show location permission screen if we don't have location
  if (!location && !loading) {
    return (
      <div className="App">
        <LocationPermission 
          onPermissionGranted={requestLocation}
          error={error}
        />
      </div>
    );
  }
  
  // Show detail mode if requested
  if (showDetailMode && selectedTopic) {
    return (
      <div className="App">
        <SubTopicPager 
          topic={selectedTopic}
          onClose={handleDetailClose}
        />
      </div>
    );
  }
  
  // Show main swipe view
  return (
    <div className="App">
      <header className="App-header">
        <h1>Upto Date</h1>
        <p>Stay informed about what's happening around you</p>
      </header>
      <main>
        <TopicSwipeView />
      </main>
    </div>
  );
}

export default App;
