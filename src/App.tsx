import { useState } from 'react';
import type { Claim } from './types/claims';
import { MOCK_CLAIMS } from './data/mockClaims';
import { Sidebar } from './components/layout/Sidebar';
import type { ScreenId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginScreen } from './components/screens/LoginScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ClaimsListScreen } from './components/screens/ClaimsListScreen';
import { IncidentReportingScreen } from './components/screens/IncidentReportingScreen';
import { ClaimDetailsScreen } from './components/screens/ClaimDetailsScreen';
import { AIClaimAdvisorScreen } from './components/screens/AIClaimAdvisorScreen';
import { KnowledgeRepositoryScreen } from './components/screens/KnowledgeRepositoryScreen';
import { SurveyorPortalScreen } from './components/screens/SurveyorPortalScreen';
import { DocumentChecklistScreen } from './components/screens/DocumentChecklistScreen';
import { ReminderEngineScreen } from './components/screens/ReminderEngineScreen';
import { MLPredictiveScreen } from './components/screens/MLPredictiveScreen';
import { AICopilotScreen } from './components/screens/AICopilotScreen';

export function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('login');
  const [claims, setClaims] = useState<Claim[]>(MOCK_CLAIMS);
  const [selectedClaimId, setSelectedClaimId] = useState<string>('ALL-812189');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  const selectedClaim = claims.find(c => c.id === selectedClaimId) || claims[0];

  const handleSelectClaim = (id: string) => {
    setSelectedClaimId(id);
    setActiveScreen('claim-details');
  };

  const handleClaimCreated = (newClaim: Claim) => {
    setClaims(prev => {
      const exists = prev.some(c => c.id === newClaim.id);
      if (exists) {
        return prev.map(c => c.id === newClaim.id ? newClaim : c);
      }
      return [newClaim, ...prev];
    });
    setSelectedClaimId(newClaim.id);
  };

  if (activeScreen === 'login') {
    return <LoginScreen onLogin={() => setActiveScreen('dashboard')} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header 
          setActiveScreen={setActiveScreen} 
          onSearchQuery={(query) => setGlobalSearchQuery(query)}
        />

        <main className="flex-1 pb-12">
          {activeScreen === 'dashboard' && (
            <DashboardScreen 
              claims={claims} 
              onSelectClaim={handleSelectClaim} 
              setActiveScreen={setActiveScreen} 
            />
          )}

          {activeScreen === 'claims' && (
            <ClaimsListScreen 
              claims={claims} 
              onSelectClaim={handleSelectClaim} 
              setActiveScreen={setActiveScreen}
              initialSearchQuery={globalSearchQuery}
            />
          )}

          {activeScreen === 'incident-reporting' && (
            <IncidentReportingScreen 
              onClaimCreated={handleClaimCreated}
              setActiveScreen={setActiveScreen}
            />
          )}

          {activeScreen === 'claim-details' && (
            <ClaimDetailsScreen 
              claim={selectedClaim} 
              onBack={() => setActiveScreen('claims')} 
              setActiveScreen={setActiveScreen}
            />
          )}

          {activeScreen === 'ai-advisor' && (
            <AIClaimAdvisorScreen 
              claim={selectedClaim} 
              setActiveScreen={setActiveScreen}
            />
          )}

          {activeScreen === 'knowledge-repo' && (
            <KnowledgeRepositoryScreen 
              setActiveScreen={setActiveScreen}
            />
          )}

          {activeScreen === 'surveyor-portal' && (
            <SurveyorPortalScreen 
              setActiveScreen={setActiveScreen}
            />
          )}

          {activeScreen === 'document-checklist' && (
            <DocumentChecklistScreen 
              setActiveScreen={setActiveScreen}
            />
          )}

          {activeScreen === 'reminder-engine' && (
            <ReminderEngineScreen 
              setActiveScreen={setActiveScreen}
            />
          )}

          {activeScreen === 'ml-predictive' && (
            <MLPredictiveScreen 
              setActiveScreen={setActiveScreen}
            />
          )}

          {activeScreen === 'copilot' && (
            <AICopilotScreen 
              claims={claims}
              onSelectClaim={handleSelectClaim}
              setActiveScreen={setActiveScreen}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
