import type { Metadata } from "next";
import { Inter, Playfair_Display, Montserrat } from "next/font/google";
import { CartProvider } from "../context/CartContext";
import "./globals.css";

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
});

const montserrat = Montserrat({
    subsets: ["latin"],
    variable: "--font-montserrat",
});

export const metadata: Metadata = {
    title: "La Biga | Pizza Napolitana Contemporánea",
    description: "La primera Pizza Napolitana Contemporánea en Constitución. Fermentación lenta, ingredientes italianos.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={`${playfair.variable} ${montserrat.variable} bg-coal text-wheat font-sans`}>
                <CartProvider>
                    {children}
                </CartProvider>
            </body>
        </html>
    );
}
