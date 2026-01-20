"use client";

import { motion } from "framer-motion";
import { Wheat, Clock, Feather } from "lucide-react";

const features = [
    {
        icon: <Wheat className="h-8 w-8 text-coal" />,
        title: "Harina Italiana",
        description: "Importada directamente para garantizar la autenticidad.",
    },
    {
        icon: <Clock className="h-8 w-8 text-coal" />,
        title: "48hrs de Fermentación",
        description: "El tiempo es nuestro ingrediente secreto.",
    },
    {
        icon: <Feather className="h-8 w-8 text-coal" />,
        title: "Masa Ligera",
        description: "Diseñada para comerse entera sin sentir pesadez.",
    },
];

export default function Science() {
    return (
        <section className="bg-wheat py-20 text-coal">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 font-serif text-4xl font-bold">La Ciencia de la Biga</h2>
                    <p className="mx-auto max-w-2xl font-sans text-lg">
                        No es comida rápida, es arte lento. Utilizamos un prefermento llamado "Biga"
                        que madura lentamente para transformar los carbohidratos complejos en simples.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-wheat border-2 border-coal">
                                {feature.icon}
                            </div>
                            <h3 className="mb-2 font-serif text-xl font-bold">{feature.title}</h3>
                            <p className="font-sans">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
