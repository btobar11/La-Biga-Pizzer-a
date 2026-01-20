import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function StatusBadge() {
    const [status, setStatus] = useState<"open" | "closed" | "opening-soon" | "closing-soon">("closed");
    const [text, setText] = useState("");
    const [subText, setSubText] = useState("");
    const [color, setColor] = useState("bg-red-500");
    const [cta, setCta] = useState<{ text: string; link: string } | null>(null);

    useEffect(() => {
        const checkStatus = () => {
            const now = new Date();
            const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 4 = Thursday
            const hour = now.getHours();
            const minute = now.getMinutes();
            const time = hour + minute / 60;

            const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
            const nextDay = (currentDay: number, targetDay: number) => {
                const diff = (targetDay - currentDay + 7) % 7;
                return diff === 0 ? 7 : diff;
            };

            // Days: Thursday (4) to Sunday (0)
            const isOpenDay = day === 4 || day === 5 || day === 6 || day === 0;

            // Opening Soon: 18:00 - 19:00 on Open Days
            if (isOpenDay && time >= 18 && time < 19) {
                setStatus("opening-soon");
                setText("Abre pronto");
                setSubText("");
                setColor("bg-yellow-500");
                setCta({ text: "Preordenar", link: "https://wa.me/56975255704?text=Hola,%20me%20gustaría%20preordenar%20una%20pizza" });
                return;
            }

            // Closing Soon: 22:30 - 23:00 on Open Days
            if (isOpenDay && time >= 22.5 && time < 23) {
                setStatus("closing-soon");
                setText("Cierra pronto");
                setSubText("Apresúrate, no te quedes sin tu pizza");
                setColor("bg-orange-500");
                setCta({ text: "Pide ahora", link: "https://wa.me/56975255704?text=Hola,%20me%20gustaría%20pedir%20antes%20de%20que%20cierren" });
                return;
            }

            // Open: 19:00 - 23:00 on Open Days
            if (isOpenDay && time >= 19 && time < 23) {
                setStatus("open");
                setText("Abierto ahora");
                setSubText("");
                setColor("bg-green-500");
                setCta({ text: "Pide ya", link: "https://wa.me/56975255704?text=Hola,%20quiero%20pedir%20una%20pizza" });
                return;
            }

            // Closed
            setStatus("closed");
            setText("Cerrado");
            setColor("bg-red-500");
            setCta(null);

            // Calculate "Nos vemos el..."
            let nextOpenDayStr = "";

            // If it's an open day but before 18:00
            if (isOpenDay && time < 18) {
                nextOpenDayStr = "Nos vemos hoy a las 19:00";
            }
            // If it's Closed (Mon, Tue, Wed)
            else if (day === 1 || day === 2 || day === 3) {
                nextOpenDayStr = "Nos vemos el Jueves";
            }
            // If it's Sunday after 23:00
            else if (day === 0 && time >= 23) {
                nextOpenDayStr = "Nos vemos el Jueves";
            }
            // If it's Thu, Fri, Sat after 23:00 -> Next day is open
            else if ((day === 4 || day === 5 || day === 6) && time >= 23) {
                nextOpenDayStr = "Nos vemos mañana";
            }
            else {
                // Fallback catch-all
                nextOpenDayStr = "Nos vemos el Jueves";
            }

            setSubText(nextOpenDayStr);
        };

        checkStatus();
        const interval = setInterval(checkStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center gap-2">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg"
            >
                <span className={`relative flex h-3 w-3`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`}></span>
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
