import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Workout, T as Goal, T__1 as Meal, Activity, UserProfile } from '../backend';

export function useWorkouts() {
  const { actor, isFetching } = useActor();

  return useQuery<Workout[]>({
    queryKey: ['workouts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorkouts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveWorkout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workout: Workout) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveWorkout(workout);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useDeleteWorkout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteWorkout(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useGoals() {
  const { actor, isFetching } = useActor();

  return useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGoals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: Goal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveGoal(goal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useDeleteGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteGoal(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useMeals() {
  const { actor, isFetching } = useActor();

  return useQuery<Meal[]>({
    queryKey: ['meals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMeals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveMeal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; photo: any; nutrition: [number, number, number, number, number, number, number] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveMeal(params.id, params.photo, params.nutrition);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useDeleteMeal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMeal(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useActivities() {
  const { actor, isFetching } = useActor();

  return useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActivities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStartActivity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; activityType: any }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.startActivity(params.id, params.activityType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useEndActivity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; steps: bigint; calories: number; distanceKm: number; durationMinutes: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.endActivity(params.id, params.steps, params.calories, params.distanceKm, params.durationMinutes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useExportData() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.exportUserData();
    },
  });
}

export function useDeleteAllData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAllUserData();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
