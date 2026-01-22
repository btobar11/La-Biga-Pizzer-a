"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { MessageCircle, ShoppingBag, X, Copy, Check, Truck, Store, CreditCard, Banknote, Trash2, Plus, Minus, MapPin } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useShopStatus } from "../hooks/useShopStatus";

const BANK_DETAILS = `Benjamin Tobar
21.233.326-3
Banco de Chile
Cuenta Vista
00-001-16212-99
benja11tobar@gmail.com`;

const LOCATION_URL = "https://maps.app.goo.gl/ParQEsGrMyRg6E5CA?g_st=ic";

export default function CartButton() {
    const { cart, total, addToCart, removeFromCart, decreaseQuantity, clearCart } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
    const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash'>('transfer');
    const [address, setAddress] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [copied, setCopied] = useState(false);
    const { status } = useShopStatus();

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const deliveryFee = deliveryMethod === 'delivery' ? 2000 : 0;
    const finalTotal = total + deliveryFee;

    const handleCopy = () => {
        navigator.clipboard.writeText(BANK_DETAILS);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsAppRedirect = async () => {
        if (status === "closed" || status === "sold-out") {
            const msg = status === "sold-out"
                ? "¡Lo sentimos! Hoy vendimos todas las pizzas. Vuelve mañana."
                : "El local se encuentra cerrado. Puedes ver el total, pero no estamos recibiendo pedidos en este momento.";
            alert(msg);
            return;
        }
        if (cart.length === 0) return;

        if (!customerName.trim()) {
            alert("Por favor ingresa tu nombre.");
            return;
        }

        if (deliveryMethod === 'delivery' && !address.trim()) {
            alert("Por favor ingresa tu dirección de envío.");
            return;
        }

        // SAVE ORDER TO DATABASE
        const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0) + (deliveryMethod === 'delivery' ? 2000 : 0);
        const totalPizzas = cart.reduce((acc, item) => acc + item.quantity, 0);

        const { error } = await supabase.from('orders').insert({
            customer_name: customerName,
            items: cart,
            total_pizzas: totalPizzas,
            total_amount: totalAmount,
            delivery_method: deliveryMethod,
            address: deliveryMethod === 'delivery' ? address : null,
            status: 'pending'
        });

        if (error) {
            console.error("Error saving order:", error);
            alert("Hubo un error al procesar el pedido. Por favor intenta de nuevo.");
            return;
        }

        const itemsList = cart
            .map((item) => `- ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toLocaleString("es-CL")})`)
            .join("%0A");

        const methodText = deliveryMethod === 'delivery' ? 'Delivery (+ $2.000)' : 'Retiro en Local';
        const addressText = deliveryMethod === 'delivery' ? `%0A*Dirección:* ${address}` : '';
        const paymentText = paymentMethod === 'transfer' ? 'Transferencia' : 'Efectivo / Tarjeta';

        // Estructura del mensaje
        const message = `Hola La Biga! 🍕 Soy *${customerName}* y quiero confirmar mi pedido:%0A%0A*Detalle:*%0A${itemsList}%0A%0A*Entrega:* ${methodText}${addressText}%0A*Pago:* ${paymentText}%0A%0A*Total a Pagar:* $${finalTotal.toLocaleString("es-CL")}%0A%0A${paymentMethod === 'transfer' ? '(Adjuntaré comprobante de transferencia)' : ''}`;

        window.open(`https://wa.me/56975255704?text=${message}`, "_blank");
    };

    return (
        <>
            <AnimatePresence>
                {totalItems > 0 && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-terracotta px-6 py-4 shadow-2xl transition-all hover:scale-105 active:scale-95 text-white"
                        onClick={() => setIsOpen(true)}
                    >
                        <div className="relative">
                            <ShoppingBag className="h-6 w-6" />
                            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-coal border border-coal">
                                {totalItems}
                            </span>
                        </div>
                        <span className="font-sans font-bold hidden md:inline">
                            Ver Pedido (${total.toLocaleString("es-CL")})
                        </span>
                        <span className="font-sans font-bold md:hidden">
                            ${total.toLocaleString("es-CL")}
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Checkout Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            className="w-full max-w-md overflow-hidden rounded-2xl bg-[#1A1A1A] border border-white/10 shadow-2xl"
                        >
                            {/* Header Modal */}
                            <div className="flex items-center justify-between border-b border-white/10 p-4 bg-coal">
                                <h3 className="font-serif text-xl font-bold text-gold">Finalizar Pedido</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

                                {/* 0. Customer Name */}
                                <div className="space-y-3">
                                    <h4 className="font-sans text-sm font-bold text-gray-400 uppercase tracking-wider">Tu Nombre / Crm</h4>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Ej: Juan Pérez"
                                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                                    />
                                </div>

                                {/* 1. Item Summary (Editable) */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-sans text-sm font-bold text-gray-400 uppercase tracking-wider">Tu Pedido</h4>
                                        <button
                                            onClick={() => {
                                                if (confirm('¿Estás seguro de que quieres cancelar y borrar el pedido?')) {
                                                    clearCart();
                                                    setIsOpen(false);
                                                }
                                            }}
                                            className="text-xs text-red-400 hover:text-red-300 underline"
                                        >
                                            Cancelar Pedido
                                        </button>
                                    </div>
                                    <ul className="space-y-3">
                                        {cart.map((item) => (
                                            <li key={item.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm text-white">{item.name}</p>
                                                    <p className="text-xs text-gold">${item.price.toLocaleString("es-CL")}</p>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1">
                                                        <button
                                                            onClick={() => decreaseQuantity(item.id)}
                                                            className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => addToCart({ ...item })}
                                                            className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-red-400/50 hover:text-red-400 p-1"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* 2. Delivery Method & Address */}
                                <div className="space-y-3">
                                    <h4 className="font-sans text-sm font-bold text-gray-400 uppercase tracking-wider">Método de Entrega</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setDeliveryMethod('pickup')}
                                            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${deliveryMethod === 'pickup'
                                                ? 'border-gold bg-gold/10 text-gold'
                                                : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <Store className="h-6 w-6" />
                                            <span className="font-bold text-sm">Retiro Local</span>
                                        </button>
                                        <button
                                            onClick={() => setDeliveryMethod('delivery')}
                                            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${deliveryMethod === 'delivery'
                                                ? 'border-gold bg-gold/10 text-gold'
                                                : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <Truck className="h-6 w-6" />
                                            <div className="text-center">
                                                <span className="block font-bold text-sm">Delivery</span>
                                                <span className="text-xs opacity-70">+$2.000</span>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Dynamic content based on selection */}
                                    <AnimatePresence mode="wait">
                                        {deliveryMethod === 'delivery' ? (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="pt-2"
                                            >
                                                <label className="block text-xs font-bold text-white/70 mb-1 ml-1">Dirección de Envío:</label>
                                                <input
                                                    type="text"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    placeholder="Ej: Av. Principal 123, Depto 402..."
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                                                />
                                                <p className="text-xs text-yellow-500/80 mt-2 ml-1">
                                                    * Tiempo estimado sujeto a disponibilidad.
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="pt-2"
                                            >
                                                <a
                                                    href={LOCATION_URL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 w-full bg-white/5 border border-white/10 rounded-lg p-3 text-gold hover:bg-white/10 transition-colors"
                                                >
                                                    <MapPin className="h-4 w-4" />
                                                    <span className="text-sm font-bold">Ver Ubicación en Mapa</span>
                                                </a>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* 3. Payment Method */}
                                <div className="space-y-3">
                                    <h4 className="font-sans text-sm font-bold text-gray-400 uppercase tracking-wider">Forma de Pago</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setPaymentMethod('transfer')}
                                            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${paymentMethod === 'transfer'
                                                ? 'border-gold bg-gold/10 text-gold'
                                                : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <CreditCard className="h-6 w-6" />
                                            <span className="font-bold text-sm">Transferencia</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('cash')}
                                            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${paymentMethod === 'cash'
                                                ? 'border-gold bg-gold/10 text-gold'
                                                : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <Banknote className="h-6 w-6" />
                                            <span className="font-bold text-sm">Efec. / Tarjeta</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Bank Details Box (Only if Transfer) */}
                                <AnimatePresence>
                                    {paymentMethod === 'transfer' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-xs font-bold text-gray-400 uppercase">Datos de Transferencia</span>
                                                    <button
                                                        onClick={handleCopy}
                                                        className="flex items-center gap-1 text-xs text-gold hover:text-white transition-colors"
                                                    >
                                                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                                        {copied ? "Copiado!" : "Copiar"}
                                                    </button>
                                                </div>
                                                <pre className="font-mono text-xs text-white/80 whitespace-pre-wrap leading-relaxed select-all">
                                                    {BANK_DETAILS}
                                                </pre>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Total & Action */}
                                <div className="pt-4 border-t border-white/10">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg font-serif font-bold text-white">Total a Pagar</span>
                                        <span className="text-2xl font-serif font-bold text-gold">${finalTotal.toLocaleString("es-CL")}</span>
                                    </div>
                                    <button
                                        onClick={handleWhatsAppRedirect}
                                        disabled={status === "closed" || status === "sold-out"}
                                        className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-white shadow-lg transition-transform active:scale-95 ${status === "closed" || status === "sold-out"
                                            ? "bg-gray-600 cursor-not-allowed opacity-50"
                                            : "bg-green-600 hover:bg-green-500"
                                            }`}
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        {status === "sold-out" ? "Sold Out" : status === "closed" ? "Local Cerrado" : "Enviar Pedido a WhatsApp"}
                                    </button>
                                </div>

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
