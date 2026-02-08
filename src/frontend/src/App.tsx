import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/layout/AppLayout';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import DashboardPage from './pages/DashboardPage';
import WorkoutsPage from './pages/WorkoutsPage';
import NutritionPage from './pages/NutritionPage';
import ActivityPage from './pages/ActivityPage';
import GoalsPage from './pages/GoalsPage';
import SettingsPage from './pages/SettingsPage';
import { Activity, Dumbbell, Target, TrendingUp, Utensils, Settings } from 'lucide-react';

function SignedOutScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-chart-1 to-chart-2 rounded-3xl flex items-center justify-center shadow-lg">
            <Dumbbell className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">FitTrack Pro</h1>
          <p className="text-muted-foreground text-lg">
            Your premium fitness companion. Track workouts, nutrition, and progress with precision.
          </p>
        </div>
        <button
          onClick={login}
          disabled={isLoggingIn}
          className="w-full py-4 px-6 bg-gradient-to-r from-chart-1 to-chart-2 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? 'Connecting...' : 'Sign In to Continue'}
        </button>
      </div>
    </div>
  );
}

function LayoutWrapper() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (!isAuthenticated) {
    return <SignedOutScreen />;
  }

  if (actorFetching || profileLoading || !isFetched) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-chart-1 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your fitness data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProfileSetupDialog open={showProfileSetup} />
      <AppLayout>
        <Outlet />
      </AppLayout>
    </>
  );
}

const rootRoute = createRootRoute({
  component: LayoutWrapper,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const workoutsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workouts',
  component: WorkoutsPage,
});

const nutritionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nutrition',
  component: NutritionPage,
});

const activityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activity',
  component: ActivityPage,
});

const goalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/goals',
  component: GoalsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  workoutsRoute,
  nutritionRoute,
  activityRoute,
  goalsRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
