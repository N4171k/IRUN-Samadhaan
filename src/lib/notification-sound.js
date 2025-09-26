function generateNotificationSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillator
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
    
    // Create gain node for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Start and stop
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

export function playNotificationSound() {
    try {
        generateNotificationSound();
    } catch (err) {
        console.log('Failed to play notification sound:', err);
    }
}