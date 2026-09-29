
import React, { useState, useEffect } from 'react';
import { User, AppStage } from './types';
import Login from './components/Login';
import DashboardLayout from './components/Layout';
import Dashboard from './components/Dashboard';
import FmsTable from './components/FmsTable';
import NewBookingForm from './components/NewBookingForm';

// Updated TabType to remove step6 which is not a valid AppStage (stages are 1-5)
type TabType = 'dashboard' | 'new-booking' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'reports';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  useEffect(() => {
    const savedUser = localStorage.getItem('fms_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('fms_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fms_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'new-booking':
        return <NewBookingForm user={user} onComplete={() => setActiveTab('step1')} />;
      case 'step1':
        return <FmsTable user={user} targetStage={1} />;
      case 'step2':
        return <FmsTable user={user} targetStage={2} />;
      case 'step3':
        return <FmsTable user={user} targetStage={3} />;
      case 'step4':
        return <FmsTable user={user} targetStage={4} />;
      case 'step5':
        return <FmsTable user={user} targetStage={5} />;
      // Removed step6 to fix "Type '6' is not assignable to type 'AppStage'" error
      case 'reports':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Analytics & Reports</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-slate-500">Advanced visual analytics for flight delays and payment tracking.</p>
            </div>
          </div>
        );
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <DashboardLayout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default App;
