import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen bg-deep-base flex flex-col">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
            <Footer />
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: '#141620',
                        color: '#e8ebf0',
                        border: '1px solid #25283b',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                    },
                    success: {
                        iconTheme: { primary: '#7fb87a', secondary: '#141620' },
                    },
                    error: {
                        iconTheme: { primary: '#e66a6a', secondary: '#141620' },
                    },
                }}
            />
        </div>
    );
};

export default Layout;
