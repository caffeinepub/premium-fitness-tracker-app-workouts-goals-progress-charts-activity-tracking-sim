import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {
  module User {
    public type T = {
      displayName : Text;
      units : { #metric; #imperial };
      workouts : Map.Map<Text, Workout>;
      goals : Map.Map<Text, Goal.T>;
      meals : Map.Map<Text, Meal.T>;
      activities : Map.Map<Text, Activity>;
      stepCount : Nat;
    };
  };

  let users = Map.empty<Principal, User.T>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type Workout = {
    id : Text;
    name : Text;
    exercises : [Exercise];
    date : Int;
    duration : Nat;
    notes : Text;
  };

  type Exercise = {
    name : Text;
    sets : [Set];
  };

  type Set = {
    weight : Float;
    reps : Nat;
    rpe : ?Float;
  };

  module Goal {
    public type T = {
      id : Text;
      description : Text;
      target : Nat;
      progress : Nat;
      startDate : Int;
      endDate : Int;
      goalType : GoalType;
    };

    public type GoalType = {
      #steps;
      #workoutsPerWeek;
      #calories;
      #distance;
      #duration;
    };
  };

  module Meal {
    public type T = {
      id : Text;
      photo : Storage.ExternalBlob;
      calories : Float;
      carbs : Float;
      protein : Float;
      fat : Float;
      fiber : Float;
      sugar : Float;
      sodium : Float;
    };
  };

  type Activity = {
    id : Text;
    activityType : ActivityType;
    steps : Nat;
    calories : Float;
    distanceKm : Float;
    durationMinutes : Float;
    startTime : Int;
    endTime : Int;
    isActive : Bool;
  };

  type ActivityType = {
    #walk;
    #run;
    #cycle;
  };

  public type UserProfile = {
    displayName : Text;
    units : { #metric; #imperial };
  };

  // Helper to get or create a user (only for authenticated users)
  func getOrCreateUser(caller : Principal) : User.T {
    switch (users.get(caller)) {
      case (null) {
        let newUser : User.T = {
          displayName = "User";
          units = #metric;
          workouts = Map.empty<Text, Workout>();
          goals = Map.empty<Text, Goal.T>();
          meals = Map.empty<Text, Meal.T>();
          activities = Map.empty<Text, Activity>();
          stepCount = 0;
        };
        users.add(caller, newUser);
        newUser;
      };
      case (?user) { user };
    };
  };

  // Profile management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    let context = getOrCreateUser(caller);
    ?{
      displayName = context.displayName;
      units = context.units;
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (users.get(user)) {
      case (null) { null };
      case (?context) {
        ?{
          displayName = context.displayName;
          units = context.units;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let context = getOrCreateUser(caller);
    let updatedUser : User.T = {
      displayName = profile.displayName;
      units = profile.units;
      workouts = context.workouts;
      goals = context.goals;
      meals = context.meals;
      activities = context.activities;
      stepCount = context.stepCount;
    };
    users.add(caller, updatedUser);
  };

  // Workout tracking
  public shared ({ caller }) func saveWorkout(workout : Workout) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save workouts");
    };
    let context = getOrCreateUser(caller);
    context.workouts.add(workout.id, workout);
  };

  public query ({ caller }) func getWorkouts() : async [Workout] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view workouts");
    };
    let context = getOrCreateUser(caller);
    context.workouts.values().toArray();
  };

  public shared ({ caller }) func deleteWorkout(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete workouts");
    };
    let context = getOrCreateUser(caller);
    context.workouts.remove(id);
  };

  // Goal tracking
  public shared ({ caller }) func saveGoal(goal : Goal.T) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save goals");
    };
    let context = getOrCreateUser(caller);
    context.goals.add(goal.id, goal);
  };

  public query ({ caller }) func getGoals() : async [Goal.T] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view goals");
    };
    let context = getOrCreateUser(caller);
    context.goals.values().toArray();
  };

  public shared ({ caller }) func deleteGoal(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete goals");
    };
    let context = getOrCreateUser(caller);
    context.goals.remove(id);
  };

  // Meal tracking with photo upload
  public shared ({ caller }) func saveMeal(id : Text, photo : Storage.ExternalBlob, nutrition : (Float, Float, Float, Float, Float, Float, Float)) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save meals");
    };
    let context = getOrCreateUser(caller);
    let meal : Meal.T = {
      id;
      photo;
      calories = nutrition.0;
      carbs = nutrition.1;
      protein = nutrition.2;
      fat = nutrition.3;
      fiber = nutrition.4;
      sugar = nutrition.5;
      sodium = nutrition.6;
    };
    context.meals.add(id, meal);
  };

  public query ({ caller }) func getMeals() : async [Meal.T] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view meals");
    };
    let context = getOrCreateUser(caller);
    context.meals.values().toArray();
  };

  public shared ({ caller }) func deleteMeal(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete meals");
    };
    let context = getOrCreateUser(caller);
    context.meals.remove(id);
  };

  // Activity/steps tracking
  public shared ({ caller }) func startActivity(id : Text, activityType : ActivityType) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start activities");
    };
    let context = getOrCreateUser(caller);
    let activity : Activity = {
      id;
      activityType;
      steps = 0;
      calories = 0;
      distanceKm = 0.0;
      durationMinutes = 0.0;
      startTime = Time.now();
      endTime = Time.now();
      isActive = true;
    };
    context.activities.add(id, activity);
  };

  public shared ({ caller }) func endActivity(id : Text, steps : Nat, calories : Float, distanceKm : Float, durationMinutes : Float) : async Activity {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can end activities");
    };
    let context = getOrCreateUser(caller);
    switch (context.activities.get(id)) {
      case (null) { Runtime.trap("Activity not found") };
      case (?activity) {
        let updatedActivity : Activity = {
          id = activity.id;
          activityType = activity.activityType;
          steps;
          calories;
          distanceKm;
          durationMinutes;
          startTime = activity.startTime;
          endTime = Time.now();
          isActive = false;
        };
        context.activities.add(id, updatedActivity);
        updatedActivity;
      };
    };
  };

  public query ({ caller }) func getAllActivities() : async [Activity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view activities");
    };
    let context = getOrCreateUser(caller);
    context.activities.values().toArray();
  };

  // Manual steps entry
  public shared ({ caller }) func addSteps(steps : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add steps");
    };
    let context = getOrCreateUser(caller);
    let updatedUser : User.T = {
      displayName = context.displayName;
      units = context.units;
      workouts = context.workouts;
      goals = context.goals;
      meals = context.meals;
      activities = context.activities;
      stepCount = context.stepCount + steps;
    };
    users.add(caller, updatedUser);
  };

  public query ({ caller }) func getTotalSteps() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view steps");
    };
    let context = getOrCreateUser(caller);
    context.stepCount;
  };

  // Profile/settings (legacy functions for backward compatibility)
  public shared ({ caller }) func updateProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    let context = getOrCreateUser(caller);
    let updatedUser : User.T = {
      displayName = profile.displayName;
      units = profile.units;
      workouts = context.workouts;
      goals = context.goals;
      meals = context.meals;
      activities = context.activities;
      stepCount = context.stepCount;
    };
    users.add(caller, updatedUser);
  };

  public query ({ caller }) func getProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    let context = getOrCreateUser(caller);
    {
      displayName = context.displayName;
      units = context.units;
    };
  };

  // Data management
  public shared ({ caller }) func exportUserData() : async {
    workouts : [Workout];
    goals : [Goal.T];
    meals : [Meal.T];
    activities : [Activity];
    stepCount : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can export data");
    };
    let context = getOrCreateUser(caller);
    {
      workouts = context.workouts.values().toArray();
      goals = context.goals.values().toArray();
      meals = context.meals.values().toArray();
      activities = context.activities.values().toArray();
      stepCount = context.stepCount;
    };
  };

  public shared ({ caller }) func deleteAllUserData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete their data");
    };
    users.remove(caller);
  };
};
