import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export type ShopStatus = "open" | "closed" | "opening-soon" | "closing-soon" | "sold-out";

// CONFIGURATION
const DEFAULT_MAX_PIZZAS = 12;

export function useShopStatus() {
    const [status, setStatus] = useState<ShopStatus>("closed");
    const [text, setText] = useState("");
    const [subText, setSubText] = useState("");
    const [color, setColor] = useState("bg-red-500");
    const [cta, setCta] = useState<{ text: string; link: string } | null>(null);
    const [pizzasSold, setPizzasSold] = useState(0);
    const [maxPizzas, setMaxPizzas] = useState(DEFAULT_MAX_PIZZAS);

    // Fetch Sales Count
    useEffect(() => {
        const fetchSales = async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data, error } = await supabase
                .from('orders')
                .select('total_pizzas')
                .gte('created_at', today.toISOString());

            if (data) {
                const total = data.reduce((acc, order) => acc + order.total_pizzas, 0);
                setPizzasSold(total);
            }

            // Fetch Daily Limit
            const { data: inventoryData } = await supabase
                .from('daily_inventory')
                .select('total_doughs')
                .eq('date', today.toISOString().split('T')[0])
                .single();

            if (inventoryData) {
                setMaxPizzas(inventoryData.total_doughs);
            }
        };

        fetchSales();
        // Subscribe to changes (Realtime)
        const channel = supabase
            .channel('orders')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
                const newOrder = payload.new as { total_pizzas: number };
                setPizzasSold((prev) => prev + newOrder.total_pizzas);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        const checkStatus = () => {
            const now = new Date();
            const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 4 = Thursday
            const hour = now.getHours();
            const minute = now.getMinutes();
            const time = hour + minute / 60;

            // Days: Thursday (4) to Sunday (0)
            const isOpenDay = day === 4 || day === 5 || day === 6 || day === 0;

            // Calculate "Nos vemos el..." for Sold Out or Closed context
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
                nextOpenDayStr = "Nos vemos el Jueves";
            }

            // PRIORITY 1: SOLD OUT (Check inventory first if it's an open day)
            if (isOpenDay && pizzasSold >= maxPizzas) {
                setStatus("sold-out");
                setText("Sold Out");
                setSubText(`¡Se acabaron! ${nextOpenDayStr}`);
                setColor("bg-purple-600");
                setCta({ text: "Ver Menú", link: "#menu" }); // Just scroll or empty
                return;
            }

            // Opening Soon: 18:00 - 19:00 on Open Days
            if (isOpenDay && time >= 18 && time < 19) {
                setStatus("opening-soon");
                setText("Abre pronto");
                setSubText("");
                setColor("bg-yellow-500");
                setCta({ text: "Ver Menú", link: "#menu" });
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
                setCta({ text: "Pide ya", link: "#menu" });
                return;
            }

            // Closed
            setStatus("closed");
            setText("Cerrado");
            setColor("bg-red-500");
            setCta(null);

            setSubText(nextOpenDayStr);
        };

        checkStatus();
        const interval = setInterval(checkStatus, 60000);
        return () => clearInterval(interval);
    }, [pizzasSold]);

    return { status, text, subText, color, cta, pizzasSold };
}
