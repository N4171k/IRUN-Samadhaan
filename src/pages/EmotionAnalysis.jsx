import React, { useEffect, useState } from 'react';
import { useNELE } from '../contexts/NELEContext';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    LineChart,
    Line,
    Legend
} from 'recharts';
import { Loader2 } from 'lucide-react';

const EmotionAnalysis = () => {
    const { getStats, isLoading, error } = useNELE();
    const [statsData, setStatsData] = useState({
        emotionPercentages: [],
        emotionCounts: [],
        sessionInfo: null,
        dominantEmotion: ''
    });

    const fetchStats = async () => {
        const rawData = await getStats();
        if (rawData?.emotion_summary) {
            const { emotion_summary, session_info } = rawData;
            
            // Transform emotion percentages for chart
            const emotionPercentages = Object.entries(emotion_summary.emotion_percentages).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                percentage: value
            }));

            // Transform emotion counts for chart
            const emotionCounts = Object.entries(emotion_summary.emotion_counts).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                count: value
            }));

            setStatsData({
                emotionPercentages,
                emotionCounts,
                sessionInfo: session_info,
                dominantEmotion: emotion_summary.dominant_emotion
            });
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Emotion Analysis Dashboard</h1>
            
            {/* Session Information */}
            {statsData.sessionInfo && (
                <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4">Session Information</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-600">Average Confidence</p>
                            <p className="text-2xl font-bold">{statsData.sessionInfo.average_confidence.toFixed(2)}%</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-purple-600">Total Emotions</p>
                            <p className="text-2xl font-bold">{statsData.sessionInfo.total_emotions}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-600">Dominant Emotion</p>
                            <p className="text-2xl font-bold capitalize">{statsData.dominantEmotion}</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                            <p className="text-sm text-orange-600">Session Duration</p>
                            <p className="text-2xl font-bold">
                                {Math.round((new Date(statsData.sessionInfo.session_end) - new Date(statsData.sessionInfo.session_start)) / 1000)}s
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Emotion Percentages Chart */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Emotion Distribution (%)</h2>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsData.emotionPercentages}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    interval={0}
                                />
                                <YAxis />
                                <Tooltip 
                                    formatter={(value) => `${value.toFixed(1)}%`}
                                />
                                <Legend />
                                <Bar dataKey="percentage" fill="#8884d8" name="Percentage" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Emotion Counts Chart */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Emotion Occurrences</h2>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsData.emotionCounts}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    interval={0}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#82ca9d" name="Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmotionAnalysis;