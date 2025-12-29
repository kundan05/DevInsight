module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                display: ['Fraunces', 'serif'], // For headings, adds character
                hand: ['Caveat', 'cursive'], // For organic touches
            },
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                },
                // Organic palette additions
                organic: {
                    clay: '#e8e6e3',
                    sand: '#f5f5f0',
                    moss: '#4a5d23',
                    charcoal: '#2c2c2c',
                }
            },
            borderRadius: {
                'organic-1': '255px 15px 225px 15px / 15px 225px 15px 255px',
                'organic-2': '20px 225px 20px 225px / 255px 15px 225px 15px',
                'organic-3': '15% 85% 24% 76% / 46% 77% 23% 54%',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'breathe': 'breathe 4s ease-in-out infinite',
                'wiggle': 'wiggle 1s ease-in-out infinite',
                'blob': 'blob 7s infinite',
                'tilt': 'tilt 10s infinite linear',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                breathe: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                },
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                tilt: {
                    '0%, 50%, 100%': { transform: 'rotate(0deg)' },
                    '25%': { transform: 'rotate(1deg)' },
                    '75%': { transform: 'rotate(-1deg)' },
                }
            },
        },
    },
    plugins: [],
};
