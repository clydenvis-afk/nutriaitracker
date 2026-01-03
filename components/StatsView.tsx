import React, { useState } from 'react';
import { MealItem, UserProfile, WeightLog, ExerciseItem } from '../types';
import WeightChart from './WeightChart';
import { 
    BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, 
    PieChart, Pie, Legend
} from 'recharts';

interface StatsViewProps {
    meals: MealItem[];
    exercises: ExerciseItem[];
    weightLogs: WeightLog[];
    profile: UserProfile;
    onUpdateWeight: (weight: number) => void;
    onUpdateProfile: (profile: UserProfile) => void;
    onImportData: (data: any) => void;
}

const StatsView: React.FC<StatsViewProps> = ({ meals, exercises, weightLogs, profile, onUpdateWeight, onUpdateProfile, onImportData }) => {
    const [newWeight, setNewWeight] = useState('');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

    // --- BMI Logic ---
    const heightInMeters = profile.height / 100;
    const bmi = profile.currentWeight / (heightInMeters * heightInMeters);
    const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
    const bmiColor = bmi < 18.5 ? 'text-blue-400' : bmi < 25 ? 'text-emerald-400' : bmi < 30 ? 'text-yellow-400' : 'text-red-400';

    // --- Data Processing for Charts ---
    
    // Helper to fill missing dates
    const getDates = (days: number) => {
        return Array.from({ length: days }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i)); // Reverse to get chronological order
            return d.toISOString().split('T')[0];
        });
    };

    const rangeDays = timeRange === 'week' ? 7 : 30;
    const dateRange = getDates(rangeDays);

    const trendData = dateRange.map(date => {
        const dayMeals = meals.filter(m => m.dateStr === date);
        const dayExercises = exercises.filter(e => e.dateStr === date);
        
        const foodCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
        const exerciseCalories = dayExercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
        const netCalories = Math.max(0, foodCalories - exerciseCalories);

        const protein = dayMeals.reduce((sum, m) => sum + m.protein, 0);
        const carbs = dayMeals.reduce((sum, m) => sum + m.carbs, 0);
        const fat = dayMeals.reduce((sum, m) => sum + m.fat, 0);
        
        return {
            dateDisplay: timeRange === 'week' 
                ? new Date(date).toLocaleDateString('en-US', { weekday: 'short' }) 
                : new Date(date).getDate().toString(),
            dateFull: date,
            calories: netCalories, // Display Net Calories in bar chart
            rawIntake: foodCalories,
            burned: exerciseCalories,
            protein,
            carbs,
            fat
        };
    });

    // Macro Averages for Pie Chart (based on selected range)
    const totalProtein = trendData.reduce((s, d) => s + d.protein, 0);
    const totalCarbs = trendData.reduce((s, d) => s + d.carbs, 0);
    const totalFat = trendData.reduce((s, d) => s + d.fat, 0);
    
    // Avoid division by zero
    const hasMacroData = totalProtein + totalCarbs + totalFat > 0;
    const macroData = [
        { name: 'Protein', value: totalProtein, color: '#3b82f6' }, // Blue
        { name: 'Carbs', value: totalCarbs, color: '#f59e0b' },     // Amber
        { name: 'Fat', value: totalFat, color: '#f43f5e' },         // Rose
    ];

    // --- Calendar Logic ---
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthName = today.toLocaleString('default', { month: 'long' });
    
    // Get first day of month and total days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startingDayOfWeek = firstDay.getDay(); // 0-6
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const calendarDays: { day: number | null, dateStr?: string, netCals?: number, status?: 'green' | 'yellow' | 'red' | 'empty' }[] = [];
    
    // Padding
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push({ day: null });
    }
    
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
        // Construct date string manually to match format YYYY-MM-DD
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayMeals = meals.filter(m => m.dateStr === dateStr);
        const dayExercises = exercises.filter(e => e.dateStr === dateStr);

        const foodCals = dayMeals.reduce((acc, m) => acc + m.calories, 0);
        const exCals = dayExercises.reduce((acc, e) => acc + e.caloriesBurned, 0);
        const netCals = Math.max(0, foodCals - exCals);
        
        let status: 'green' | 'yellow' | 'red' | 'empty' = 'empty';
        if (dayMeals.length > 0 || dayExercises.length > 0) {
            const ratio = netCals / profile.targetCalories;
            if (ratio <= 1.10) {
                status = 'green'; // <= 110%
            } else if (ratio > 1.30) {
                status = 'red'; // > 130%
            } else {
                status = 'yellow'; // 110% - 130%
            }
        }
        
        calendarDays.push({ day: i, dateStr, netCals, status });
    }


    // --- Handlers ---

    const handleAddWeight = () => {
        const weight = parseFloat(newWeight);
        if (!isNaN(weight) && weight > 0) {
            onUpdateWeight(weight);
            setNewWeight('');
        }
    };

    const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onUpdateProfile({
            ...profile,
            name: formData.get('name') as string,
            age: parseInt(formData.get('age') as string) || profile.age,
            height: parseFloat(formData.get('height') as string),
            targetCalories: parseInt(formData.get('targetCalories') as string),
        });
        setIsEditingProfile(false);
    };

    const handleExport = () => {
        const data = {
            profile,
            meals,
            exercises,
            weightLogs,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nutritracker_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                onImportData(json);
            } catch (err) {
                alert("Failed to parse backup file.");
            }
        };
        reader.readAsText(file);
    };

    if (isEditingProfile) {
        return (
            <div className="space-y-6 pb-20">
                <header className="flex justify-between items-center mb-4">
                     <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
                     <button onClick={() => setIsEditingProfile(false)} className="text-sm text-gray-400">Cancel</button>
                </header>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Name</label>
                        <input name="name" defaultValue={profile.name} className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Age</label>
                            <input name="age" type="number" defaultValue={profile.age} className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white" />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Height (cm)</label>
                            <input name="height" type="number" defaultValue={profile.height} className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Daily Calorie Goal</label>
                        <input name="targetCalories" type="number" defaultValue={profile.targetCalories} className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white" />
                    </div>
                    
                    <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl mt-2">Save Changes</button>
                </form>

                {/* Data Backup Section */}
                <div className="pt-6 border-t border-gray-700 mt-6">
                    <h3 className="text-lg font-bold text-white mb-2">Data Management</h3>
                    <p className="text-xs text-gray-400 mb-4">Transfer your data between devices.</p>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={handleExport}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl border border-gray-600 flex justify-center items-center gap-2"
                        >
                            <i className="fa-solid fa-download"></i> Backup
                        </button>
                        
                        <label className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl border border-gray-600 flex justify-center items-center gap-2 cursor-pointer">
                            <i className="fa-solid fa-upload"></i> Restore
                            <input 
                                type="file" 
                                accept=".json" 
                                onChange={handleFileImport}
                                className="hidden" 
                            />
                        </label>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Your Dashboard</h1>
                <button onClick={() => setIsEditingProfile(true)} className="text-primary text-sm">
                    <i className="fa-solid fa-gear mr-1"></i> Settings
                </button>
            </header>

            {/* BMI & Weight Card */}
            <div className="bg-surface rounded-2xl p-6 shadow-lg border border-gray-700">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Weight</p>
                        <p className="text-3xl font-bold text-white mt-1">{profile.currentWeight} <span className="text-sm text-gray-500 font-normal">kg</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 text-xs uppercase tracking-wider">BMI</p>
                        <p className={`text-3xl font-bold mt-1 ${bmiColor}`}>{bmi.toFixed(1)}</p>
                        <p className={`text-xs font-medium ${bmiColor}`}>{bmiCategory}</p>
                    </div>
                </div>
                
                {/* BMI Scale Visual */}
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-[18.5%] bg-blue-500 opacity-50"></div>
                    <div className="absolute left-[18.5%] top-0 bottom-0 w-[26.5%] bg-emerald-500 opacity-50"></div>
                    <div className="absolute left-[45%] top-0 bottom-0 w-[20%] bg-yellow-500 opacity-50"></div>
                    <div className="absolute left-[65%] top-0 bottom-0 w-[35%] bg-red-500 opacity-50"></div>
                    
                    <div 
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-500"
                        style={{ left: `${Math.min(100, (bmi / 40) * 100)}%` }}
                    ></div>
                </div>

                {/* Quick Add Weight */}
                <div className="mt-6 flex gap-2">
                    <input 
                        type="number" 
                        placeholder="Log new weight..." 
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        className="flex-1 bg-dark border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary"
                    />
                    <button 
                        onClick={handleAddWeight}
                        className="bg-secondary/20 text-secondary hover:bg-secondary/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Update
                    </button>
                </div>
            </div>

            {/* Calorie Trend Chart */}
            <div className="bg-surface rounded-2xl p-5 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Net Calorie Trends</h3>
                    <div className="flex bg-gray-800 rounded-lg p-1">
                        <button 
                            onClick={() => setTimeRange('week')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${timeRange === 'week' ? 'bg-primary text-white shadow' : 'text-gray-400'}`}
                        >
                            Week
                        </button>
                        <button 
                            onClick={() => setTimeRange('month')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${timeRange === 'month' ? 'bg-primary text-white shadow' : 'text-gray-400'}`}
                        >
                            Month
                        </button>
                    </div>
                </div>
                <div className="h-48 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendData}>
                            <XAxis 
                                dataKey="dateDisplay" 
                                stroke="#6b7280" 
                                fontSize={10} 
                                tickLine={false}
                                interval={timeRange === 'month' ? 4 : 0}
                            />
                            <Tooltip 
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                contentStyle={{backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '8px'}}
                                formatter={(value: number) => [`${value} kcal`, 'Net Calories']}
                                labelStyle={{color: '#9ca3af', fontSize: '12px'}}
                            />
                            <Bar dataKey="calories" radius={[2, 2, 0, 0]}>
                                {trendData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.calories > profile.targetCalories ? '#f87171' : '#10b981'} 
                                        fillOpacity={entry.calories === 0 ? 0.2 : 1}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500 px-2">
                    <span>Target: {profile.targetCalories} kcal (Net)</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-400 rounded-full"></div> Over limit</span>
                </div>
            </div>

            {/* Monthly Calendar View */}
            <div className="bg-surface rounded-2xl p-5 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">{monthName} Consistency</h3>
                    <span className="text-xs text-gray-500">{currentYear}</span>
                </div>
                <p className="text-xs text-gray-400 mb-4">Based on Net Calories (Food - Exercise)</p>
                
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S','M','T','W','T','F','S'].map((d, i) => (
                        <div key={i} className="text-center text-xs text-gray-500 font-medium">{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((dayData, idx) => {
                        if (!dayData.day) return <div key={idx} className="aspect-square"></div>;
                        
                        let bgClass = "bg-gray-800 text-gray-600 border border-gray-700/50"; // Empty
                        if (dayData.status === 'green') bgClass = "bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.4)] border border-emerald-400";
                        if (dayData.status === 'yellow') bgClass = "bg-amber-500 text-white shadow-[0_0_8px_rgba(245,158,11,0.4)] border border-amber-400";
                        if (dayData.status === 'red') bgClass = "bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)] border border-red-400";

                        return (
                            <div 
                                key={idx} 
                                title={dayData.netCals !== undefined ? `${dayData.netCals} net kcal` : 'No data'}
                                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 cursor-default ${bgClass}`}
                            >
                                {dayData.day}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-4 mt-4 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-emerald-500"></div>
                        <span className="text-[10px] text-gray-400">On Track (≤110%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-amber-500"></div>
                        <span className="text-[10px] text-gray-400">Warning (110-130%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-red-500"></div>
                        <span className="text-[10px] text-gray-400">Overcap (>130%)</span>
                    </div>
                </div>
            </div>

            {/* Macro Distribution Pie Chart */}
            <div className="bg-surface rounded-2xl p-5 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Macro Distribution (Avg)</h3>
                <div className="h-48 w-full flex items-center justify-center">
                    {hasMacroData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={macroData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {macroData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '8px'}}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle"
                                    formatter={(value, entry: any) => <span style={{color: '#d1d5db', fontSize: '12px', marginRight: '10px'}}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-gray-500 text-sm">No macro data available for this period.</div>
                    )}
                </div>
            </div>

            {/* Weight History Chart */}
            <div className="bg-surface rounded-2xl p-5 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">Weight History</h3>
                <WeightChart data={weightLogs} />
            </div>
        </div>
    );
};

export default StatsView;