import React, { useState, useEffect } from 'react';
import { FiSettings } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Settings: React.FC = () => {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') !== 'light';
    });
    const [notifications, setNotifications] = useState(() => {
        return localStorage.getItem('notifications') !== 'false';
    });

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode((prev) => {
            const next = !prev;
            toast.success(next ? 'Dark mode enabled' : 'Light mode enabled');
            return next;
        });
    };

    const toggleNotifications = () => {
        setNotifications((prev) => {
            const next = !prev;
            localStorage.setItem('notifications', String(next));
            toast.success(next ? 'Notifications enabled' : 'Notifications disabled');
            return next;
        });
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="heading text-2xl sm:text-3xl text-text-primary mb-1">
                    Settings
                </h1>
                <p className="text-sm text-text-muted">
                    Manage your preferences.
                </p>
            </div>

            <div className="card p-6 divide-y divide-border">
                <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div>
                        <h3 className="text-sm font-medium text-text-primary">Dark Mode</h3>
                        <p className="text-xs text-text-muted mt-0.5">Toggle dark/light theme</p>
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className={`w-10 h-5 rounded-full transition-colors relative ${darkMode ? 'bg-accent-copper' : 'bg-deep-elevated border border-border'}`}
                    >
                        <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[2px] transition-all ${darkMode ? 'left-[22px]' : 'left-[3px]'}`} />
                    </button>
                </div>
                <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div>
                        <h3 className="text-sm font-medium text-text-primary">Email Notifications</h3>
                        <p className="text-xs text-text-muted mt-0.5">Receive updates about your account</p>
                    </div>
                    <button
                        onClick={toggleNotifications}
                        className={`w-10 h-5 rounded-full transition-colors relative ${notifications ? 'bg-accent-copper' : 'bg-deep-elevated border border-border'}`}
                    >
                        <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[2px] transition-all ${notifications ? 'left-[22px]' : 'left-[3px]'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
