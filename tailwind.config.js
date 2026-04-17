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
                'bg-deep': '#16222b',
                'bg-surface': '#1f2a35',
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
