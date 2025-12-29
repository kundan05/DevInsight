import React from 'react';
import { FaGithub, FaTwitter, FaLinkedin, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="relative bg-organic-charcoal text-organic-sand pt-24 pb-12 overflow-hidden">
            {/* Top Edge Paper/Tear Effect */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
                <svg className="relative block w-[calc(110%+1.3px)] h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-organic-sand"></path>
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
                {/* Brand Column - Wide */}
                <div className="md:col-span-5 space-y-6">
                    <h3 className="font-display text-4xl mb-4 text-white">Dev<span className="text-organic-moss italic">Insight</span></h3>
                    <p className="text-organic-sand/70 max-w-sm leading-relaxed">
                        Hand-crafted for developers who care about the details.
                        Built with intentional imperfection and human soul.
                    </p>
                    <div className="flex gap-4 mt-8">
                        {[FaGithub, FaTwitter, FaLinkedin].map((Icon, idx) => (
                            <a key={idx} href="#" className="p-3 bg-white/5 rounded-organic-2 hover:bg-organic-moss hover:scale-110 transition-all duration-300 group">
                                <Icon className="w-5 h-5 group-hover:text-white transition-colors" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Vertical Links - Asymmetric spacing */}
                <div className="md:col-span-3 pt-12 md:pt-0">
                    <h4 className="font-bold text-xl mb-8 font-hand text-organic-moss rotate-2">Explore</h4>
                    <ul className="space-y-4">
                        {['Snippets', 'Challenges', 'Community', 'About Us'].map((item) => (
                            <li key={item} className="transform transition-transform hover:translate-x-2">
                                <Link to="#" className="hover:text-organic-moss transition-colors">{item}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Newsletter / Interactive Element - Blob shape */}
                <div className="md:col-span-4">
                    <div className="bg-white/5 p-8 rounded-organic-1 backdrop-blur-sm border border-white/10 hover:border-organic-moss/50 transition-colors">
                        <h4 className="font-bold text-lg mb-4">Join the Collective</h4>
                        <p className="text-sm text-organic-sand/60 mb-6">Get weekly inspiration, no algorithmic fluff.</p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="w-full bg-transparent border-b border-organic-sand/30 py-2 focus:outline-none focus:border-organic-moss transition-colors placeholder-organic-sand/20"
                            />
                            <button className="absolute right-0 top-0 text-organic-moss hover:text-white transition-colors font-bold">
                                →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Note */}
            <div className="px-6 text-center mt-20 pt-8 border-t border-white/5 text-organic-sand/40 text-sm font-mono">
                <p className="flex items-center justify-center gap-2">
                    Code with <FaHeart className="text-red-500 animate-pulse" /> by Kundan
                </p>
                <p className="mt-2">© 2025. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
