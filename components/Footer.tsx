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
                <div className="flex flex-col items-center justify-center gap-6 mb-12 border-b border-white/10 pb-12 w-full">
                    <h3 className="font-serif text-3xl text-gold mb-2">Síguenos en Instagram</h3>
                    <p className="text-gray-300 font-sans mb-4 max-w-md">
                        Entérate de nuestras promociones exclusivas, nuevos sabores y el arte detrás de nuestra masa.
                    </p>
                    <a
                        href="https://www.instagram.com/labigapizzeria.cl"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-full transition-all group border border-white/10"
                    >
                        <Instagram className="h-6 w-6 text-gold group-hover:scale-110 transition-transform" />
                        <span className="font-sans text-white font-medium">@labigapizzeria.cl</span>
                    </a>
                </div>

                <div className="flex flex-col items-center justify-center gap-6 mb-8">
                    <div className="flex items-center gap-2 text-gold">
                        <MapPin className="h-5 w-5" />
                        <span className="font-sans font-bold">Delivery en Constitución</span>
                    </div>

                    <div className="flex items-center gap-2 text-gold">
                        <Clock className="h-5 w-5" />
                        <span className="font-sans font-bold">Jueves a Domingo: 19:00 - 23:00 hrs</span>
                    </div>

                    <a
                        href="https://www.instagram.com/labigapizzeria.cl"
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
                    <span className="block mt-1 text-[10px] text-white/20">v1.1 (Updates: Mobile & Header)</span>
                </p>
            </div>
        </footer>
    );
}
