"use client";

import { useState } from "react";
import { OrderItem } from "../types/crm";
import { X, Plus, Trash2, Save, ShoppingBag } from "lucide-react";

interface AddManualOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newOrder: any) => Promise<void>;
}

export function AddManualOrderModal({ isOpen, onClose, onSave }: AddManualOrderModalProps) {
    const [customerName, setCustomerName] = useState("");
    const [deliveryMethod, setDeliveryMethod] = useState("pickup"); // pickup, delivery
    const [address, setAddress] = useState("");
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("transfer"); // transfer, cash, card, other
    const [items, setItems] = useState<OrderItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), name: "Pizza Custom", price: 0, quantity: 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSave = async () => {
        if (!customerName.trim()) {
            alert("El nombre del cliente es obligatorio");
            return;
        }
        if (items.length === 0) {
            alert("Debes agregar al menos un ítem");
            return;
        }

        setIsSaving(true);
        try {
            const newTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            const newOrder = {
                customer_name: customerName,
                items: items,
                total_amount: newTotal,
                notes: notes,
                delivery_method: deliveryMethod,
                address: deliveryMethod === 'delivery' ? address : '',
                payment_method: paymentMethod,
                created_at: new Date().toISOString(),
                status: 'pending' // Default status
            };

            await onSave(newOrder);

            // Result handling is up to parent, but we can reset form here if needed or let parent close/unmount
            onClose();
            // Reset form for next time? Ideally this component unmounts or we verify isOpen behavior.
            // Doing a basic reset just in case.
            setCustomerName("");
            setItems([]);
            setNotes("");
            setAddress("");
        } catch (error) {
            console.error("Failed to create order", error);
            alert("Error al crear el pedido");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold font-serif text-gold flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" /> Nuevo Pedido Manual
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-1">Nombre del Cliente *</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Ej: Juan Pérez"
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-1">Método de Pago</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors"
                            >
                                <option value="transfer">Transferencia</option>
                                <option value="cash">Efectivo</option>
                                <option value="debit">Débito/Crédito</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 space-y-4">
                        <h3 className="text-sm font-bold text-gold uppercase">Información de Entrega</h3>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="deliveryMethod"
                                    value="pickup"
                                    checked={deliveryMethod === 'pickup'}
                                    onChange={(e) => setDeliveryMethod(e.target.value)}
                                    className="accent-gold"
                                />
                                <span className="text-white text-sm">Retiro en Local</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="deliveryMethod"
                                    value="delivery"
                                    checked={deliveryMethod === 'delivery'}
                                    onChange={(e) => setDeliveryMethod(e.target.value)}
                                    className="accent-gold"
                                />
                                <span className="text-white text-sm">Delivery</span>
                            </label>
                        </div>

                        {deliveryMethod === 'delivery' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="block text-sm font-bold text-gray-400 mb-1">Dirección de Entrega</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Ej: Av. Principal 123, Depto 402"
                                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors"
                                />
                            </div>
                        )}
                    </div>

                    {/* Items */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-bold text-gray-400">Ítems del Pedido</label>
                            <button
                                onClick={handleAddItem}
                                className="flex items-center gap-1 text-sm text-gold hover:text-yellow-400 font-bold transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Agregar Ítem
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-2 items-start">
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                        className="w-16 p-3 bg-white/5 border border-white/10 rounded-xl text-center text-white focus:border-gold focus:outline-none"
                                        placeholder="Cant."
                                    />
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                        className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none"
                                        placeholder="Nombre del producto"
                                    />
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => handleItemChange(index, 'price', parseInt(e.target.value) || 0)}
                                            className="w-28 pl-6 p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none"
                                            placeholder="Precio"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleRemoveItem(index)}
                                        className="p-3 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-xl transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <p className="text-gray-500 text-sm italic text-center py-6 bg-white/5 rounded-xl border border-dashed border-white/10">
                                    No hay ítems en este pedido
                                </p>
                            )}
                        </div>
                        {items.length > 0 && (
                            <div className="flex justify-end pt-4 border-t border-white/5">
                                <div className="text-right">
                                    <span className="text-gray-400 text-sm block">Total Estimado</span>
                                    <span className="text-xl font-bold font-mono text-green-400">
                                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(items.reduce((acc, item) => acc + (item.price * item.quantity), 0))}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">Notas / Observaciones</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej: Sin cebolla, llamar al llegar..."
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl h-20 text-white placeholder:text-gray-600 focus:border-gold focus:outline-none resize-none transition-colors"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-[#111] flex justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-gray-400 font-bold hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 bg-gold text-coal font-bold rounded-xl hover:bg-yellow-500 disabled:opacity-50 transition-all shadow-lg active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? "Creando..." : "Crear Pedido"}
                    </button>
                </div>
            </div>
        </div>
    );
}
