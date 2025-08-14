/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require('nativewind/preset')],
    content: [
        './App.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter_400Regular", "sans-serif"],
            },
            colors: {
                primary: "#7797DB",
                black: "#000000",
                white: "#FFFFFF",
                red: "#FF0000",
                gray: "#F5F5F5",
            }
        },
    },
    plugins: [],
};
