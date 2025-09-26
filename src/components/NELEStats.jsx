import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNELE } from '../contexts/NELEContext';
import { Button } from './ui/button';
import { BarChart as ChartIcon } from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';

export const NELEStats = () => {
    const navigate = useNavigate();
    const { isMonitoring } = useNELE();

    const handleClick = () => {
        navigate('/emotion-analysis');
    };

    return (
        <div className="relative">
            <Button
                variant="outline"
                size="sm"
                onClick={handleClick}
                className="relative"
            >
                <ChartIcon className="h-4 w-4" />
                {isMonitoring && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
            </Button>
        </div>
    );
};