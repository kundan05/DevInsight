import React from 'react';
import { Link } from 'react-router-dom';
import { FaCode, FaUsers, FaTrophy } from 'react-icons/fa';

const Home: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-900">
            {/* Hero Section */}
            <div className="relative isolate px-6 pt-14 lg:px-8">
                <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                        Elevate Your Coding Journey
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        DevInsight is the ultimate platform for developers to share snippets, collaborate in real-time, and solve coding challenges together.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link
                            to="/register"
                            className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                        >
                            Get started
                        </Link>
                        <Link to="/snippets" className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                            Explore Snippets <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Feature Section */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary-600">Deploy faster</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Everything you need to grow
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
                        <div className="relative pl-16">
                            <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                                    <FaCode className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Code Snippets
                            </dt>
                            <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                                Share and discover useful code snippets. Save your favorites and build your personal library.
                            </dd>
                        </div>
                        <div className="relative pl-16">
                            <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                                    <FaUsers className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Real-time Collaboration
                            </dt>
                            <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                                Pair program with others in real-time. Edit code together and communicate seamlessly.
                            </dd>
                        </div>
                        <div className="relative pl-16">
                            <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                                    <FaTrophy className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Coding Challenges
                            </dt>
                            <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                                Sharpen your skills with our curated list of coding challenges. Compete on the leaderboard.
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
};

export default Home;
