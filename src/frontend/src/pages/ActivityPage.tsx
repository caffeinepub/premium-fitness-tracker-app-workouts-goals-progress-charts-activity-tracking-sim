import { useState, useEffect } from 'react';
import { useActivities, useStartActivity, useEndActivity } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Play, Square, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ActivityType } from '../backend';
import { formatDistance } from '../lib/units';

export default function ActivityPage() {
  const { data: activities = [] } = useActivities();
  const { data: userProfile } = useGetCallerUserProfile();
  const startActivity = useStartActivity();
  const endActivity = useEndActivity();

  const [activityType, setActivityType] = useState<'walk' | 'run' | 'cycle'>('walk');
  const [isTracking, setIsTracking] = useState(false);
  const [currentActivityId, setCurrentActivityId] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const units = userProfile?.units || { metric: null };
  const isMetric = units && typeof units === 'object' && 'metric' in units;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const handleStartActivity = async () => {
    const id = Date.now().toString();
    setCurrentActivityId(id);
    setIsTracking(true);
    setElapsedSeconds(0);

    try {
      await startActivity.mutateAsync({
        id,
        activityType: ActivityType[activityType],
      });
      toast.success('Activity tracking started');
    } catch (error) {
      toast.error('Failed to start activity');
      setIsTracking(false);
    }
  };

  const handleEndActivity = async () => {
    if (!currentActivityId) return;

    const durationMinutes = elapsedSeconds / 60;
    
    // Simulated metrics based on activity type and duration
    const baseSteps = activityType === 'walk' ? 100 : activityType === 'run' ? 150 : 0;
    const steps = Math.round(baseSteps * durationMinutes);
    
    const baseDistance = activityType === 'walk' ? 0.08 : activityType === 'run' ? 0.15 : 0.25;
    const distanceKm = baseDistance * durationMinutes;
    
    const baseCalories = activityType === 'walk' ? 4 : activityType === 'run' ? 10 : 8;
    const calories = baseCalories * durationMinutes;

    try {
      await endActivity.mutateAsync({
        id: currentActivityId,
        steps: BigInt(steps),
        calories,
        distanceKm,
        durationMinutes,
      });
      toast.success('Activity saved successfully!');
      setIsTracking(false);
      setCurrentActivityId('');
      setElapsedSeconds(0);
    } catch (error) {
      toast.error('Failed to save activity');
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Activity Tracking</h1>
        <p className="text-muted-foreground">Track your walks, runs, and rides</p>
      </div>

      <Card className="border-2 border-chart-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-chart-2" />
            Activity Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-chart-3 mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              This is a simulated tracker. Metrics are estimated based on activity type and duration.
            </p>
          </div>

          {!isTracking ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Activity Type</label>
                <Select value={activityType} onValueChange={(v: any) => setActivityType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk">Walk</SelectItem>
                    <SelectItem value="run">Run</SelectItem>
                    <SelectItem value="cycle">Cycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleStartActivity} className="w-full gap-2" size="lg">
                <Play className="w-5 h-5" />
                Start Activity
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="text-6xl font-bold tracking-tight mb-2">{formatTime(elapsedSeconds)}</div>
                <p className="text-muted-foreground capitalize">{activityType} in progress</p>
              </div>
              <Button
                onClick={handleEndActivity}
                variant="destructive"
                className="w-full gap-2"
                size="lg"
                disabled={endActivity.isPending}
              >
                <Square className="w-5 h-5" />
                {endActivity.isPending ? 'Saving...' : 'Stop & Save'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Activity History</h2>
        {activities.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
                <p className="text-muted-foreground">Start tracking your first activity above</p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.filter(a => !a.isActive).slice().reverse().map((activity) => (
              <Card key={activity.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg capitalize">{activity.activityType}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(Number(activity.startTime) / 1_000_000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-semibold">{Math.round(activity.durationMinutes)} min</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Distance</p>
                      <p className="font-semibold">{formatDistance(activity.distanceKm, isMetric)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Steps</p>
                      <p className="font-semibold">{Number(activity.steps).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Calories</p>
                      <p className="font-semibold">{Math.round(activity.calories)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
