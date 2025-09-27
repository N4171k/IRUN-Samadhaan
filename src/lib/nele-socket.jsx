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

        this.socket = io('https://irun-back.onrender.com');

        this.socket.on('connect', () => {
            console.log('Connected to NELE server');
            this.isConnected = true;
            this.socket.emit('subscribe_alerts');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from NELE server');
            this.isConnected = false;
        });

        this.socket.on('wellness_alert', (alertData) => {
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
        const { type, message, emotion, confidence } = alertData;
        
        // Custom message based on emotion type
        let customMessage = message;
        let title = "Wellness Alert";
        
        if (type === 'stress' || emotion?.toLowerCase() === 'stressed') {
            title = "⚠️ Stress Detected";
            customMessage = "You seem stressed! Take a deep breath and consider a short break to recover.";
            // Show stress notification
            toast({
                title,
                description: customMessage,
                variant: 'destructive',
                duration: 8000,
                action: {
                    label: 'Take Break',
                    onClick: () => {
                        // You can add break timer functionality here
                        console.log('User taking a break');
                    }
                }
            });
        } else if (type === 'distraction') {
            title = "🔔 Focus Alert";
            customMessage = "You seem distracted! Let's get back to focusing on your task.";
            // Show distraction notification
            toast({
                title,
                description: customMessage,
                variant: 'warning',
                duration: 6000,
                action: {
                    label: 'Refocus',
                    onClick: () => {
                        // You can add refocus exercises here
                        console.log('User refocusing');
                    }
                }
            });
        }

        const ToastAction = () => (
            <button
                className="text-xs underline"
                onClick={() => this.showBreathingExercise()}
            >
                Try breathing exercise
            </button>
        );

        // Show toast notification
        toast({
            title: `${emotion} Detected`,
            description: customMessage,
            variant: type === 'stress' || emotion.toLowerCase() === 'stressed' ? 'destructive' : 'warning',
            duration: 5000,
            action: (type === 'stress' || emotion.toLowerCase() === 'stressed') ? <ToastAction /> : undefined
        });

        // Optional: Play a subtle sound
        this.playAlertSound();
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