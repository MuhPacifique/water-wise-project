import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MaintenanceMode from './MaintenanceMode';
import { Outlet } from 'react-router-dom';

interface MaintenanceGuardProps {
  children?: React.ReactNode;
}

const MaintenanceGuard: React.FC<MaintenanceGuardProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [maintenanceProgress, setMaintenanceProgress] = useState<number>(0);
  const [maintenanceCompletionDate, setMaintenanceCompletionDate] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMaintenanceSettings = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch('/api/settings/maintenance');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      
      if (data.maintenanceMode !== undefined) {
        setMaintenanceMode(data.maintenanceMode);
        setMaintenanceProgress(data.maintenanceProgress || 0);
        setMaintenanceCompletionDate(data.maintenanceCompletionDate || '');
      }
    } catch (error) {
      console.error('Error fetching maintenance settings:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceSettings();
  }, []);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-blue-400 font-medium tracking-widest text-xs uppercase animate-pulse">
            Verifying Site Status...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" />
        <div className="relative z-10 text-center">
          <p className="text-red-400 font-bold mb-4">Failed to load site status</p>
          <button 
            onClick={() => fetchMaintenanceSettings()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-bold"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Show maintenance mode if enabled
  if (maintenanceMode) {
    return (
      <MaintenanceMode 
        progress={maintenanceProgress} 
        completionDate={maintenanceCompletionDate} 
      />
    );
  }

  return children ? <>{children}</> : <Outlet context={{ maintenanceMode, maintenanceProgress, maintenanceCompletionDate }} />;
};

export default MaintenanceGuard;
