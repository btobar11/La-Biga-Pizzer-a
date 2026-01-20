"use client";

import { MapPin, Clock, Instagram } from "lucide-react";

export default function Contact() {
    return (
        <section className="bg-coal py-20 text-wheat border-t border-white/10" id="contacto">
            <div className="container mx-auto px-4 text-center">
                <h2 className="mb-12 font-serif text-4xl font-bold">Encuéntranos</h2>

                <div className="grid gap-8 md:grid-cols-3">
                    <div className="flex flex-col items-center">
                        <MapPin className="mb-4 h-8 w-8 text-pomodoro" />
                        <h3 className="mb-2 font-serif text-xl font-bold">Dirección</h3>
                        <p className="font-sans text-gray-400">
                            Constitución, Chile<br />
                            (Zona de Reparto Exclusiva)
                        </p>
                    </div>

                    <div className="flex flex-col items-center">
                        <Clock className="mb-4 h-8 w-8 text-pomodoro" />
                        <h3 className="mb-2 font-serif text-xl font-bold">Horarios</h3>
                        <p className="font-sans text-gray-400">
                            Jueves a Domingo<br />
                            19:00 - 23:00 hrs
                        </p>
                    </div>

                    <div className="flex flex-col items-center">
                        <Instagram className="mb-4 h-8 w-8 text-pomodoro" />
                        <h3 className="mb-2 font-serif text-xl font-bold">Síguenos</h3>
                        <a
                            href="https://instagram.com/labigapizza"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-sans text-gray-400 hover:text-wheat hover:underline"
                        >
                            @labigapizza
                        </a>
                    </div>
                </div>

                <footer className="mt-20 text-sm text-gray-600">
                    © {new Date().getFullYear()} La Biga Pizzeria. Todos los derechos reservados.
                </footer>
            </div>
        </section>
    );
}
