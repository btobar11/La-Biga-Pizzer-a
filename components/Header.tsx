"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Instagram, MessageCircle } from "lucide-react";

export default function Header() {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute top-0 w-full z-50 px-4 py-6 md:px-6 md:py-8 pointer-events-none" // Header container shouldn't block clicks
        >
            {/* Social Icons - Corners - High Z-index & pointer-events-auto */}
            <div className="pointer-events-auto w-full flex justify-between px-2">
                <a
                    href="https://www.instagram.com/labigapizzeria.cl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-[60] text-white/90 hover:text-gold transition-colors p-2"
                    aria-label="Instagram"
                >
                    <Instagram className="h-8 w-8 md:h-10 md:w-10 drop-shadow-lg" />
                </a>

                <a
                    href="https://wa.me/56975255704"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-[60] text-white/90 hover:text-green-500 transition-colors p-2"
                    aria-label="WhatsApp"
                >
                    <MessageCircle className="h-8 w-8 md:h-10 md:w-10 drop-shadow-lg" />
                </a>
            </div>

            <div className="container mx-auto flex flex-col items-center justify-center gap-6 pointer-events-none relative -mt-10 md:-mt-14">

                <div className="relative flex items-center justify-center mt-2 md:mt-4 pointer-events-auto">
                    {/* Logo Container - Responsive Sizing */}
                    {/* Mobile: h-28 w-28 (112px), Desktop: h-64 w-64 (256px) */}
                    <div className="relative h-28 w-28 md:h-64 md:w-64 shrink-0 overflow-hidden rounded-full z-20">
                        <Image
                            src="/logo.png"
                            alt="La Biga Logo"
                            fill
                            className="object-cover scale-110 md:scale-125"
                            priority
                        />
                    </div>

                    {/* Curved Text SVG - Absolute centered & Responsive */}
                    {/* Mobile: 130px, Desktop: 340px */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130px] h-[130px] md:w-[340px] md:h-[340px] z-10 pointer-events-none">
                        <svg viewBox="0 0 340 340" className="w-full h-full">
                            <path
                                id="curve"
                                d="M 36,170 A 134,134 0 0,0 304,170"
                                fill="transparent"
                            />
                            <text className="font-serif font-bold fill-gold tracking-widest uppercase drop-shadow-md">
                                <textPath xlinkHref="#curve" startOffset="50%" textAnchor="middle" style={{ fontSize: '15px' }}>
                                    Il segreto è nell&apos;impasto
                                </textPath>
                            </text>
                        </svg>
                    </div>

                    {/* Flags - Absolute positioned below logo */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                        <span className="text-xl md:text-2xl filter drop-shadow-md hover:scale-110 transition-transform cursor-default" title="Italia">🇮🇹</span>
                        <span className="text-xl md:text-2xl filter drop-shadow-md hover:scale-110 transition-transform cursor-default" title="Chile">🇨🇱</span>
                    </div>



                </div>

            </div>
        </motion.header>
    );
}
