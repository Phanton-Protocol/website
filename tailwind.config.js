/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-color': 'var(--bg-color)',
                'primary-color': 'var(--primary-color)',
                'secondary-color': 'var(--secondary-color)',
                'accent-color': 'var(--accent-color)',
                'glass-bg': 'var(--glass-bg)',
                'glass-border': 'var(--glass-border)',
            },
            fontFamily: {
                'sans': ['var(--font-sans)'],
                'display': ['var(--font-display)'],
            },
        },
    },
    plugins: [],
}
