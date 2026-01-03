import React from 'react';
import { ExerciseItem } from '../types';

interface ActivityViewProps {
    exercises: ExerciseItem[];
    onAddExerciseClick: () => void;
}

const ActivityView: React.FC<ActivityViewProps> = ({ exercises, onAddExerciseClick }) => {
    // Filter for today
    const today = new Date().toISOString().split('T')[0];
    const todaysExercises = exercises.filter(e => e.dateStr === today);
    const totalBurned = todaysExercises.reduce((sum, e) => sum + e.caloriesBurned, 0);

    return (
        <div className="space-y-6 pb-20">
            <header className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">Activity Log</h1>
                <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-medium">
                    <i className="fa-solid fa-fire mr-1"></i> {totalBurned} kcal burned
                </div>
            </header>

            {todaysExercises.length === 0 ? (
                <div className="bg-surface rounded-2xl p-8 text-center border border-gray-700 border-dashed">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <i className="fa-solid fa-person-running text-2xl"></i>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Get Moving!</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        No activities logged today. Track your exercises to offset your calorie intake.
                    </p>
                    <button 
                        onClick={onAddExerciseClick}
                        className="bg-secondary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors w-full"
                    >
                        Log Activity
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                     <button 
                        onClick={onAddExerciseClick}
                        className="w-full bg-surface border border-gray-700 hover:bg-gray-700/50 text-gray-300 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-plus"></i> Log Another Activity
                    </button>

                    {todaysExercises.slice().reverse().map(ex => (
                        <div key={ex.id} className="bg-surface p-5 rounded-2xl border border-gray-700 flex justify-between items-center shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-secondary">
                                    <i className="fa-solid fa-dumbbell"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{ex.name}</h3>
                                    <p className="text-sm text-gray-400">{ex.durationMinutes} mins</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-orange-400 text-lg">{ex.caloriesBurned}</span>
                                <span className="text-[10px] text-gray-500 uppercase">Kcal</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActivityView;
