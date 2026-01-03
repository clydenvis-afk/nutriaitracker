import React, { useState } from 'react';
import { analyzeFoodInput } from '../services/geminiService';
import { MealItem, NutritionalInfo } from '../types';

interface AddMealProps {
    onAddMeals: (meals: Omit<MealItem, 'id' | 'timestamp' | 'dateStr'>[]) => void;
    onCancel: () => void;
}

const AddMeal: React.FC<AddMealProps> = ({ onAddMeals, onCancel }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewItems, setPreviewItems] = useState<(NutritionalInfo & { name: string, description: string })[] | null>(null);

    const handleAnalyze = async () => {
        if (!input.trim()) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await analyzeFoodInput(input);
            setPreviewItems(result.foodItems);
        } catch (err: any) {
            setError("Failed to analyze food. Please check your connection or try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = () => {
        if (previewItems) {
            onAddMeals(previewItems.map(item => ({
                name: item.name,
                portionDescription: item.description,
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat
            })));
        }
    };

    const handleDiscardItem = (index: number) => {
        if (!previewItems) return;
        const newItems = [...previewItems];
        newItems.splice(index, 1);
        if (newItems.length === 0) {
            setPreviewItems(null);
        } else {
            setPreviewItems(newItems);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-surface w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Log Meal</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white">
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {!previewItems ? (
                        <div className="space-y-4">
                            <p className="text-gray-300">What did you eat or drink? Be as specific as you like.</p>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="e.g. 1 Large Chickenjoy with rice and a regular Coke, or 100g cooked chicken breast."
                                className="w-full h-32 bg-dark border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                            />
                            
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                <p className="text-xs text-blue-300">
                                    <i className="fa-solid fa-robot mr-2"></i>
                                    AI-Powered: I can recognize brands like Jollibee, Starbucks, and specific quantities.
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleAnalyze}
                                disabled={isLoading || !input.trim()}
                                className={`w-full py-3 rounded-xl font-bold text-white flex justify-center items-center gap-2 ${
                                    isLoading || !input.trim() ? 'bg-gray-700 cursor-not-allowed' : 'bg-primary hover:bg-emerald-600'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <i className="fa-solid fa-circle-notch fa-spin"></i> Analyzing...
                                    </>
                                ) : (
                                    <>Analyze Meal</>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-emerald-400 font-medium text-sm uppercase tracking-wide">Analysis Result</h3>
                            {previewItems.map((item, idx) => (
                                <div key={idx} className="bg-dark p-4 rounded-xl border border-gray-700 relative group">
                                    <button 
                                        onClick={() => handleDiscardItem(idx)}
                                        className="absolute top-2 right-2 text-gray-500 hover:text-red-400 p-1"
                                    >
                                        <i className="fa-solid fa-trash-can"></i>
                                    </button>
                                    <h4 className="font-bold text-lg text-white pr-6">{item.name}</h4>
                                    <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                        <div className="bg-gray-800 rounded p-1">
                                            <span className="block font-bold text-white">{item.calories}</span>
                                            <span className="text-gray-500">kcal</span>
                                        </div>
                                        <div className="bg-gray-800 rounded p-1">
                                            <span className="block font-bold text-secondary">{item.protein}g</span>
                                            <span className="text-gray-500">Prot</span>
                                        </div>
                                        <div className="bg-gray-800 rounded p-1">
                                            <span className="block font-bold text-accent">{item.carbs}g</span>
                                            <span className="text-gray-500">Carb</span>
                                        </div>
                                        <div className="bg-gray-800 rounded p-1">
                                            <span className="block font-bold text-rose-500">{item.fat}g</span>
                                            <span className="text-gray-500">Fat</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setPreviewItems(null)}
                                    className="flex-1 py-3 rounded-xl font-bold text-gray-300 bg-gray-700 hover:bg-gray-600"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 py-3 rounded-xl font-bold text-white bg-primary hover:bg-emerald-600"
                                >
                                    Add All to Log
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddMeal;
