"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, X, MessageCircle, ChevronRight, Check } from "lucide-react";

export default function ReservationSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [quantity, setQuantity] = useState(1);

    const handleReservation = () => {
        if (!date || !name) {
            alert("Por favor completa tu nombre y la fecha.");
            return;
        }

        const message = `Hola La Biga, me gustaría agendar un pedido 📅%0A%0A*Nombre:* ${name}%0A*Fecha:* ${date}%0A*Cantidad aprox:* ${quantity} pizzas%0A%0A¿Tienen disponibilidad?`;

        window.open(`https://wa.me/56975255704?text=${message}`, '_blank');
        setIsModalOpen(false);
    };

    return (
        <section className="bg-coal py-16 px-4 border-t border-white/5 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider mb-6 border border-gold/20">
                    <Calendar className="h-4 w-4" />
                    Stock Limitado
                </div>

                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
                    Asegura tu Biga
                </h2>

                <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Nuestra masa es un producto vivo que requiere <span className="text-gold font-bold">48 horas de fermentación</span>.
                    Trabajamos con unidades limitadas por día para garantizar la máxima calidad.
                    <br className="hidden md:block" />
                    Te recomendamos reservar tu pedido con 1 o 2 días de anticipación.
                </p>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent border-2 border-gold/50 rounded-xl text-gold font-bold text-lg hover:bg-gold hover:text-coal transition-all duration-300"
                >
                    <span>📅 Agendar Pedido</span>
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1A1A1A] w-full max-w-sm rounded-2xl border border-white/10 p-6 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <h3 className="text-xl font-serif font-bold text-white mb-1">Nueva Reserva</h3>
                            <p className="text-sm text-gray-400 mb-6">Confirma disponibilidad vía WhatsApp</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 ml-1">Tu Nombre</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ej: Benjamin Tobar"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-600 focus:border-gold focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 ml-1">Para el día</label>
                                    <input
                                        type="date"
                                        value={date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold focus:outline-none transition-colors [color-scheme:dark]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 ml-1">Cantidad Estimada (Pizzas)</label>
                                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="flex-1 text-center font-bold text-xl text-white">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleReservation}
                                    className="w-full mt-2 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    Consultar por WhatsApp
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
