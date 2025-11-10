import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { userGuideSections, getGuideSection } from './userGuideData';
import './UserGuide.css';

const UserGuide = ({ onComplete, initialSection = 'welcome' }) => {
  const [currentSection, setCurrentSection] = useState(initialSection);
  const [isOpen, setIsOpen] = useState(true);
  
  const section = getGuideSection(currentSection);
  const currentIndex = userGuideSections.findIndex(s => s.id === currentSection);
  const totalSections = userGuideSections.length;
  
  const handleNext = useCallback(() => {
    if (currentIndex < totalSections - 1) {
      setCurrentSection(userGuideSections[currentIndex + 1].id);
    } else {
      handleComplete();
    }
  }, [currentIndex, totalSections]);
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentSection(userGuideSections[currentIndex - 1].id);
    }
  };
  
  const handleComplete = () => {
    setIsOpen(false);
    if (onComplete) onComplete();
    // Store in localStorage that user has completed the guide
    localStorage.setItem('userGuideCompleted', 'true');
  };
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleComplete();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      handlePrevious();
    }
  }, [handleNext, currentIndex]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  if (!isOpen || !section) return null;
  
  return (
    <div className="user-guide-overlay">
      <div className={`user-guide-popup ${section.position || 'center'}`}>
        <div className="user-guide-header">
          <h3>{section.title}</h3>
          <button onClick={handleComplete} className="close-button">
            <X size={20} />
          </button>
        </div>
        
        <div className="user-guide-content">
          <ReactMarkdown>{section.content}</ReactMarkdown>
        </div>
        
        <div className="user-guide-footer">
          <div className="progress-indicator">
            {currentIndex + 1} / {totalSections}
          </div>
          
          <div className="navigation-buttons">
            {currentIndex > 0 && (
              <button onClick={handlePrevious} className="nav-button">
                <ChevronLeft size={20} /> Anterior
              </button>
            )}
            
            <button 
              onClick={section.isLast ? handleComplete : handleNext}
              className={`next-button ${section.isLast ? 'complete' : ''}`}
            >
              {section.isLast ? (
                <>
                  <Check size={18} /> Completar
                </>
              ) : (
                <>
                  Siguiente <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook to use the guide
const useUserGuide = (sectionId) => {
  const [showGuide, setShowGuide] = useState(false);
  
  useEffect(() => {
    // Check if guide was already completed
    const guideCompleted = localStorage.getItem('userGuideCompleted');
    if (!guideCompleted) {
      setShowGuide(true);
    }
  }, []);
  
  const showSection = (section = 'welcome') => {
    setShowGuide(true);
    setCurrentSection(section);
  };
  
  return {
    showGuide,
    showSection,
    hideGuide: () => setShowGuide(false)
  };
};

export { UserGuide, useUserGuide };
export default UserGuide;
