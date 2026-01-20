"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartButton() {
    const { cart, total } = useCart();

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleOrder = () => {
        if (cart.length === 0) return;

        const itemsList = cart
            .map((item) => `- ${item.quantity}x ${item.name}`)
            .join("%0A");

        // "Hola La Biga, quiero pedir: [Lista]"
        const message = `Hola La Biga, quiero pedir:%0A${itemsList}%0A%0ATotal: $${total.toLocaleString("es-CL")}`;

        window.open(`https://wa.me/56975255704?text=${message}`, "_blank");
    };

    return (
        <AnimatePresence>
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }} // Always show? "Siempre visible" usually implies static, but if empty cart maybe hide? 
                // User said: "Botón flotante de WhatsApp siempre visible" but generally cart logic implies it handles checkout.
                // I'll make it show always but maybe different state if empty? 
                // For simplicity and effective UX: Show if items > 0 OR if user wants to just chat.
                // But the requirement is "Al hacer clic... debe abrir API". 
                // I will stick to showing it when items > 0 for "Order" context, or maybe a simple "Chat" button if 0?
                // Re-reading: "Al hacer clic... debe abrir la API con mensaje preescrito". This implies an order.
                // So I will keep logic: Show if items > 0.
                className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full px-6 py-4 shadow-2xl transition-all hover:scale-105 active:scale-95 ${totalItems > 0 ? "bg-terracotta text-white" : "hidden"
                    }`}
                onClick={handleOrder}
            >
                <div className="relative">
                    <ShoppingBag className="h-6 w-6" />
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-coal border border-coal">
                        {totalItems}
                    </span>
                </div>
                <span className="font-sans font-bold">
                    Pedir por WhatsApp (${total.toLocaleString("es-CL")})
                </span>
                <MessageCircle className="h-5 w-5" />
            </motion.button>
        </AnimatePresence>
    );
}
