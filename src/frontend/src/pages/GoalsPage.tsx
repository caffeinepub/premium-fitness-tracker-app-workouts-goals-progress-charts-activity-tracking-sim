import { useState } from 'react';
import { useGoals, useSaveGoal, useDeleteGoal } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { T as Goal } from '../backend';
import { GoalType } from '../backend';

export default function GoalsPage() {
  const { data: goals = [] } = useGoals();
  const saveGoal = useSaveGoal();
  const deleteGoal = useDeleteGoal();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState<keyof typeof GoalType>('workoutsPerWeek');
  const [target, setTarget] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSaveGoal = async () => {
    if (!description.trim() || !target || !endDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      description: description.trim(),
      goalType: GoalType[goalType],
      target: BigInt(target),
      progress: 0n,
      startDate: BigInt(Date.now() * 1_000_000),
      endDate: BigInt(new Date(endDate).getTime() * 1_000_000),
    };

    try {
      await saveGoal.mutateAsync(goal);
      toast.success('Goal created successfully!');
      setDialogOpen(false);
      setDescription('');
      setTarget('');
      setEndDate('');
    } catch (error) {
      toast.error('Failed to create goal');
      console.error(error);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteGoal.mutateAsync(id);
      toast.success('Goal deleted');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const getGoalTypeLabel = (type: any): string => {
    if (type.workoutsPerWeek !== undefined) return 'Workouts per Week';
    if (type.steps !== undefined) return 'Steps';
    if (type.calories !== undefined) return 'Calories';
    if (type.distance !== undefined) return 'Distance';
    if (type.duration !== undefined) return 'Duration';
    return 'Unknown';
  };

  const calculateProgress = (goal: Goal): number => {
    const progress = Number(goal.progress);
    const target = Number(goal.target);
    return target > 0 ? Math.min((progress / target) * 100, 100) : 0;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Goals</h1>
          <p className="text-muted-foreground">Set and track your fitness goals</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="description">Goal Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Workout 4 times per week"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalType">Goal Type</Label>
                <Select value={goalType} onValueChange={(v: any) => setGoalType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workoutsPerWeek">Workouts per Week</SelectItem>
                    <SelectItem value="steps">Daily Steps</SelectItem>
                    <SelectItem value="calories">Calories</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Target Value</Label>
                <Input
                  id="target"
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g., 4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <Button onClick={handleSaveGoal} className="w-full" disabled={saveGoal.isPending}>
                {saveGoal.isPending ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
              <p className="text-muted-foreground">Create your first goal to stay motivated</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = calculateProgress(goal);
            const isActive = Number(goal.endDate) > Date.now() * 1_000_000;

            return (
              <Card key={goal.id} className={`hover:shadow-lg transition-shadow duration-300 ${!isActive ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{goal.description}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getGoalTypeLabel(goal.goalType)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {goal.progress.toString()} / {goal.target.toString()}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% complete</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Deadline</span>
                    <span className={isActive ? 'text-foreground' : 'text-destructive'}>
                      {new Date(Number(goal.endDate) / 1_000_000).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
