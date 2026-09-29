import React, { useEffect, useState } from 'react';
import { User, FMSRow } from '../types';
import { googleSheetService } from '../services/googleSheetService';
import { 
  ClipboardCheck, 
  PlaneTakeoff, 
  Receipt, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp
} from 'lucide-react';

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [data, setData] = useState<FMSRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await googleSheetService.fetchData();
      setData(result);
      setLoading(false);
    };
    load();
  }, []);

  const stats = [
    { 
      label: 'Active Bookings', 
      value: data.length, 
      icon: <PlaneTakeoff size={22} className="text-emerald-600" />, 
      trend: '+12%', 
      up: true,
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    },
    { 
      label: 'Pending Approvals', 
      value: data.filter(r => r.planned1 && !r.actual1).length, 
      icon: <ClipboardCheck size={22} className="text-amber-600" />, 
      trend: '-3%', 
      up: false,
      bg: 'bg-amber-50',
      border: 'border-amber-100'
    },
    { 
      label: 'Completed Bills', 
      value: data.filter(r => r.actual4).length, 
      icon: <Receipt size={22} className="text-green-600" />, 
      trend: '+18%', 
      up: true,
      bg: 'bg-green-50',
      border: 'border-green-100'
    },
    { 
      label: 'Average Delay', 
      value: '4.2 hrs', 
      icon: <Clock size={22} className="text-red-500" />, 
      trend: '+0.5%', 
      up: false,
      bg: 'bg-red-50',
      border: 'border-red-100'
    },
  ];

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Loading Data...</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-[#F5F7F5] min-h-full">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 rounded-2xl p-8 text-white shadow-lg shadow-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-semibold uppercase tracking-widest mb-1">Welcome Back</p>
            <h2 className="text-3xl font-black tracking-tight">{user.username}</h2>
            <p className="text-emerald-100 mt-2 text-sm">Here is your operational overview for today.</p>
          </div>
          <div className="opacity-20">
            <TrendingUp size={80} />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl border ${stat.border} shadow-sm hover:shadow-md transition-all duration-300`}>
            <div className="flex justify-between items-start mb-5">
              <div className={`p-3 ${stat.bg} rounded-xl`}>{stat.icon}</div>
              <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${stat.up ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                {stat.trend}
                {stat.up ? <ArrowUpRight size={13} className="ml-0.5" /> : <ArrowDownRight size={13} className="ml-0.5" />}
              </div>
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-emerald-500 rounded-full"></div>
            Recent Activity
          </h3>
          <div className="space-y-1">
            {data.slice(0, 5).length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-10">No recent activity to display.</p>
            ) : (
              data.slice(0, 5).map((row, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-xs shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">Booking #{row.bookingNo} updated</p>
                    <p className="text-xs text-slate-400 mt-0.5">{row.headTraveler} — Stage {row.actual1 ? (row.actual2 ? (row.actual3 ? (row.actual4 ? 5 : 4) : 3) : 2) : 1}</p>
                  </div>
                  <span className="text-xs text-slate-300 font-medium shrink-0">{row.timestamp?.split('T')[0]}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stage Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-green-500 rounded-full"></div>
            Stage Distribution
          </h3>
          <div className="space-y-5">
            {[1, 2, 3, 4, 5].map(stage => {
              const count = data.filter(r => {
                const planned = (r as any)[`planned${stage}`];
                const actual = (r as any)[`actual${stage}`];
                return planned && !actual;
              }).length;
              const percentage = (count / (data.length || 1)) * 100;
              const colors = ['bg-emerald-500', 'bg-green-500', 'bg-teal-500', 'bg-cyan-500', 'bg-slate-400'];
              return (
                <div key={stage}>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-600">Stage {stage}</span>
                    <span className="text-slate-400">{count} items</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colors[stage - 1]} rounded-full transition-all duration-1000`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;