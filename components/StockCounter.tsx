"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useShopStatus } from "../hooks/useShopStatus";
import { Flame } from "lucide-react";

export default function StockCounter() {
    const { status, remainingStock } = useShopStatus();

    // Show only when status is 'open' (as requested)
    if (status !== 'open') return null;

    // Optional: Don't show if stock is very high? 
    // Usually FOMO works best when stock is low, e.g., < 20 or < 10.
    // User requested: "Si el cliente ve 'Stock Disponible: ∞', pospone... Si ve 'Quedan 8' compra".
    // So we should probably always show it if it's open, or maybe threshold it.
    // Let's show it always when open for now, as implied by "Counter de Stock".

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-0 left-0 w-full z-[100] bg-orange-600/95 backdrop-blur-md text-white py-2 shadow-lg"
            >
                <div className="container mx-auto px-4 flex items-center justify-center gap-2">
                    <Flame className="w-5 h-5 text-yellow-300 animate-pulse" />
                    <span className="font-bold text-sm md:text-base tracking-wide">
                        ¡ATENCIÓN! Quedan solo <span className="text-yellow-300 text-lg mx-1">{remainingStock}</span> masas para hoy
                    </span>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
