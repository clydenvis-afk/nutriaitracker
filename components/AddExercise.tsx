import React, { useState } from 'react';
import { analyzeExerciseInput } from '../services/geminiService';
import { ExerciseItem, UserProfile } from '../types';

interface AddExerciseProps {
    profile: UserProfile;
    onAddExercises: (exercises: Omit<ExerciseItem, 'id' | 'timestamp' | 'dateStr'>[]) => void;
    onCancel: () => void;
}

const AddExercise: React.FC<AddExerciseProps> = ({ profile, onAddExercises, onCancel }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewItems, setPreviewItems] = useState<{ name: string, durationMinutes: number, caloriesBurned: number }[] | null>(null);

    const handleAnalyze = async () => {
        if (!input.trim()) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await analyzeExerciseInput(input, profile.currentWeight);
            setPreviewItems(result);
        } catch (err: any) {
            setError("Failed to analyze exercise. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = () => {
        if (previewItems) {
            onAddExercises(previewItems);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-surface w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Log Activity</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white">
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {!previewItems ? (
                        <div className="space-y-4">
                            <p className="text-gray-300">What activity did you do?</p>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="e.g. Ran 5km in 30 minutes, or Lifted weights for 45 mins."
                                className="w-full h-32 bg-dark border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-secondary focus:outline-none resize-none"
                            />
                            
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                <p className="text-xs text-blue-300">
                                    <i className="fa-solid fa-bolt mr-2"></i>
                                    AI-Powered: I'll estimate calories burned based on your weight ({profile.currentWeight}kg).
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
                                    isLoading || !input.trim() ? 'bg-gray-700 cursor-not-allowed' : 'bg-secondary hover:bg-blue-600'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <i className="fa-solid fa-circle-notch fa-spin"></i> Analyzing...
                                    </>
                                ) : (
                                    <>Analyze Activity</>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-secondary font-medium text-sm uppercase tracking-wide">Analysis Result</h3>
                            {previewItems.map((item, idx) => (
                                <div key={idx} className="bg-dark p-4 rounded-xl border border-gray-700">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-lg text-white">{item.name}</h4>
                                            <p className="text-sm text-gray-400">{item.durationMinutes} minutes</p>
                                        </div>
                                        <div className="text-right">
                                             <span className="block font-bold text-xl text-orange-400">{item.caloriesBurned}</span>
                                             <span className="text-xs text-gray-500">kcal burned</span>
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
                                    className="flex-1 py-3 rounded-xl font-bold text-white bg-secondary hover:bg-blue-600"
                                >
                                    Add to Log
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddExercise;
