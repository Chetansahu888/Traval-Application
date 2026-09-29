import React, { useState } from 'react';
import { User, STAGE_NAMES } from '../types';
import { 
  LayoutDashboard, 
  PlusCircle,
  FileText, 
  CreditCard, 
  CheckCircle,
  BarChart3, 
  LogOut, 
  User as UserIcon,
  ChevronLeft,
  Settings,
  ShieldCheck,
  Zap,
  Ticket,
  Bell
} from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const DashboardLayout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'new-booking', label: 'Create Booking', icon: <PlusCircle size={18} /> },
    { type: 'divider', label: 'All Step' },
    { id: 'step1', label: STAGE_NAMES[1], icon: <FileText size={18} /> },
    { id: 'step2', label: STAGE_NAMES[2], icon: <Ticket size={18} /> },
    { id: 'step3', label: STAGE_NAMES[3], icon: <Zap size={18} /> },
    { id: 'step4', label: STAGE_NAMES[4], icon: <CreditCard size={18} /> },
    { id: 'step5', label: STAGE_NAMES[5], icon: <CheckCircle size={18} /> },
    { type: 'divider', label: 'Reports' },
    { id: 'reports', label: 'Master Records', icon: <BarChart3 size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F0F4F1] antialiased font-sans">
      {/* Sidebar */}
      <aside 
        className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-20 shadow-sm shrink-0`}
      >
        {/* Logo */}
        <div className={`h-16 border-b border-slate-100 flex items-center ${isCollapsed ? 'justify-center px-4' : 'px-5'} gap-3`}>
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center font-black text-white text-base shadow-sm shadow-emerald-200 shrink-0">F</div>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-black text-slate-800 leading-none tracking-tight">Travel App</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5"></p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {menuItems.map((item, idx) => {
            if (item.type === 'divider') {
              return !isCollapsed ? (
                <div key={`div-${idx}`} className="pt-5 pb-2 px-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                </div>
              ) : (
                <div key={`div-${idx}`} className="my-3 border-t border-slate-100"></div>
              );
            }

            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : ''}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold group ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span className={`shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile + Actions */}
        <div className="border-t border-slate-100 p-3 space-y-1">
          <div className={`flex items-center gap-3 px-2 py-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <UserIcon size={16} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate leading-none">{user.username}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{user.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            title={isCollapsed ? 'Logout' : ''}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm font-semibold ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={16} className="shrink-0" />
            {!isCollapsed && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={18} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
            <div>
              <h1 className="text-base font-black text-slate-800 tracking-tight">
                {menuItems.find(m => m.id === activeTab)?.label || 'Intelligence Center'}
              </h1>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest"></p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Firm Badge */}
            <div className="hidden md:block">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                {user.firmName === 'All' ? 'Master Admin' : user.firmName}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all">
              <Bell size={18} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all">
              <ShieldCheck size={18} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;