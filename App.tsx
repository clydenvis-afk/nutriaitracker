import React, { useState, useEffect } from 'react';
import { ViewState, MealItem, UserProfile, WeightLog, ExerciseItem } from './types';
import Dashboard from './components/Dashboard';
import AddMeal from './components/AddMeal';
import AddExercise from './components/AddExercise';
import StatsView from './components/StatsView';
import RecipesView from './components/RecipesView';
import ActivityView from './components/ActivityView';

// Default initial state
const DEFAULT_PROFILE: UserProfile = {
    name: "User",
    age: 25,
    height: 170, // cm
    currentWeight: 70, // kg
    targetCalories: 2000,
};

const App: React.FC = () => {
    const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
    
    const [meals, setMeals] = useState<MealItem[]>([]);
    const [exercises, setExercises] = useState<ExerciseItem[]>([]);
    const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
    const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
        const storedMeals = localStorage.getItem('nutriai_meals');
        const storedExercises = localStorage.getItem('nutriai_exercises');
        const storedWeights = localStorage.getItem('nutriai_weights');
        const storedProfile = localStorage.getItem('nutriai_profile');

        if (storedMeals) setMeals(JSON.parse(storedMeals));
        if (storedExercises) setExercises(JSON.parse(storedExercises));
        if (storedWeights) setWeightLogs(JSON.parse(storedWeights));
        if (storedProfile) setProfile(JSON.parse(storedProfile));
        
        setIsLoaded(true);
    }, []);

    // Save to LocalStorage whenever state changes
    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem('nutriai_meals', JSON.stringify(meals));
    }, [meals, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem('nutriai_exercises', JSON.stringify(exercises));
    }, [exercises, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem('nutriai_weights', JSON.stringify(weightLogs));
    }, [weightLogs, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem('nutriai_profile', JSON.stringify(profile));
    }, [profile, isLoaded]);


    const handleAddMeals = (newMealsData: Omit<MealItem, 'id' | 'timestamp' | 'dateStr'>[]) => {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        
        const newMeals: MealItem[] = newMealsData.map(m => ({
            ...m,
            id: crypto.randomUUID(),
            timestamp: now.getTime(),
            dateStr: dateStr
        }));

        setMeals(prev => [...prev, ...newMeals]);
        setView(ViewState.DASHBOARD);
    };

    const handleAddExercises = (newExerciseData: Omit<ExerciseItem, 'id' | 'timestamp' | 'dateStr'>[]) => {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        
        const newExercises: ExerciseItem[] = newExerciseData.map(e => ({
            ...e,
            id: crypto.randomUUID(),
            timestamp: now.getTime(),
            dateStr: dateStr
        }));

        setExercises(prev => [...prev, ...newExercises]);
        setView(ViewState.ACTIVITY);
    };

    // Single meal add (from recipes)
    const handleAddSingleMeal = (newMealData: Omit<MealItem, 'id' | 'timestamp' | 'dateStr'>) => {
        handleAddMeals([newMealData]);
    };

    const handleUpdateWeight = (weight: number) => {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        
        const newLog: WeightLog = {
            id: crypto.randomUUID(),
            date: dateStr,
            weight: weight
        };

        // Update profile current weight as well
        setProfile(prev => ({ ...prev, currentWeight: weight }));
        
        // Remove existing log for today if exists to avoid duplicates per day (optional logic)
        setWeightLogs(prev => {
            const others = prev.filter(l => l.date !== dateStr);
            return [...others, newLog].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        });
    };

    const handleUpdateProfile = (newProfile: UserProfile) => {
        setProfile(newProfile);
    };

    const handleImportData = (data: any) => {
        if (!confirm("This will overwrite your current data with the backup file. Are you sure?")) return;

        try {
            if (data.profile) setProfile(data.profile);
            if (data.meals && Array.isArray(data.meals)) setMeals(data.meals);
            if (data.exercises && Array.isArray(data.exercises)) setExercises(data.exercises);
            if (data.weightLogs && Array.isArray(data.weightLogs)) setWeightLogs(data.weightLogs);
            
            alert("Data imported successfully!");
            setView(ViewState.DASHBOARD);
        } catch (e) {
            alert("Error importing data. File might be corrupted.");
        }
    };

    if (!isLoaded) return <div className="min-h-screen bg-dark flex items-center justify-center text-primary">Loading...</div>;

    return (
        <div className="min-h-screen bg-dark font-sans text-gray-100 flex justify-center">
            <div className="w-full max-w-md bg-dark min-h-screen flex flex-col relative shadow-2xl border-x border-gray-800">
                
                {/* Content Area */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {view === ViewState.DASHBOARD && (
                        <Dashboard 
                            meals={meals} 
                            exercises={exercises}
                            profile={profile} 
                            onAddMealClick={() => setView(ViewState.ADD_MEAL)}
                        />
                    )}

                    {view === ViewState.STATS && (
                        <StatsView 
                            meals={meals}
                            exercises={exercises}
                            weightLogs={weightLogs}
                            profile={profile}
                            onUpdateWeight={handleUpdateWeight}
                            onUpdateProfile={handleUpdateProfile}
                            onImportData={handleImportData}
                        />
                    )}

                    {view === ViewState.RECIPES && (
                        <RecipesView
                            profile={profile}
                            recentMeals={meals}
                            onAddMeal={handleAddSingleMeal}
                        />
                    )}

                    {view === ViewState.ACTIVITY && (
                        <ActivityView
                            exercises={exercises}
                            onAddExerciseClick={() => setView(ViewState.ADD_EXERCISE)}
                        />
                    )}
                </main>

                {/* Bottom Navigation */}
                <nav className="sticky bottom-0 w-full bg-surface/90 backdrop-blur-md border-t border-gray-800 pb-safe">
                    <div className="flex justify-around items-center h-16 px-2">
                        <button 
                            onClick={() => setView(ViewState.DASHBOARD)}
                            className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${view === ViewState.DASHBOARD ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <i className="fa-solid fa-house text-xl mb-1"></i>
                            <span className="text-[10px] font-medium">Home</span>
                        </button>

                        <button 
                            onClick={() => setView(ViewState.RECIPES)}
                            className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${view === ViewState.RECIPES ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <i className="fa-solid fa-utensils text-xl mb-1"></i>
                            <span className="text-[10px] font-medium">Recipes</span>
                        </button>

                        <button 
                            onClick={() => setView(ViewState.ADD_MEAL)}
                            className="flex flex-col items-center justify-center -mt-6 mx-2"
                        >
                            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 text-white transform hover:scale-105 transition-transform border-4 border-dark">
                                <i className="fa-solid fa-plus text-2xl"></i>
                            </div>
                        </button>

                        <button 
                            onClick={() => setView(ViewState.STATS)}
                            className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${view === ViewState.STATS ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <i className="fa-solid fa-chart-pie text-xl mb-1"></i>
                            <span className="text-[10px] font-medium">Stats</span>
                        </button>

                         <button 
                            onClick={() => setView(ViewState.ACTIVITY)}
                            className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${view === ViewState.ACTIVITY ? 'text-secondary' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <i className="fa-solid fa-person-running text-xl mb-1"></i>
                            <span className="text-[10px] font-medium">Activity</span>
                        </button>
                    </div>
                </nav>

                {/* Overlays */}
                {view === ViewState.ADD_MEAL && (
                    <AddMeal 
                        onAddMeals={handleAddMeals} 
                        onCancel={() => setView(ViewState.DASHBOARD)} 
                    />
                )}
                {view === ViewState.ADD_EXERCISE && (
                    <AddExercise
                        profile={profile}
                        onAddExercises={handleAddExercises}
                        onCancel={() => setView(ViewState.ACTIVITY)}
                    />
                )}

            </div>
        </div>
    );
};

export default App;