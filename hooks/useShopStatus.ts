import { useState, useEffect } from "react";

export type ShopStatus = "open" | "closed" | "opening-soon" | "closing-soon";

export function useShopStatus() {
    const [status, setStatus] = useState<ShopStatus>("closed");
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

    return { status, text, subText, color, cta };
}
