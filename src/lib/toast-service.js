class ToastService {
    show({ title, description, variant = 'default', duration = 5000, action }) {
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
        
        // Dispatch the event
        window.dispatchEvent(event);
    }
}

export const toast = new ToastService().show.bind(new ToastService());