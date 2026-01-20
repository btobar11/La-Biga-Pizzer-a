"use client";

import { Instagram, MapPin } from "lucide-react";
import { useCart } from "../context/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, ShoppingBag } from "lucide-react";

// Floating Cart Component integrated or separate? 
// The user requested a separate floating button "siempre visible". 
// I will keep CartButton separate and just make a simple Footer.

export default function Footer() {
    return (
        <footer className="bg-coal py-12 border-t border-white/5 text-center">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-center gap-6 mb-8">
                    <div className="flex items-center gap-2 text-gold">
                        <MapPin className="h-5 w-5" />
                        <span className="font-sans font-bold">Delivery en Constitución</span>
                    </div>

                    <a
                        href="https://instagram.com/labigapizzeria.cl"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-text hover:text-white transition-colors"
                    >
                        <Instagram className="h-6 w-6" />
                        <span className="font-sans">@labigapizzeria.cl</span>
                    </a>
                </div>

                <p className="text-xs text-gray-600 font-sans">
                    © {new Date().getFullYear()} La Biga Pizzeria. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
}
