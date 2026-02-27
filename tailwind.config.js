/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['Syncopate', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                'bg-deep': '#030407',
                'bg-surface': '#0a0c10',
                'text-primary': 'rgba(255, 255, 255, 0.95)',
                'text-secondary': 'rgba(255, 255, 255, 0.5)',
                'accent-cyan': '#00e5ff',
            },
            animation: {
                'spin-slow': 'spin 20s linear infinite',
            }
        },
    },
    plugins: [],
}
