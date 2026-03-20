import { motion } from 'framer-motion';
import { Trophy, Star, Shield, Award, Crown, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LeaderBoard() {
  const { t } = useTranslation();

  const badges = [
    { icon: <Star size={16} />, name: t('first_report'), color: 'bg-emerald-100 text-emerald-600' },
    { icon: <Award size={16} />, name: t('contributor'), color: 'bg-blue-100 text-blue-600' },
    { icon: <Shield size={16} />, name: t('ward_guardian'), color: 'bg-amber-100 text-amber-600' },
    { icon: <Crown size={16} />, name: t('civic_hero'), color: 'bg-rose-100 text-rose-600' }
  ];

  const leaders = [
    { name: 'Rahul S.', points: 1240, reports: 45, badge: t('civic_hero'), rank: 1 },
    { name: 'Priya K.', points: 980, reports: 32, badge: t('ward_guardian'), rank: 2 },
    { name: 'Amit V.', points: 850, reports: 28, badge: t('ward_guardian'), rank: 3 },
    { name: 'Sneha M.', points: 620, reports: 15, badge: t('contributor'), rank: 4 },
    { name: 'Vikram R.', points: 540, reports: 12, badge: t('contributor'), rank: 5 },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('leaderboard_title')}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{t('leaderboard_desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="col-span-1 md:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 dark:text-white">
            <Trophy className="text-amber-500" size={20} />
            {t('top_contributors')}
          </h3>
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800">
            {leaders.map((user, i) => (
              <div key={i} className={`flex items-center justify-between p-6 ${i !== leaders.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                    i === 1 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                    i === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                    'bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'
                  }`}>
                    {user.rank}
                  </div>
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                    <User size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider dark:text-blue-400">{user.badge}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-slate-900 dark:text-white">{user.points}</div>
                  <div className="text-xs text-slate-500 font-medium dark:text-slate-400">{t('reports_count', { count: user.reports })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('your_progress')}</h3>
          <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                M
              </div>
              <div>
                <div className="font-bold">Mukesh O.</div>
                <div className="text-xs text-slate-400">{t('rank_in_delhi', { rank: 42 })}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400 uppercase">{t('points')}</span>
                  <span>420 / 500</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[84%]" />
                </div>
              </div>
              <div className="text-xs text-slate-400">
                {t('points_away', { points: 80, badge: t('contributor') })}
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('badges')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge, i) => (
              <div key={i} className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 ${badge.color} dark:bg-slate-900/50`}>
                {badge.icon}
                <span className="mt-2 text-[10px] font-bold uppercase text-center">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
