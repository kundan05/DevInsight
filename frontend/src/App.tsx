import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUser } from './features/auth/authSlice';
import { AppDispatch } from './store';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loading from './components/common/Loading';

// Lazy Loaded Pages
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const SnippetList = React.lazy(() => import('./pages/SnippetList'));
const CreateSnippet = React.lazy(() => import('./pages/CreateSnippet'));
const SnippetDetail = React.lazy(() => import('./pages/SnippetDetail'));
const Challenges = React.lazy(() => import('./pages/Challenges'));
const ChallengeDetail = React.lazy(() => import('./pages/ChallengeDetail'));
const Collaborate = React.lazy(() => import('./pages/Collaborate'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));

const NotFound = () => <div className='text-center mt-10 text-2xl text-gray-600'>404 - Page Not Found</div>;

function App() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(loadUser());
    }, [dispatch]);

    return (
        <ErrorBoundary>
            <Router>
                <Layout>
                    <Suspense fallback={<Loading />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            <Route element={<ProtectedRoute />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/snippets" element={<SnippetList />} />
                                <Route path="/snippets/create" element={<CreateSnippet />} />
                                <Route path="/snippets/:id" element={<SnippetDetail />} />
                                <Route path="/challenges" element={<Challenges />} />
                                <Route path="/challenges/:id" element={<ChallengeDetail />} />
                                <Route path="/collaborate/:sessionId" element={<Collaborate />} />
                                <Route path="/profile/:username" element={<Profile />} />
                                <Route path="/settings" element={<Settings />} />
                            </Route>

                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </Layout>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
