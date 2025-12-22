import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUser } from './features/auth/authSlice';
import { AppDispatch } from './store';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import SnippetList from './pages/SnippetList';
import CreateSnippet from './pages/CreateSnippet';
import SnippetDetail from './pages/SnippetDetail';
import Challenges from './pages/Challenges';
import ChallengeDetail from './pages/ChallengeDetail';
import Collaborate from './pages/Collaborate';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const NotFound = () => <div className='text-center mt-10 text-2xl'>404 - Not Found</div>;

function App() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(loadUser());
    }, [dispatch]);

    return (
        <Router>
            <Layout>
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
            </Layout>
        </Router>
    );
}



export default App;
