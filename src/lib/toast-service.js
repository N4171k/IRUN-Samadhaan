class ToastService {
    show({ title, description, variant = 'default', duration = 5000, action }) {
        console.log('🔔 Toast Service: Creating notification', { title, description, variant });
        
        // Create a custom event with the toast data
        const event = new CustomEvent('nele-toast', {
            detail: {
                title,
                description,
                variant,
                duration,
                action
            }
        });
        
        console.log('📢 Toast Service: Dispatching event');
        // Dispatch the event
        window.dispatchEvent(event);
    }
}

export const toast = new ToastService().show.bind(new ToastService());