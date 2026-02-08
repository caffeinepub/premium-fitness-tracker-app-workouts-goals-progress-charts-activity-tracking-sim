import { Link, useRouterState } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import LoginButton from '../auth/LoginButton';
import { Activity, Dumbbell, Target, TrendingUp, Utensils, Settings, User } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: TrendingUp },
  { path: '/workouts', label: 'Workouts', icon: Dumbbell },
  { path: '/nutrition', label: 'Nutrition', icon: Utensils },
  { path: '/activity', label: 'Activity', icon: Activity },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function PrimaryNav() {
  const router = useRouterState();
  const { data: userProfile } = useGetCallerUserProfile();
  const currentPath = router.location.pathname;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-chart-1 to-chart-2 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">FitTrack Pro</h1>
              <p className="text-xs text-muted-foreground">{userProfile?.displayName || 'User'}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-chart-1/20 to-chart-2/20 text-chart-1 font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <LoginButton />
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-chart-1'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
