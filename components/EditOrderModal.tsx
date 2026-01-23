"use client";

import { useState, useEffect } from "react";
import { Order, OrderItem } from "../types/crm";
import { X, Plus, Trash2, Save } from "lucide-react";

interface EditOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
    onSave: (updatedOrder: Order) => Promise<void>;
}

export function EditOrderModal({ isOpen, onClose, order, onSave }: EditOrderModalProps) {
    const [customerName, setCustomerName] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<OrderItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && order) {
            setCustomerName(order.customer_name);
            setNotes(order.notes || "");
            setItems(order.items || []);
        }
    }, [isOpen, order]);

    if (!isOpen || !order) return null;

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), name: "Nueva Pizza", price: 0, quantity: 1 }]);
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
        setIsSaving(true);
        try {
            // Recalculate total amount logic if needed, or trust the user edited inputs?
            // For now, let's just sum the items prices * quantity
            const newTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            const updatedOrder: Order = {
                ...order,
                customer_name: customerName,
                notes: notes,
                items: items,
                total_amount: newTotal
            };

            await onSave(updatedOrder);
            onClose();
        } catch (error) {
            console.error("Failed to save order", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold font-serif text-gold">Editar Pedido</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Customer Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">Nombre del Cliente</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">Notas / Observaciones</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej: Sin cebolla, llamar al llegar..."
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl h-24 text-white placeholder:text-gray-600 focus:border-gold focus:outline-none resize-none transition-colors"
                        />
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
                        className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 disabled:opacity-50 transition-all shadow-lg active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>
        </div>
    );
}
