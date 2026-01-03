import React from 'react';

interface RadialProgressProps {
    current: number;
    max: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
    subLabel?: string;
}

const RadialProgress: React.FC<RadialProgressProps> = ({ 
    current, 
    max, 
    size = 120, 
    strokeWidth = 10,
    color = "text-primary",
    label,
    subLabel
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    // Cap percentage at 100 for the visual circle, but allow logic to exceed
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    className="text-gray-700"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={`${color} transition-all duration-1000 ease-out`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
                 {label && <span className="text-2xl font-bold text-white">{label}</span>}
                 {subLabel && <span className="text-xs text-gray-400">{subLabel}</span>}
            </div>
        </div>
    );
};

export default RadialProgress;
