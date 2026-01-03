import React, { useState } from 'react';
import { MealItem, Recipe, UserProfile } from '../types';
import { suggestRecipes } from '../services/geminiService';

interface RecipesViewProps {
    profile: UserProfile;
    recentMeals: MealItem[];
    onAddMeal: (meal: Omit<MealItem, 'id' | 'timestamp' | 'dateStr'>) => void;
}

const RecipesView: React.FC<RecipesViewProps> = ({ profile, recentMeals, onAddMeal }) => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Extract recent meal names for context
            const mealNames = recentMeals.slice(-10).map(m => m.name);
            const suggestions = await suggestRecipes(profile, mealNames);
            setRecipes(suggestions);
        } catch (e) {
            setError("Could not generate recipes. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = (recipe: Recipe) => {
        onAddMeal({
            name: recipe.name,
            portionDescription: "1 serving",
            calories: recipe.calories,
            protein: recipe.protein,
            carbs: recipe.carbs,
            fat: recipe.fat,
        });
        alert(`${recipe.name} added to your log!`);
    };

    return (
        <div className="space-y-6 pb-20">
            <header className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">Smart Recipes</h1>
                <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium">
                    <i className="fa-solid fa-sparkles mr-1"></i> AI Powered
                </div>
            </header>

            {recipes.length === 0 && !isLoading && (
                <div className="bg-surface rounded-2xl p-8 text-center border border-gray-700 border-dashed">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <i className="fa-solid fa-utensils text-2xl"></i>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Need Inspiration?</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Get personalized healthy recipe suggestions based on your diet and recent meals.
                    </p>
                    <button 
                        onClick={handleGenerate}
                        className="bg-primary hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-colors w-full"
                    >
                        Generate Ideas
                    </button>
                    {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
                </div>
            )}

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <i className="fa-solid fa-circle-notch fa-spin text-4xl text-primary"></i>
                    <p className="text-gray-400 animate-pulse">Chef AI is cooking up ideas...</p>
                </div>
            )}

            {recipes.length > 0 && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                         <h3 className="text-gray-300 text-sm font-medium">Suggestions for you</h3>
                         <button onClick={handleGenerate} className="text-primary text-xs hover:underline">
                            Refresh
                         </button>
                    </div>
                    
                    {recipes.map((recipe, idx) => (
                        <div key={idx} className="bg-surface rounded-2xl overflow-hidden border border-gray-700 shadow-lg">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-white">{recipe.name}</h3>
                                    <span className="bg-gray-800 text-xs px-2 py-1 rounded text-gray-300 font-mono">
                                        {recipe.calories} kcal
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{recipe.description}</p>
                                
                                <div className="flex gap-4 mb-4 text-xs">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                        <span className="text-gray-300">{recipe.protein}g Protein</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                                        <span className="text-gray-300">{recipe.carbs}g Carbs</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                        <span className="text-gray-300">{recipe.fat}g Fat</span>
                                    </div>
                                </div>

                                <div className="bg-dark/50 rounded-lg p-3 mb-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Key Ingredients</p>
                                    <div className="flex flex-wrap gap-2">
                                        {recipe.ingredients.map((ing, i) => (
                                            <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-600">
                                                {ing}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleAdd(recipe)}
                                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-plus"></i> Add to Daily Log
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecipesView;
