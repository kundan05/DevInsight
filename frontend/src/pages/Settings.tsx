import React from 'react';

const Settings: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 dark:text-white">Settings</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Preferences</h2>
                <div className="flex items-center justify-between py-4 border-b dark:border-gray-700">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                        <p className="text-gray-500 text-sm">Toggle application theme</p>
                    </div>
                    <button className="bg-gray-200 dark:bg-gray-700 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out">
                        <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                </div>
                <div className="flex items-center justify-between py-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                        <p className="text-gray-500 text-sm">Receive email updates about your account</p>
                    </div>
                    <button className="bg-blue-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out">
                        <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
