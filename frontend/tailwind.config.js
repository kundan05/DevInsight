module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                display: ['Syne', 'sans-serif'],
                sans: ['Inter', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            colors: {
                deep: {
                    base: '#0b0d17',
                    surface: '#141620',
                    elevated: '#1b1e2d',
                },
                border: '#25283b',
                text: {
                    primary: '#e8ebf0',
                    muted: '#7e829b',
                },
                accent: {
                    copper: '#d4815a',
                    'copper-dim': '#a86642',
                    teal: '#58b0a4',
                },
                status: {
                    success: '#7fb87a',
                    danger: '#e66a6a',
                    warning: '#d9a056',
                },
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                'slide-up': 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                'typewriter': 'typewriter 2s steps(40) forwards',
                'live-pulse': 'livePulse 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                livePulse: {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.7', transform: 'scale(0.95)' },
                },
            },
        },
    },
    plugins: [],
};
