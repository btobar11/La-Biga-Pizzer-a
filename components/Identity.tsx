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
                            Agradecimientos a <span className="text-gold font-bold">Gluten Morgen</span> por la excelente explicación del proceso.
                        </p>
                    </motion.div>

                    {/* Image Content - Right on Desktop */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="flex-1 flex justify-center"
                    >
                        <div className="relative w-full max-w-[350px] aspect-[9/16] overflow-hidden rounded-2xl shadow-2xl border border-white/10">
                            <iframe
                                className="w-full h-full"
                                src="https://www.youtube.com/embed/JmuByMUiPW4"
                                title="Explicación Biga por Gluten Morgen"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
