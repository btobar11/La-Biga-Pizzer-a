"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function Hero() {
    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop"
                    alt="Pizza Napolitana Dark"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-coal/70" /> {/* Dark overlay */}
            </div>

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center pt-20 md:pt-0">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center"
                >
                    <h1 className="mb-2 font-serif text-6xl font-bold tracking-widest text-gold md:text-8xl">
                        LA BIGA
                    </h1>
                    <div className="mb-6 h-1 w-24 bg-terracotta" />

                    <h2 className="mb-8 font-serif text-xl text-gray-200 md:text-3xl italic">
                        Pizza Napolitana Contemporánea <br /> en Constitución
                    </h2>
                </motion.div>

                <motion.button
                    onClick={() => {
                        const menuSection = document.getElementById('menu');
                        if (menuSection) {
                            menuSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="group flex items-center gap-2 rounded-full bg-terracotta px-8 py-4 font-sans text-lg font-bold text-white shadow-lg transition-all hover:bg-terracotta/90 hover:scale-105 cursor-pointer"
                >
                    Pedir por WhatsApp
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </motion.button>

                <div className="mt-8">
                    <StatusBadge />
                </div>
            </div>
        </section>
    );
}
