"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { motion } from "framer-motion";
import { Lock, RefreshCw, Save, Pizza, Calculator } from "lucide-react";

export default function AdminPage() {
    const [pin, setPin] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);

    // Inventory State
    const [date, setDate] = useState(() => {
        // Init with local date
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().split('T')[0];
    });

    const [totalDoughs, setTotalDoughs] = useState<number>(0);
    const [soldPizzas, setSoldPizzas] = useState<number>(0);
    const [message, setMessage] = useState("");

    // --- Authentication ---
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === "1234") {
            setIsAuthenticated(true);
            fetchData();
        } else {
            setMessage("PIN Incorrecto ❌");
            setTimeout(() => setMessage(""), 2000);
        }
    };

    // --- Data Fetching & Subscription ---
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Get Inventory Limit
            const { data: invData, error: invError } = await supabase
                .from('daily_inventory')
                .select('total_doughs')
                .eq('date', date)
                .single();

            if (invData) {
                setTotalDoughs(invData.total_doughs);
            } else if (invError && invError.code === 'PGRST116') {
                // No entry for today, default to 0 or previous logic
                setTotalDoughs(0);
            }

            // 2. Get Sales Count
            // We need to sum total_pizzas from orders where status != 'cancelled' (if we had that)
            // For now just sum all today's orders.
            // Important: Range filter needs to respect day boundaries in UTC or assume local string storage? 
            // orders `created_at` is timestamptz.

            const startOfDay = new Date(`${date}T00:00:00`);
            const endOfDay = new Date(`${date}T23:59:59`);

            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('total_pizzas')
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString());

            if (ordersError) throw ordersError;

            const totalSold = ordersData?.reduce((acc, order) => acc + order.total_pizzas, 0) || 0;
            setSoldPizzas(totalSold);

        } catch (error) {
            console.error("Error fetching admin data:", error);
            setMessage("Error cargando datos ⚠️");
        } finally {
            setLoading(false);
        }
    };

    // Real-time Subscription
    useEffect(() => {
        if (!isAuthenticated) return;

        const channel = supabase
            .channel('admin-inventory-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => {
                    console.log("Order change detected, refreshing...");
                    fetchData();
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'daily_inventory' },
                () => {
                    console.log("Inventory change detected, refreshing...");
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isAuthenticated, date]); // Re-sub if date changes (though date select usually stays on today)

    // --- Actions ---
    const handleUpdateInventory = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase
                .from("daily_inventory")
                .upsert({ date, total_doughs: totalDoughs }, { onConflict: "date" });

            if (error) throw error;
            setMessage("Inventario actualizado ✅");
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            console.error(error);
            setMessage("Error al actualizar ❌");
        } finally {
            setLoading(false);
        }
    };

    const remaining = totalDoughs - soldPizzas;

    // --- Render: Login ---
    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-coal flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm bg-[#1A1A1A] p-8 rounded-2xl border border-white/5 shadow-2xl"
                >
                    <div className="flex justify-center mb-6">
                        <div className="bg-gold/10 p-4 rounded-full">
                            <Lock className="h-8 w-8 text-gold" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-serif text-center text-white mb-8">Admin Access</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Ingrese PIN"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-center text-xl tracking-widest text-white focus:border-gold focus:outline-none transition-colors"
                            autoFocus
                        />
                        {message && <p className="text-red-400 text-center text-sm font-bold animate-pulse">{message}</p>}
                        <button
                            type="submit"
                            className="w-full bg-gold text-coal font-bold p-4 rounded-xl hover:bg-yellow-500 transition-colors"
                        >
                            Ingresar
                        </button>
                    </form>
                </motion.div>
            </main>
        );
    }

    // --- Render: Dashboard ---
    return (
        <main className="min-h-screen bg-coal text-white p-4">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between pt-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-white">Panel de Control</h1>
                        <p className="text-gray-400 text-sm">Gestión de Stock en Tiempo Real</p>
                    </div>
                    <button
                        onClick={() => fetchData()}
                        className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <Pizza className="h-6 w-6 text-blue-400 mb-2" />
                        <span className="text-xs text-gray-500 uppercase font-bold">Vendidas</span>
                        <span className="text-3xl font-mono font-bold text-white">{soldPizzas}</span>
                    </div>
                    <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <Calculator className="h-6 w-6 text-gold mb-2" />
                        <span className="text-xs text-gray-500 uppercase font-bold">Total Masas</span>
                        <span className="text-3xl font-mono font-bold text-white">{totalDoughs}</span>
                    </div>
                    <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-colors ${remaining <= 0 ? 'bg-red-500/10 border-red-500/50' : 'bg-green-500/10 border-green-500/50'
                        }`}>
                        <span className={`text-xs uppercase font-bold mb-2 ${remaining <= 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {remaining <= 0 ? 'SOLD OUT' : 'Disponibles'}
                        </span>
                        <span className={`text-3xl font-mono font-bold ${remaining <= 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {Math.max(0, remaining)}
                        </span>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gold/10 p-2 rounded-lg">
                            <Save className="h-5 w-5 text-gold" />
                        </div>
                        <h2 className="text-xl font-bold">Ajustar Inventario</h2>
                    </div>

                    <form onSubmit={handleUpdateInventory} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400">Fecha Operativa</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-gold focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400">Límite Total de Masas</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        value={totalDoughs}
                                        onChange={(e) => setTotalDoughs(parseInt(e.target.value) || 0)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 pl-4 text-white font-mono text-lg focus:border-gold focus:outline-none transition-colors"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setTotalDoughs(d => Math.max(0, d - 1))}
                                            className="p-1 bg-white/10 hover:bg-white/20 rounded text-white"
                                        >
                                            -
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTotalDoughs(d => d + 1)}
                                            className="p-1 bg-white/10 hover:bg-white/20 rounded text-white"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Message */}
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl text-center font-bold ${message.includes("❌") || message.includes("⚠️")
                                    ? "bg-red-500/20 text-red-200 border border-red-500/30"
                                    : "bg-green-500/20 text-green-200 border border-green-500/30"
                                    }`}
                            >
                                {message}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gold text-coal font-bold p-4 rounded-xl hover:bg-yellow-500 transition-colors shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Actualizando Base de Datos..." : "Guardar Nuevo Límite"}
                        </button>
                    </form>

                    <p className="mt-6 text-xs text-center text-gray-500">
                        * Al cambiar el límite, el estado "Sold Out" se actualizará automáticamente en la página principal.
                    </p>
                </div>
            </div>
        </main>
    );
}
