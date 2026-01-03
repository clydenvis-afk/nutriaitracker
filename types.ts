export interface NutritionalInfo {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface MealItem extends NutritionalInfo {
    id: string;
    name: string;
    portionDescription?: string;
    brand?: string;
    timestamp: number; // Unix timestamp
    dateStr: string; // YYYY-MM-DD for easier grouping
}

export interface ExerciseItem {
    id: string;
    name: string;
    durationMinutes: number;
    caloriesBurned: number;
    timestamp: number;
    dateStr: string;
}

export interface WeightLog {
    id: string;
    date: string;
    weight: number; // in kg
}

export interface UserProfile {
    name: string;
    age: number;
    height: number; // in cm
    currentWeight: number; // in kg
    targetCalories: number;
}

export interface Recipe extends NutritionalInfo {
    name: string;
    description: string;
    ingredients: string[];
}

export enum ViewState {
    DASHBOARD = 'DASHBOARD',
    ADD_MEAL = 'ADD_MEAL',
    ADD_EXERCISE = 'ADD_EXERCISE',
    STATS = 'STATS',
    PROFILE = 'PROFILE',
    RECIPES = 'RECIPES',
    ACTIVITY = 'ACTIVITY'
}

export interface AnalysisResult {
    foodItems: {
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        description: string;
    }[];
}
