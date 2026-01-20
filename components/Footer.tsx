"use client";

import { Instagram, MapPin, Clock } from "lucide-react";
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
                <p className="text-xs text-gray-600 font-sans">
                    © {new Date().getFullYear()} La Biga Pizzeria. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
}
