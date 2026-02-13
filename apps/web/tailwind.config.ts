import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                lightning: {
                    blue: "#0176D3",
                    "blue-dark": "#014486",
                    gray: "#F3F3F3",
                    border: "#DDDBDA",
                    text: "#080707",
                    "text-light": "#444444",
                },
                primary: "#0176D3",
                secondary: "#706e6b",
            },
            borderRadius: {
                xl: "0.75rem",
                "2xl": "1rem",
                "3xl": "1.5rem",
            },
            boxShadow: {
                'lightning': '0 2px 2px 0 rgba(0, 0, 0, 0.1)',
                'lightning-card': '0 2px 5px 0 rgba(0, 0, 0, 0.1)',
            }
        },
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;
