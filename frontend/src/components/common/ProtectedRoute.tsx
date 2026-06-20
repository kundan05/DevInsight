import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Loading from './Loading';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => setTimedOut(true), 10000);
            return () => clearTimeout(timer);
        }
        setTimedOut(false);
    }, [loading]);

    if (loading) {
        return timedOut ? (
            <Navigate to="/login" replace />
        ) : (
            <Loading />
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
