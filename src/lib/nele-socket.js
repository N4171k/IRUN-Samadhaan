import { io } from 'socket.io-client';
import { toast } from './use-toast';

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
        if (type === 'stress' || emotion.toLowerCase() === 'stressed') {
            customMessage = "Hey, you seem stressed! Take a short break to recover yourself.";
        } else if (type === 'distraction') {
            customMessage = "Hey, you seem distracted! Try to maintain focus.";
        }

        // Show toast notification
        toast({
            title: `${emotion} Detected`,
            description: customMessage,
            variant: type === 'stress' ? 'destructive' : 'warning',
            duration: 5000,
            action: type === 'stress' ? (
                <a href="#" className="text-xs underline" onClick={() => this.showBreathingExercise()}>
                    Try breathing exercise
                </a>
            ) : undefined
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