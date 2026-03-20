import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Download, TrendingUp, Users, MapPin, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, BarChart3 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function Insights() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useTranslation();

  const departments = [
    { name: t('water_dept'), resolved: 234, onTime: 82, avgDays: 1.8, rank: 1, trend: 'up' },
    { name: t('electrical_dept'), resolved: 189, onTime: 71, avgDays: 2.1, rank: 2, trend: 'up' },
    { name: t('roads_dept'), resolved: 156, onTime: 51, avgDays: 4.2, rank: 3, trend: 'down' },
    { name: t('sanitation_dept'), resolved: 89, onTime: 34, avgDays: 7.8, rank: 4, trend: 'down' },
  ];

  const issueData = [
    { name: t('garbage'), value: 420 },
    { name: t('potholes'), value: 300 },
    { name: t('street_lights'), value: 200 },
    { name: t('water_leakage'), value: 150 },
    { name: t('others'), value: 100 },
  ];

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#06b6d4', '#ef4444'];

  const trendData = [
    { day: '01 Mar', count: 45, resolved: 30 },
    { day: '05 Mar', count: 52, resolved: 45 },
    { day: '10 Mar', count: 65, resolved: 58 },
    { day: '15 Mar', count: 48, resolved: 50 },
    { day: '20 Mar', count: 70, resolved: 62 },
    { day: '25 Mar', count: 55, resolved: 55 },
    { day: '30 Mar', count: 60, resolved: 58 },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('performance_analytics')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('real_time_insights')}</p>
        </div>
        <button className="flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-xl hover:bg-slate-800 dark:hover:bg-blue-700 transition-all hover:scale-105 active:scale-95">
          <Download size={18} />
          {t('export_report')}
        </button>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="rounded-[2rem] bg-emerald-600 p-8 text-white shadow-xl shadow-emerald-200 dark:shadow-none"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 mb-6">
            <TrendingUp size={24} />
          </div>
          <div className="text-sm font-bold uppercase tracking-wider opacity-80">{t('cost_saved_month')}</div>
          <div className="mt-2 text-4xl font-black">₹1.24 Cr</div>
          <div className="mt-4 text-xs font-medium opacity-70">{t('based_on')} 8,427 {t('auto_detections')}</div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="rounded-[2rem] bg-blue-600 p-8 text-white shadow-xl shadow-blue-200 dark:shadow-none"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 mb-6">
            <Users size={24} />
          </div>
          <div className="text-sm font-bold uppercase tracking-wider opacity-80">{t('citizen_satisfaction')}</div>
          <div className="mt-2 text-4xl font-black">4.8/5.0</div>
          <div className="mt-4 text-xs font-medium opacity-70">{t('from')} 12,500+ {t('verified_resolutions')}</div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="rounded-[2rem] bg-slate-900 dark:bg-slate-900 p-8 text-white shadow-xl border border-slate-800"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 mb-6">
            <MapPin size={24} />
          </div>
          <div className="text-sm font-bold uppercase tracking-wider opacity-80">{t('ward_coverage')}</div>
          <div className="mt-2 text-4xl font-black">100%</div>
          <div className="mt-4 text-xs font-medium opacity-70">{t('all')} 272 {t('wards_monitored')}</div>
        </motion.div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-[2.5rem] bg-white dark:bg-slate-900 p-10 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('issue_volume_trends')}</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs font-bold text-blue-600"><div className="h-2 w-2 rounded-full bg-blue-600" /> {t('reported')}</span>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><div className="h-2 w-2 rounded-full bg-emerald-600" /> {t('resolved')}</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    color: isDark ? '#ffffff' : '#000000',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" name={t('reported')} stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                <Area type="monotone" dataKey="resolved" name={t('resolved')} stroke="#10b981" strokeWidth={4} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 p-10 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">{t('issue_categories')}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {issueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    color: isDark ? '#ffffff' : '#000000'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
            {issueData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-slate-600 dark:text-slate-400 font-bold">{item.name}</span>
                </div>
                <span className="font-black text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Performance Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('department_leaderboard')}</h3>
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-900/30 px-5 py-2.5 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800">
            <AlertTriangle size={18} />
            <span className="text-sm font-bold">2 {t('failing_sla')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {departments.map((dept, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-lg"
            >
              <div className="flex flex-wrap items-center justify-between gap-8">
                <div className="flex items-center gap-8 min-w-[280px]">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl font-black text-2xl ${
                    dept.rank === 1 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                    dept.rank === 2 ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' :
                    dept.rank === 3 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                    'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                  }`}>
                    {dept.rank}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{dept.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                        dept.onTime > 70 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                        dept.onTime > 50 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                        'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                      }`}>
                        {dept.onTime}% SLA
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">{dept.resolved} {t('resolved')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-[300px]">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-[0.2em]">
                    <span>{t('sla_compliance')}</span>
                    <span>{dept.onTime}%</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.onTime}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full rounded-full ${
                        dept.onTime > 70 ? 'bg-emerald-500' :
                        dept.onTime > 50 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-10 min-w-[180px] justify-end">
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('avg_time')}</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{dept.avgDays}d</div>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    dept.trend === 'up' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                  }`}>
                    {dept.trend === 'up' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                  </div>
                </div>
              </div>
              
              {dept.rank === 4 && (
                <div className="mt-8 p-5 rounded-2xl bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-rose-600 dark:text-rose-400">
                    <AlertTriangle size={24} />
                    <span className="text-sm font-black uppercase tracking-wide">{t('auto_escalated')}</span>
                  </div>
                  <button className="text-xs font-black text-rose-600 dark:text-rose-400 underline uppercase tracking-widest">{t('view_audit_log')}</button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
