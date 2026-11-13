import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import type { PageId } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { CowProfilePage } from './pages/CowProfilePage';
import { EnvironmentPage } from './pages/EnvironmentPage';
import { RawDataPage } from './pages/RawDataPage';
import { SettingsPage } from './pages/SettingsPage';

import { api } from './services/api';
import type { LatestSensorResponse } from './services/api';

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [selectedCowId, setSelectedCowId] = useState('COW_001');
  const [statusData, setStatusData] = useState<LatestSensorResponse | null>(null);
  const [isSimulatedMode, setIsSimulatedMode] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Poll latest status every 3 seconds
  const fetchStatus = () => {
    api.getLatestSensorData(selectedCowId)
      .then((data) => {
        setStatusData(data);
        setLastSyncTime(new Date());
      })
      .catch((err) => {
        console.error('Status fetch error:', err);
      });
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [selectedCowId]);

  const handleToggleSimulatedMode = (enable: boolean) => {
    setIsSimulatedMode(enable);
    api.toggleSimulationMode(enable).catch((err) => console.error(err));
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        isSimulatedMode={isSimulatedMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <Header
          statusData={statusData}
          selectedCowId={selectedCowId}
          onCowIdChange={setSelectedCowId}
          isSimulatedMode={isSimulatedMode}
          lastSyncTime={lastSyncTime}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-6 md:p-8">
          {currentPage === 'dashboard' && (
            <DashboardPage
              selectedCowId={selectedCowId}
              statusData={statusData}
              onRefresh={fetchStatus}
              isDemoMode={isSimulatedMode}
              onToggleDemoMode={handleToggleSimulatedMode}
            />
          )}

          {currentPage === 'cow-profile' && (
            <div className="max-w-6xl mx-auto">
              <CowProfilePage selectedCowId={selectedCowId} />
            </div>
          )}

          {currentPage === 'charts' && (
            <div className="max-w-6xl mx-auto">
              <EnvironmentPage statusData={statusData} selectedCowId={selectedCowId} />
            </div>
          )}

          {currentPage === 'activity-log' && (
            <div className="max-w-6xl mx-auto">
              <RawDataPage selectedCowId={selectedCowId} />
            </div>
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              isSimulatedMode={isSimulatedMode}
              onToggleSimulatedMode={handleToggleSimulatedMode}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
