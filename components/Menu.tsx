"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Plus } from "lucide-react";
import { useCart } from "../context/CartContext";

const pizzas = [
    {
        id: "margarita",
        name: "Margherita Verace",
        description: "Pomodoro San Marzano, Fior di Latte, Albahaca, Aceite de Oliva.",
        price: 8990,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: "bomba",
        name: "Bomba all'aglio",
        description: "Base cremosa especial (ajo confitado, quesos suaves, parmesano y un toque de mantequilla), terminada con Fior di Latte, lluvia de cebollín fresco y orégano.",
        price: 9990,
        image: "/bomba-allaglio.png"
    },
    {
        id: "diavola",
        name: "Diavola",
        description: "Intensa base de Pomodoro y Mozzarella, cubierta con Salame picante y terminada con el frescor de hojas de albahaca.",
        price: 10990,
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: "prosciutto",
        name: "Prosciutto e Rucola",
        description: "Fior di Latte, Prosciutto Crudo, Rúcula fresca, Parmigiano Reggiano.",
        price: 11990,
        image: "/prosciutto-rucola.png"
    },
];

export default function Menu() {
    const { addToCart } = useCart();

    return (
        <section className="bg-coal py-20" id="menu">
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2 className="font-serif text-4xl font-bold text-gold">
                        Nuestra Colección
                    </h2>
                    <div className="mx-auto mt-4 h-0.5 w-16 bg-gray-700" />
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
                    {pizzas.map((pizza, index) => (
                        <motion.div
                            key={pizza.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative flex flex-col md:flex-row gap-6 overflow-hidden rounded-xl bg-[#1A1A1A] border border-white/5 p-4 transition-colors hover:border-gold/30 hover:bg-[#202020]"
                        >
                            {/* Image */}
                            <div className="relative aspect-square w-full md:w-48 shrink-0 overflow-hidden rounded-lg shadow-lg">
                                <Image
                                    src={pizza.image}
                                    alt={pizza.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex flex-1 flex-col justify-between">
                                <div>
                                    <h3 className="mb-2 font-serif text-2xl font-bold text-white group-hover:text-gold transition-colors">
                                        {pizza.name}
                                    </h3>
                                    <p className="mb-4 font-sans text-sm text-gray-text">
                                        {pizza.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="font-serif text-xl font-bold text-gold">
                                        ${pizza.price.toLocaleString("es-CL")}
                                    </span>
                                    <button
                                        onClick={() => addToCart(pizza)}
                                        className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-terracotta active:scale-95"
                                    >
                                        Agregar
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
