import { useMemo } from 'react';
import { useWorkouts } from '../hooks/useQueries';
import { useMeals } from '../hooks/useQueries';
import { useActivities } from '../hooks/useQueries';
import { useGoals } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Utensils, Activity, Target, TrendingUp, Flame } from 'lucide-react';
import { formatDistance, formatWeight } from '../lib/units';

export default function DashboardPage() {
  const { data: workouts = [] } = useWorkouts();
  const { data: meals = [] } = useMeals();
  const { data: activities = [] } = useActivities();
  const { data: goals = [] } = useGoals();
  const { data: userProfile } = useGetCallerUserProfile();

  const stats = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const weekWorkouts = workouts.filter((w) => Number(w.date) / 1_000_000 > weekAgo);
    const weekActivities = activities.filter((a) => Number(a.startTime) / 1_000_000 > weekAgo);
    const weekMeals = meals.length;

    const totalSteps = activities.reduce((sum, a) => sum + Number(a.steps), 0);
    const totalDistance = activities.reduce((sum, a) => sum + a.distanceKm, 0);
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const activeGoals = goals.filter((g) => Number(g.endDate) > now * 1_000_000);

    return {
      weekWorkouts: weekWorkouts.length,
      weekActivities: weekActivities.length,
      weekMeals,
      totalSteps,
      totalDistance,
      totalCalories,
      activeGoals: activeGoals.length,
    };
  }, [workouts, meals, activities, goals]);

  const units = userProfile?.units || { metric: null };
  const isMetric = units && typeof units === 'object' && 'metric' in units;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Your fitness overview at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-chart-1 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
            <Dumbbell className="w-4 h-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.weekWorkouts}</div>
            <p className="text-xs text-muted-foreground mt-1">Workouts completed</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-2 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Steps</CardTitle>
            <Activity className="w-4 h-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSteps.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistance(stats.totalDistance, isMetric)} covered
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-3 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nutrition</CardTitle>
            <Flame className="w-4 h-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(stats.totalCalories)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total calories tracked</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-4 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Goals</CardTitle>
            <Target className="w-4 h-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeGoals}</div>
            <p className="text-xs text-muted-foreground mt-1">Goals in progress</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-chart-1" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No activities yet. Start tracking!</p>
            ) : (
              <div className="space-y-3">
                {activities.slice(-5).reverse().map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                    <div>
                      <p className="font-medium capitalize">{activity.activityType}</p>
                      <p className="text-sm text-muted-foreground">
                        {Number(activity.steps).toLocaleString()} steps · {formatDistance(activity.distanceKm, isMetric)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{Math.round(activity.calories)} cal</p>
                      <p className="text-xs text-muted-foreground">{Math.round(activity.durationMinutes)} min</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-chart-2" />
              Recent Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workouts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No workouts yet. Log your first one!</p>
            ) : (
              <div className="space-y-3">
                {workouts.slice(-5).reverse().map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                    <div>
                      <p className="font-medium">{workout.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {workout.exercises.length} exercises
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{Number(workout.duration)} min</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(Number(workout.date) / 1_000_000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
