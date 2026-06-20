import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './features/auth/authSlice';
import { AppDispatch, RootState } from './store';

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
const Workspace = React.lazy(() => import('./pages/Workspace'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));

const NotFound = () => <div className='text-center mt-10 text-2xl text-gray-600'>404 - Page Not Found</div>;

function App() {
    const dispatch = useDispatch<AppDispatch>();
    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(() => {
        if (token) {
            dispatch(loadUser());
        }
    }, [dispatch, token]);

    return (
        <ErrorBoundary>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    <Route path="/workspace/:roomId" element={
                        <Suspense fallback={<Loading />}>
                            <Workspace />
                        </Suspense>
                    } />

                    <Route element={<Layout />}>
                        <Route path="/" element={<Suspense fallback={<Loading />}><Home /></Suspense>} />
                        <Route path="/login" element={<Suspense fallback={<Loading />}><Login /></Suspense>} />
                        <Route path="/register" element={<Suspense fallback={<Loading />}><Register /></Suspense>} />

                        <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<Suspense fallback={<Loading />}><Dashboard /></Suspense>} />
                            <Route path="/snippets" element={<Suspense fallback={<Loading />}><SnippetList /></Suspense>} />
                            <Route path="/snippets/create" element={<Suspense fallback={<Loading />}><CreateSnippet /></Suspense>} />
                            <Route path="/snippets/:id" element={<Suspense fallback={<Loading />}><SnippetDetail /></Suspense>} />
                            <Route path="/challenges" element={<Suspense fallback={<Loading />}><Challenges /></Suspense>} />
                            <Route path="/challenges/:id" element={<Suspense fallback={<Loading />}><ChallengeDetail /></Suspense>} />
                            <Route path="/collaborate/:sessionId" element={<Suspense fallback={<Loading />}><Collaborate /></Suspense>} />
                            <Route path="/profile/:username" element={<Suspense fallback={<Loading />}><Profile /></Suspense>} />
                            <Route path="/settings" element={<Suspense fallback={<Loading />}><Settings /></Suspense>} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
