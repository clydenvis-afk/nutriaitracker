import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeightLog } from '../types';

interface WeightChartProps {
    data: WeightLog[];
}

const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
    // Sort data by date ascending
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Take last 7 entries for better visibility on mobile
    const chartData = sortedData.slice(-10);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 p-2 border border-gray-700 rounded shadow-lg">
                    <p className="text-gray-300 text-sm">{label}</p>
                    <p className="text-primary font-bold">{`${payload[0].value} kg`}</p>
                </div>
            );
        }
        return null;
    };

    if (data.length === 0) {
        return <div className="h-48 flex items-center justify-center text-gray-500">No weight data yet</div>;
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                        dataKey="date" 
                        stroke="#9ca3af" 
                        fontSize={12}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                    />
                    <YAxis stroke="#9ca3af" fontSize={12} domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                        dot={{ r: 4, fill: '#10b981' }} 
                        activeDot={{ r: 6 }} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WeightChart;
