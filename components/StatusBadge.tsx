"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useShopStatus } from "../hooks/useShopStatus";

export default function StatusBadge() {
    const { status, text, subText, color, cta } = useShopStatus();

    const shadowColor = {
        "open": "shadow-green-500",
        "closed": "shadow-red-500",
        "opening-soon": "shadow-yellow-500",
        "closing-soon": "shadow-orange-500",
        "sold-out": "shadow-purple-500"
    }[status];

    return (
        <div className="flex flex-col items-center gap-2">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg"
            >
                <span className={`relative flex h-3 w-3`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${color} shadow-[0_0_12px_1px] ${shadowColor}`}></span>
                </span>
                <span className="text-sm font-bold text-white tracking-wide uppercase shadow-black drop-shadow-md">{text}</span>
            </motion.div>

            <AnimatePresence>
                {subText && status === "closed" && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/5"
                    >
                        <p className="text-xs text-white/90 font-medium italic">
                            &quot;La espera me desespera&quot; <br />
                            <span className="text-gold not-italic font-bold">{subText}</span>
                        </p>
                    </motion.div>
                )}

                {subText && status === "closing-soon" && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-orange-500/20 backdrop-blur-sm px-3 py-1 rounded-lg border border-orange-500/30"
                    >
                        <p className="text-xs text-orange-200 font-bold animate-pulse">
                            {subText}
                        </p>
                    </motion.div>
                )}

                {cta && (
                    <motion.a
                        href={cta.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm shadow-xl transition-all ${status === "opening-soon" ? "bg-yellow-500 text-black hover:bg-yellow-400" :
                            status === "closing-soon" ? "bg-orange-600 text-white hover:bg-orange-500" :
                                status === "sold-out" ? "bg-purple-600 text-white hover:bg-purple-500" :
                                    "bg-green-600 text-white hover:bg-green-500"
                            }`}
                    >
                        <MessageCircle className="h-4 w-4" />
                        {cta.text}
                    </motion.a>
                )}
            </AnimatePresence>
        </div>
    );
}
