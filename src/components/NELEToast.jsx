import React, { useEffect, useState } from 'react';

export function NELEToast() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handleToast = (event) => {
            const toast = event.detail;
            const id = Math.random().toString(36).substring(2, 9);
            
            setToasts(prev => [...prev, { ...toast, id }]);

            if (toast.duration > 0) {
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== id));
                }, toast.duration);
            }
        };

        window.addEventListener('nele-toast', handleToast);
        return () => window.removeEventListener('nele-toast', handleToast);
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`rounded-lg p-4 shadow-lg transition-all ${
                        toast.variant === 'destructive'
                            ? 'bg-red-50 border border-red-500 text-red-900'
                            : toast.variant === 'warning'
                            ? 'bg-yellow-50 border border-yellow-500 text-yellow-900'
                            : 'bg-white border text-gray-900'
                    }`}
                    role="alert"
                >
                    {toast.title && (
                        <div className="font-semibold">{toast.title}</div>
                    )}
                    {toast.description && (
                        <div className="mt-1 text-sm">{toast.description}</div>
                    )}
                    {toast.action && (
                        <button
                            onClick={toast.action.onClick}
                            className="mt-2 px-3 py-1 text-sm font-medium rounded-md
                                bg-white text-gray-900 hover:bg-gray-100
                                border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {toast.action.label}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}