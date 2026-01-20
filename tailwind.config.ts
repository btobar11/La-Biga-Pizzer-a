import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                coal: "#121212", // Updated to softer black
                gold: "#D4AF37", // New Gold
                "gray-text": "#E0E0E0", // Body text
                terracotta: "#C0392B", // Accent button
            },
            fontFamily: {
                serif: ["var(--font-playfair)", "serif"],
                sans: ["var(--font-montserrat)", "sans-serif"], // Keeping Montserrat as it's good for sans
            },
        },
    },
    plugins: [],
};
export default config;
