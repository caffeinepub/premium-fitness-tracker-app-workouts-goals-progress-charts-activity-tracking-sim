import { useState } from 'react';
import { useWorkouts, useSaveWorkout, useDeleteWorkout } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';
import type { Workout, Exercise, Set_ } from '../backend';
import { formatWeight } from '../lib/units';

export default function WorkoutsPage() {
  const { data: workouts = [] } = useWorkouts();
  const { data: userProfile } = useGetCallerUserProfile();
  const saveWorkout = useSaveWorkout();
  const deleteWorkout = useDeleteWorkout();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: '', sets: [{ weight: 0, reps: 0n, rpe: undefined }] },
  ]);

  const units = userProfile?.units || { metric: null };
  const isMetric = units && typeof units === 'object' && 'metric' in units;

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ weight: 0, reps: 0n, rpe: undefined }] }]);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.push({ weight: 0, reps: 0n, rpe: undefined });
    setExercises(newExercises);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSaveWorkout = async () => {
    if (!workoutName.trim()) {
      toast.error('Please enter a workout name');
      return;
    }

    const validExercises = exercises.filter((ex) => ex.name.trim() && ex.sets.length > 0);
    if (validExercises.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }

    const workout: Workout = {
      id: Date.now().toString(),
      name: workoutName.trim(),
      exercises: validExercises,
      date: BigInt(Date.now() * 1_000_000),
      duration: BigInt(duration),
      notes: notes.trim(),
    };

    try {
      await saveWorkout.mutateAsync(workout);
      toast.success('Workout saved successfully!');
      setDialogOpen(false);
      setWorkoutName('');
      setDuration('60');
      setNotes('');
      setExercises([{ name: '', sets: [{ weight: 0, reps: 0n, rpe: undefined }] }]);
    } catch (error) {
      toast.error('Failed to save workout');
      console.error(error);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    try {
      await deleteWorkout.mutateAsync(id);
      toast.success('Workout deleted');
    } catch (error) {
      toast.error('Failed to delete workout');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Workouts</h1>
          <p className="text-muted-foreground">Track your training sessions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Log Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log New Workout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workoutName">Workout Name</Label>
                  <Input
                    id="workoutName"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    placeholder="e.g., Upper Body"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Exercises</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddExercise}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Exercise
                  </Button>
                </div>

                {exercises.map((exercise, exIndex) => (
                  <Card key={exIndex}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          value={exercise.name}
                          onChange={(e) => {
                            const newExercises = [...exercises];
                            newExercises[exIndex].name = e.target.value;
                            setExercises(newExercises);
                          }}
                          placeholder="Exercise name"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveExercise(exIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground w-12">Set {setIndex + 1}</span>
                            <Input
                              type="number"
                              value={set.weight || ''}
                              onChange={(e) => {
                                const newExercises = [...exercises];
                                newExercises[exIndex].sets[setIndex].weight = parseFloat(e.target.value) || 0;
                                setExercises(newExercises);
                              }}
                              placeholder={isMetric ? 'kg' : 'lbs'}
                              className="w-20"
                            />
                            <span className="text-muted-foreground">×</span>
                            <Input
                              type="number"
                              value={set.reps ? set.reps.toString() : ''}
                              onChange={(e) => {
                                const newExercises = [...exercises];
                                newExercises[exIndex].sets[setIndex].reps = BigInt(e.target.value || 0);
                                setExercises(newExercises);
                              }}
                              placeholder="reps"
                              className="w-20"
                            />
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddSet(exIndex)}
                          className="w-full"
                        >
                          Add Set
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did it feel?"
                  rows={3}
                />
              </div>

              <Button onClick={handleSaveWorkout} className="w-full" disabled={saveWorkout.isPending}>
                {saveWorkout.isPending ? 'Saving...' : 'Save Workout'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {workouts.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
              <Dumbbell className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No workouts yet</h3>
              <p className="text-muted-foreground">Start logging your training sessions to track progress</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workouts.slice().reverse().map((workout) => (
            <Card key={workout.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{workout.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(Number(workout.date) / 1_000_000).toLocaleDateString()} · {Number(workout.duration)} min
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteWorkout(workout.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workout.exercises.map((exercise, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-accent/20">
                      <p className="font-medium mb-2">{exercise.name}</p>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {exercise.sets.map((set, setIdx) => (
                          <div key={setIdx}>
                            Set {setIdx + 1}: {formatWeight(set.weight, isMetric)} × {set.reps.toString()} reps
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {workout.notes && (
                    <p className="text-sm text-muted-foreground italic mt-3">{workout.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
