import { io } from 'socket.io-client';
import { toast } from './toast-service';
import React from 'react';

class NELESocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    connect() {
        if (this.socket) return;

        this.socket = io('http://localhost:5000');

        this.socket.on('connect', () => {
            console.log('🟢 Connected to NELE server');
            this.isConnected = true;
            console.log('🔔 Subscribing to alerts...');
            this.socket.emit('subscribe_alerts');
        });

        this.socket.on('disconnect', () => {
            console.log('🔴 Disconnected from NELE server');
            this.isConnected = false;
        });

        this.socket.on('subscription_confirmed', (data) => {
            console.log('✅ Alert subscription confirmed:', data);
        });

        this.socket.on('wellness_alert', (alertData) => {
            console.log('Received wellness alert:', alertData);
            this.handleWellnessAlert(alertData);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    handleWellnessAlert(alertData) {
        console.log('🎯 Handling wellness alert:', alertData);
        
        const { type, title: alertTitle, message, emotion, confidence } = alertData;
        
        // Use the message from the backend or fallback to custom message
        let customMessage = message;
        let title = alertTitle || "Wellness Alert";
        
        console.log('📝 Preparing toast notification:', { title, customMessage, type });
        
        const showBreathingExerciseAction = () => (
            <button
                className="text-xs bg-white px-2 py-1 rounded hover:bg-gray-100"
                onClick={() => this.showBreathingExercise()}
            >
                Try breathing exercise
            </button>
        );

        if (type === 'stress' || emotion?.toLowerCase() === 'stressed') {
            title = title || "⚠️ Stress Detected";
            customMessage = customMessage || "You seem stressed! Take a deep breath and consider a short break to recover.";
            
            toast({
                title,
                description: `${customMessage} (Confidence: ${confidence.toFixed(1)}%)`,
                variant: 'destructive',
                duration: 8000,
                action: showBreathingExerciseAction
            });
            
            this.playAlertSound();

        } else if (type === 'distraction') {
            title = title || "🔔 Focus Alert";
            customMessage = customMessage || "You seem distracted! Let's get back to focusing on your task.";
            
            toast({
                title,
                description: `${customMessage} (Confidence: ${confidence.toFixed(1)}%)`,
                variant: 'warning',
                duration: 6000,
                action: {
                    label: 'Refocus',
                    onClick: () => {
                        toast({
                            title: "Refocus Exercise",
                            description: "Take 30 seconds to observe your surroundings, then return to your task with renewed focus.",
                            duration: 5000
                        });
                    }
                }
            });
            
            this.playAlertSound();
        }
    }

    playAlertSound() {
        import('./notification-sound').then(module => {
            module.playNotificationSound();
        });
    }

    showBreathingExercise() {
        // You can implement a breathing exercise modal/popup here
        toast({
            title: "Breathing Exercise",
            description: "Breathe in for 4 seconds, hold for 4 seconds, breathe out for 4 seconds. Repeat 4 times.",
            duration: 10000,
        });
    }
}

export const neleSocket = new NELESocketService();