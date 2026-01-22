"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { motion } from "framer-motion";

export default function AdminPage() {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [limit, setLimit] = useState(12);
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        if (pin !== "1234") {
            setMessage(" PIN incorrecto ❌");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase
                .from("daily_inventory")
                .upsert({ date, total_doughs: limit }, { onConflict: "date" });

            if (error) throw error;

            setMessage("¡Inventario actualizado! ✅");
        } catch (error) {
            console.error(error);
            setMessage("Error al actualizar ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-coal py-20 px-4 flex items-center justify-center">
            <div className="w-full max-w-md space-y-8 bg-[#1A1A1A] p-8 rounded-xl border border-white/5 shadow-2xl">
                <div>
                    <h1 className="text-3xl font-serif text-gold text-center">Admin Inventario</h1>
                    <p className="mt-2 text-center text-gray-400">Gestiona las masas diarias</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Fecha</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 text-white shadow-sm focus:border-gold focus:ring-gold sm:text-sm p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">Total Masas</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={limit}
                            onChange={(e) => setLimit(parseInt(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 text-white shadow-sm focus:border-gold focus:ring-gold sm:text-sm p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">PIN de Seguridad</label>
                        <input
                            type="password"
                            required
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="****"
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 text-white shadow-sm focus:border-gold focus:ring-gold sm:text-sm p-2"
                        />
                    </div>

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-md text-center text-sm font-bold ${message.includes("❌") ? "bg-red-900/50 text-red-200" : "bg-green-900/50 text-green-200"
                                }`}
                        >
                            {message}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gold hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </form>
            </div>
        </main>
    );
}
