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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold">Editar Pedido</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Customer Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Observaciones</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej: Sin cebolla, llamar al llegar..."
                            className="w-full p-2 border rounded-lg h-24 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                        />
                    </div>

                    {/* Items */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Ítems</label>
                            <button
                                onClick={handleAddItem}
                                className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
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
                                        className="w-16 p-2 border rounded-lg"
                                        placeholder="Cant."
                                    />
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                        className="flex-1 p-2 border rounded-lg"
                                        placeholder="Nombre del producto"
                                    />
                                    <div className="relative">
                                        <span className="absolute left-2 top-2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => handleItemChange(index, 'price', parseInt(e.target.value) || 0)}
                                            className="w-24 pl-6 p-2 border rounded-lg"
                                            placeholder="Precio"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleRemoveItem(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <p className="text-gray-400 text-sm italic text-center py-4 bg-gray-50 rounded-lg">
                                    No hay ítems en este pedido
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-500 disabled:opacity-50 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>
        </div>
    );
}
