import { useState } from 'react';
import type { Claim } from './types/claims';
import type { UserRole } from './types/portal';
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
import { ReminderEngineScreen } from './components/screens/ReminderEngineScreen';
import { MLPredictiveScreen } from './components/screens/MLPredictiveScreen';
import { AICopilotScreen } from './components/screens/AICopilotScreen';

const SURVEYOR_SCREENS: ScreenId[] = ['claims', 'claim-details', 'knowledge-repo'];

function isScreenAllowed(role: UserRole, screen: ScreenId) {
  if (screen === 'login') return true;
  if (role === 'surveyor') return SURVEYOR_SCREENS.includes(screen);
  return true;
}

export function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('login');
  const [role, setRole] = useState<UserRole>('claims-manager');
  const [claims, setClaims] = useState<Claim[]>(MOCK_CLAIMS);
  const [selectedClaimId, setSelectedClaimId] = useState<string>('ALL-812189');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  const selectedClaim = claims.find(c => c.id === selectedClaimId) || claims[0];

  const goToScreen = (screen: ScreenId) => {
    if (screen === 'login' || isScreenAllowed(role, screen)) {
      setActiveScreen(screen);
      return;
    }
    setActiveScreen('claims');
  };

  const handleSelectClaim = (id: string) => {
    setSelectedClaimId(id);
    goToScreen('claim-details');
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
    return (
      <LoginScreen
        onLogin={(nextRole) => {
          setRole(nextRole);
          setActiveScreen(nextRole === 'surveyor' ? 'claims' : 'dashboard');
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeScreen={activeScreen} setActiveScreen={goToScreen} role={role} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header 
          setActiveScreen={goToScreen}
          onSearchQuery={(query) => setGlobalSearchQuery(query)}
          role={role}
        />

        <main className="flex-1 pb-12">
          {activeScreen === 'dashboard' && (
            <DashboardScreen 
              claims={claims} 
              onSelectClaim={handleSelectClaim} 
              setActiveScreen={goToScreen} 
            />
          )}

          {activeScreen === 'claims' && (
            <ClaimsListScreen 
              claims={claims} 
              onSelectClaim={handleSelectClaim} 
              setActiveScreen={goToScreen}
              initialSearchQuery={globalSearchQuery}
              role={role}
            />
          )}

          {activeScreen === 'incident-reporting' && (
            <IncidentReportingScreen 
              onClaimCreated={handleClaimCreated}
              setActiveScreen={goToScreen}
            />
          )}

          {activeScreen === 'claim-details' && (
            <ClaimDetailsScreen 
              claim={selectedClaim} 
              onBack={() => goToScreen('claims')} 
              setActiveScreen={goToScreen}
              role={role}
            />
          )}

          {activeScreen === 'ai-advisor' && (
            <AIClaimAdvisorScreen 
              claim={selectedClaim} 
              setActiveScreen={goToScreen}
            />
          )}

          {activeScreen === 'knowledge-repo' && (
            <KnowledgeRepositoryScreen 
              setActiveScreen={goToScreen}
              role={role}
            />
          )}

          {activeScreen === 'reminder-engine' && (
            <ReminderEngineScreen 
              setActiveScreen={goToScreen}
            />
          )}

          {activeScreen === 'ml-predictive' && (
            <MLPredictiveScreen 
              setActiveScreen={goToScreen}
            />
          )}

          {activeScreen === 'copilot' && (
            <AICopilotScreen 
              claims={claims}
              onSelectClaim={handleSelectClaim}
              setActiveScreen={goToScreen}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
