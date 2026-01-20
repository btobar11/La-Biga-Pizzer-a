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
            className="absolute top-0 w-full z-50 px-6 py-8"
        >
            {/* Social Icons - Corners */}
            <a
                href="https://instagram.com/labigapizza.cl"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute left-6 top-10 z-50 text-white/80 hover:text-gold transition-colors md:left-12 md:top-14"
            >
                <Instagram className="h-8 w-8 md:h-10 md:w-10" />
            </a>

            <a
                href="https://wa.me/56975255704"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-6 top-10 z-50 text-white/80 hover:text-green-500 transition-colors md:right-12 md:top-14"
            >
                <MessageCircle className="h-8 w-8 md:h-10 md:w-10" />
            </a>

            <div className="container mx-auto flex flex-col items-center justify-center gap-6">

                <div className="relative flex items-center justify-center mt-4">
                    {/* Logo Container - Increased to h-64 (256px) */}
                    <div className="relative h-64 w-64 shrink-0 overflow-hidden rounded-full shadow-2xl z-20">
                        <Image
                            src="/logo.png"
                            alt="La Biga Logo"
                            fill
                            className="object-cover scale-125"
                        />
                    </div>

                    {/* Curved Text SVG - Absolute centered */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] z-10 pointer-events-none">
                        <svg viewBox="0 0 340 340" className="w-full h-full">
                            {/* 
                  New Math:
                  Logo Radius = 128px (256/2).
                  Target Text Radius = 132px (Very tight gap of 4px) to 135px.
                  Let's use Radius 134px.
                  
                  ViewBox 340x340 -> Center 170,170.
                  Start X = 170 - 134 = 36.
                  End X = 170 + 134 = 304.
                  Arc: M 36,170 A 134,134 0 0,0 304,170.
                */}
                            <path
                                id="curve"
                                d="M 36,170 A 134,134 0 0,0 304,170"
                                fill="transparent"
                            />
                            <text className="font-serif font-bold fill-gold tracking-widest uppercase" style={{ fontSize: '15px' }}>
                                <textPath xlinkHref="#curve" startOffset="50%" textAnchor="middle">
                                    Il segreto è nell&apos;impasto
                                </textPath>
                            </text>
                        </svg>
                    </div>

                </div>

            </div>
        </motion.header>
    );
}
