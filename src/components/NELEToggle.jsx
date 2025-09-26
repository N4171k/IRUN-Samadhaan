import React from 'react';
import { useNELE } from '../contexts/NELEContext';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

export const NELEToggle = () => {
    const { neleEnabled, isMonitoring, isLoading, error, toggleNELE } = useNELE();

    return (
        <div className="relative">
            <Button
                variant={neleEnabled ? "secondary" : "outline"}
                size="sm"
                onClick={toggleNELE}
                disabled={isLoading}
                className={`min-w-[100px] ${error ? 'border-red-500' : ''}`}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        NELE {isMonitoring ? 'On' : 'Off'}
                    </>
                )}
            </Button>
            {error && (
                <div className="absolute top-full mt-1 text-xs text-red-500 whitespace-nowrap">
                    {error}
                </div>
            )}
        </div>
    );
};