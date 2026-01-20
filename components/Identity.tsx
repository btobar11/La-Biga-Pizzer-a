"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Identity() {
    return (
        <section className="bg-coal py-24 text-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center">

                    {/* Text Content - Left on Desktop */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="flex-1 lg:pl-12"
                    >
                        <h2 className="mb-6 font-serif text-4xl text-gold md:text-5xl font-bold">
                            La Biga: <br />
                            48 Horas de Paciencia
                        </h2>
                        <div className="mb-8 w-20 h-1 bg-terracotta" />
                        <p className="font-sans text-lg text-gray-text leading-relaxed">
                            No usamos atajos. Nuestra masa fermenta durante <span className="text-white font-bold">2 días</span> usando prefermento Biga,
                            logrando una pizza ligera, de fácil digestión y con el auténtico sabor italiano.
                            <br /><br />
                            Cada cornichione (borde) cuenta la historia de un proceso artesanal que respeta
                            el tiempo y la tradición.
                        </p>
                    </motion.div>

                    {/* Image Content - Right on Desktop */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="flex-1"
                    >
                        <div className="relative w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl">
                            <Image
                                src="/proceso-biga.png"
                                alt="Masa madre fermentando"
                                width={800}
                                height={1000}
                                className="h-auto w-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
