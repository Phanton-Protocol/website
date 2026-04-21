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
                'bg-deep': '#0a0b0d',
                'bg-surface': '#0d0e10',
                'text-primary': 'rgba(246, 251, 255, 0.95)',
                'text-secondary': 'rgba(210, 225, 245, 0.82)',
                'accent-cyan': '#8ba3b0',
                'accent-violet': '#7b7f8b',
            },
            animation: {
                'spin-slow': 'spin 20s linear infinite',
            }
        },
    },
    plugins: [],
}
