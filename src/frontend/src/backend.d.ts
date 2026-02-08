import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Exercise {
    name: string;
    sets: Array<Set_>;
}
export interface T__1 {
    id: string;
    fat: number;
    fiber: number;
    sodium: number;
    carbs: number;
    calories: number;
    sugar: number;
    photo: ExternalBlob;
    protein: number;
}
export interface Set_ {
    rpe?: number;
    weight: number;
    reps: bigint;
}
export interface Activity {
    id: string;
    startTime: bigint;
    activityType: ActivityType;
    endTime: bigint;
    calories: number;
    isActive: boolean;
    steps: bigint;
    distanceKm: number;
    durationMinutes: number;
}
export interface T {
    id: string;
    endDate: bigint;
    goalType: GoalType;
    description: string;
    progress: bigint;
    target: bigint;
    startDate: bigint;
}
export interface Workout {
    id: string;
    duration: bigint;
    date: bigint;
    name: string;
    exercises: Array<Exercise>;
    notes: string;
}
export interface UserProfile {
    displayName: string;
    units: Variant_metric_imperial;
}
export enum ActivityType {
    run = "run",
    walk = "walk",
    cycle = "cycle"
}
export enum GoalType {
    duration = "duration",
    calories = "calories",
    distance = "distance",
    workoutsPerWeek = "workoutsPerWeek",
    steps = "steps"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_metric_imperial {
    metric = "metric",
    imperial = "imperial"
}
export interface backendInterface {
    addSteps(steps: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAllUserData(): Promise<void>;
    deleteGoal(id: string): Promise<void>;
    deleteMeal(id: string): Promise<void>;
    deleteWorkout(id: string): Promise<void>;
    endActivity(id: string, steps: bigint, calories: number, distanceKm: number, durationMinutes: number): Promise<Activity>;
    exportUserData(): Promise<{
        meals: Array<T__1>;
        workouts: Array<Workout>;
        activities: Array<Activity>;
        goals: Array<T>;
        stepCount: bigint;
    }>;
    getAllActivities(): Promise<Array<Activity>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGoals(): Promise<Array<T>>;
    getMeals(): Promise<Array<T__1>>;
    getProfile(): Promise<UserProfile>;
    getTotalSteps(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkouts(): Promise<Array<Workout>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveGoal(goal: T): Promise<void>;
    saveMeal(id: string, photo: ExternalBlob, nutrition: [number, number, number, number, number, number, number]): Promise<void>;
    saveWorkout(workout: Workout): Promise<void>;
    startActivity(id: string, activityType: ActivityType): Promise<void>;
    updateProfile(profile: UserProfile): Promise<void>;
}
