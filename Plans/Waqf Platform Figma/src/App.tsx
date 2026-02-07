import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { ExplorePage } from './components/ExplorePage';
import { ProjectDetailPage } from './components/ProjectDetailPage';
import { ProfilePage } from './components/ProfilePage';

type Page = 'landing' | 'explore' | 'project' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleNavigate = (page: string, projectId?: string) => {
    setCurrentPage(page as Page);
    if (projectId) {
      setSelectedProjectId(projectId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      // You can extend this to handle proper routing
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="min-h-screen">
      <Header 
        variant={currentPage === 'landing' ? 'landing' : 'app'} 
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />
      
      {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
      {currentPage === 'explore' && <ExplorePage onNavigate={handleNavigate} />}
      {currentPage === 'project' && selectedProjectId && (
        <ProjectDetailPage projectId={selectedProjectId} onNavigate={handleNavigate} />
      )}
      {currentPage === 'profile' && <ProfilePage onNavigate={handleNavigate} />}
    </div>
  );
}

export default App;