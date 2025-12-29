import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCode, FaUsers, FaTrophy } from 'react-icons/fa';
import OrganicCard from '../components/common/OrganicCard';
import OrganicButton from '../components/common/OrganicButton';

const Home: React.FC = () => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setOffset(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-organic-sand min-h-screen overflow-hidden">
            {/* Hero Section with Diagonal Split and Parallax */}
            <div className="relative min-h-[90vh] flex items-center">
                {/* Background Shapes */}
                <div
                    className="absolute top-0 right-0 w-2/3 h-full bg-organic-clay clip-diagonal opacity-50 -z-10"
                    style={{ transform: `translateY(${offset * 0.2}px)` }}
                />
                <div
                    className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-organic-moss/10 rounded-full blur-[100px] -z-10"
                />

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 space-y-8 relative z-10" style={{ transform: `translateY(${offset * -0.1}px)` }}>
                        <h1 className="font-display text-6xl md:text-8xl font-bold text-organic-charcoal leading-[0.9]">
                            Elevate <br />
                            <span className="text-organic-moss italic ml-12">Your Code</span> <br />
                            Journey
                        </h1>
                        <p className="text-xl md:text-2xl text-organic-charcoal/80 max-w-lg font-light leading-relaxed">
                            DevInsight is where code meets craft. Share snippets, collaborate in real-time, and solve challenges in a space designed for humans, not robots.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link to="/register">
                                <OrganicButton variant="secondary" shape="blob" className="text-lg px-8 py-4 shadow-xl hover:shadow-2xl">
                                    Start Creating
                                </OrganicButton>
                            </Link>
                            <Link to="/snippets">
                                <OrganicButton variant="ghost" shape="blob" className="text-lg px-8 py-4">
                                    Explore Library
                                </OrganicButton>
                            </Link>
                        </div>
                    </div>

                    {/* Abstract Visual Element */}
                    <div className="lg:col-span-5 hidden lg:block relative">
                        <div className="relative w-full aspect-square animate-float">
                            <div className="absolute inset-0 bg-organic-moss rounded-organic-1 opacity-80 mix-blend-multiply filter blur-sm transform rotate-6"></div>
                            <div className="absolute inset-0 bg-primary-600 rounded-organic-2 opacity-80 mix-blend-multiply filter blur-sm transform -rotate-3 translate-x-4"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FaCode className="text-white w-32 h-32 opacity-90 drop-shadow-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Section with Broken Grid */}
            <div className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="font-hand text-3xl text-organic-moss block mb-4 transform -rotate-2">Why we exist</span>
                        <h2 className="font-display text-5xl font-bold text-organic-charcoal">Everything you need to grow</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16">
                        <OrganicCard
                            variant="paper"
                            shape="blob"
                            className="mt-0 lg:mt-12"
                            hoverEffect="tilt"
                        >
                            <div className="mb-6 inline-block p-4 bg-primary-100 text-primary-600 rounded-organic-3 transform -rotate-3">
                                <FaCode className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 font-display">Code Snippets</h3>
                            <p className="text-organic-charcoal/70 leading-relaxed">
                                Share and discover useful code snippets. Save your favorites and build your personal library in a beautiful, organized space.
                            </p>
                        </OrganicCard>

                        <OrganicCard
                            variant="paper"
                            shape="rounded"
                            className="relative z-10 scale-110 shadow-2xl rotate-1"
                            hoverEffect="lift"
                        >
                            <div className="mb-6 inline-block p-4 bg-organic-moss/20 text-organic-moss rounded-organic-2 transform rotate-2">
                                <FaUsers className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 font-display">Real-time Collab</h3>
                            <p className="text-organic-charcoal/70 leading-relaxed">
                                Pair program with others in real-time. Edit code together and communicate seamlessly with our instant-sync editor.
                            </p>
                        </OrganicCard>

                        <OrganicCard
                            variant="paper"
                            shape="jagged"
                            className="mt-0 lg:mt-24 rotate-1"
                            hoverEffect="tilt"
                        >
                            <div className="mb-6 inline-block p-4 bg-purple-100 text-purple-600 rounded-full">
                                <FaTrophy className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 font-display">Coding Challenges</h3>
                            <p className="text-organic-charcoal/70 leading-relaxed">
                                Sharpen your skills with our curated list of coding challenges. Compete on the leaderboard and prove your mastery.
                            </p>
                        </OrganicCard>
                    </div>
                </div>
            </div>

            <style>{`
                .clip-diagonal {
                    clip-path: polygon(20% 0%, 100% 0, 100% 100%, 0% 100%);
                }
            `}</style>
        </div>
    );
};

export default Home;
