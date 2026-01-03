import React from 'react';
import { MealItem, UserProfile, ExerciseItem } from '../types';
import RadialProgress from './RadialProgress';

interface DashboardProps {
    meals: MealItem[];
    exercises: ExerciseItem[];
    profile: UserProfile;
    onAddMealClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ meals, exercises, profile, onAddMealClick }) => {
    // Filter for today
    const today = new Date().toISOString().split('T')[0];
    const todaysMeals = meals.filter(m => m.dateStr === today);
    const todaysExercises = exercises.filter(e => e.dateStr === today);

    const totalFoodCalories = todaysMeals.reduce((sum, m) => sum + m.calories, 0);
    const totalExerciseCalories = todaysExercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
    const netCalories = totalFoodCalories - totalExerciseCalories;

    const totalProtein = todaysMeals.reduce((sum, m) => sum + m.protein, 0);
    const totalCarbs = todaysMeals.reduce((sum, m) => sum + m.carbs, 0);
    const totalFat = todaysMeals.reduce((sum, m) => sum + m.fat, 0);

    // Calories remaining based on NET intake
    const caloriesRemaining = profile.targetCalories - netCalories;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <header className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Today's Summary</h1>
                    <p className="text-gray-400 text-sm">{new Date().toDateString()}</p>
                </div>
            </header>

            {/* Main Stats Card */}
            <div className="bg-surface rounded-2xl p-6 shadow-lg border border-gray-700">
                <div className="flex flex-col items-center">
                    <RadialProgress 
                        current={Math.max(0, netCalories)} 
                        max={profile.targetCalories} 
                        size={180}
                        label={`${netCalories}`}
                        subLabel={`Net Kcal`}
                        color={netCalories > profile.targetCalories ? "text-red-500" : "text-primary"}
                    />
                    
                    <div className="grid grid-cols-3 w-full mt-6 gap-2 text-center border-t border-gray-700 pt-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Eaten</p>
                            <p className="font-bold text-white">{totalFoodCalories}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Burned</p>
                            <p className="font-bold text-orange-400">{totalExerciseCalories}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Remaining</p>
                            <p className={`font-bold ${caloriesRemaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {caloriesRemaining}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
                    <div className="text-center">
                        <p className="text-secondary font-bold text-lg">{Math.round(totalProtein)}g</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Protein</p>
                        <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-secondary h-full rounded-full" style={{ width: `${Math.min(100, (totalProtein / 150) * 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-accent font-bold text-lg">{Math.round(totalCarbs)}g</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Carbs</p>
                        <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-accent h-full rounded-full" style={{ width: `${Math.min(100, (totalCarbs / 250) * 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-rose-500 font-bold text-lg">{Math.round(totalFat)}g</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Fat</p>
                        <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, (totalFat / 70) * 100)}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Meals List */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold text-white">Recent Meals</h2>
                    <button 
                        onClick={onAddMealClick}
                        className="text-primary text-sm font-medium hover:text-emerald-400"
                    >
                        + Add New
                    </button>
                </div>
                
                {todaysMeals.length === 0 ? (
                    <div className="text-center py-8 bg-surface rounded-xl border border-gray-700 border-dashed">
                        <p className="text-gray-500 mb-2">No meals logged today</p>
                        <button 
                            onClick={onAddMealClick} 
                            className="bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium"
                        >
                            Log Breakfast
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todaysMeals.slice().reverse().map(meal => (
                            <div key={meal.id} className="bg-surface p-4 rounded-xl flex justify-between items-center border border-gray-700/50 hover:border-gray-600 transition-colors">
                                <div>
                                    <p className="font-medium text-white">{meal.name}</p>
                                    <p className="text-xs text-gray-400">{meal.portionDescription}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-emerald-400">{meal.calories} kcal</p>
                                    <p className="text-[10px] text-gray-500">
                                        P:{meal.protein} C:{meal.carbs} F:{meal.fat}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
