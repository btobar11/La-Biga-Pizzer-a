"use client";

import { useState, useEffect } from "react";
import { OrderItem, CustomerProfile } from "../types/crm";
import { X, Plus, Trash2, Save, ShoppingBag, UserPlus, Search } from "lucide-react";

// Predefined Pizzas
const MENU_ITEMS = [
    { id: "margarita", name: "Margherita Verace", price: 8990 },
    { id: "bomba", name: "Bomba all'aglio", price: 7990 },
    { id: "diavola", name: "Diavola", price: 10990 },
    { id: "prosciutto", name: "Prosciutto e Rucola", price: 11990 },
    { id: "custom_pizza", name: "Pizza Personalizada / Otra", price: 0 },
];

interface AddManualOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveOrder: (newOrder: any) => Promise<void>;
    onSaveCustomer: (newCustomer: any) => Promise<void>;
    existingCustomers: CustomerProfile[];
}

export function AddManualOrderModal({ isOpen, onClose, onSaveOrder, onSaveCustomer, existingCustomers }: AddManualOrderModalProps) {
    const [mode, setMode] = useState<'order' | 'customer'>('order'); // 'order' or 'customer'
    const [isSaving, setIsSaving] = useState(false);

    // Common Customer Fields
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [address, setAddress] = useState("");
    const [notes, setNotes] = useState("");

    // Order Specific
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [deliveryMethod, setDeliveryMethod] = useState("pickup");
    const [paymentMethod, setPaymentMethod] = useState("transfer");
    const [items, setItems] = useState<OrderItem[]>([]);

    // Search State
    const [searchTerm, setSearchTerm] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Reset form when opening/closing or switching modes (optional)
    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setAddress("");
        setNotes("");
        setItems([]);
        setSelectedCustomerId(null);
        setSearchTerm("");
        setMode('order');
    };

    const handleSelectCustomer = (customer: CustomerProfile) => {
        setSelectedCustomerId(customer.id);
        setCustomerName(customer.name);
        setCustomerPhone(customer.phone?.replace('+56', '') || "");
        setCustomerEmail(customer.email || "");
        setAddress(customer.address || "");
        setSearchTerm(""); // Clear search
        setShowSuggestions(false);
    };

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), name: MENU_ITEMS[0].name, price: MENU_ITEMS[0].price, quantity: 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
        const newItems = [...items];
        if (field === 'name') {
            const selectedPizza = MENU_ITEMS.find(p => p.name === value);
            if (selectedPizza) {
                newItems[index].price = selectedPizza.id !== 'custom_pizza' ? selectedPizza.price : 0;
            }
        }
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSave = async () => {
        if (!customerName.trim()) {
            alert("El nombre del cliente es obligatorio");
            return;
        }

        if (customerPhone && customerPhone.length !== 9) {
            alert("El teléfono debe tener 9 dígitos (9xxxxxxxx)");
            return;
        }

        setIsSaving(true);
        try {
            if (mode === 'customer') {
                // Register Customer Only
                const newCustomer = {
                    name: customerName,
                    phone: customerPhone ? `+56${customerPhone}` : null,
                    email: customerEmail,
                    address: address,
                    notes: notes,
                    total_spent: 0,
                    total_orders: 0
                };
                await onSaveCustomer(newCustomer);
            } else {
                // Create Order
                if (items.length === 0) {
                    alert("Debes agregar al menos un ítem para crear un pedido");
                    setIsSaving(false);
                    return;
                }

                const newTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                const totalPizzas = items.reduce((acc, item) => acc + item.quantity, 0);

                const newOrder = {
                    customer_id: selectedCustomerId, // Can be null if it's a "guest" or new implicit customer (though logic prefers explicit now)
                    customer_name: customerName,
                    items: items,
                    total_amount: newTotal,
                    total_pizzas: totalPizzas,
                    notes: notes,
                    delivery_method: deliveryMethod,
                    address: deliveryMethod === 'delivery' ? address : '',
                    payment_method: paymentMethod,
                    created_at: new Date().toISOString(),
                    status: 'pending',
                    customer_phone: customerPhone ? `+56${customerPhone}` : null,
                    customer_email: customerEmail
                };
                await onSaveOrder(newOrder);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save", error);
            alert(`Error: ${(error as any).message || "Desconocido"}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const filteredCustomers = existingCustomers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm))
    ).slice(0, 5);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10">

                {/* Header with Tabs */}
                <div className="border-b border-white/10">
                    <div className="flex items-center justify-between p-6 pb-4">
                        <h2 className="text-xl font-bold font-serif text-gold flex items-center gap-2">
                            {mode === 'order' ? <ShoppingBag className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                            {mode === 'order' ? 'Nuevo Pedido' : 'Registrar Cliente'}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex px-6 gap-4">
                        <button
                            onClick={() => setMode('order')}
                            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${mode === 'order' ? 'border-gold text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                            Crear Pedido
                        </button>
                        <button
                            onClick={() => setMode('customer')}
                            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${mode === 'customer' ? 'border-gold text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                            Solo Registrar Cliente
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">

                    {/* Mode: New Order - Search Customer */}
                    {mode === 'order' && (
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-400 mb-1">Buscar Cliente Existente (Opcional)</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onFocus={() => setShowSuggestions(true)}
                                    // onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delayed close
                                    onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                                    placeholder="Nombre o Teléfono..."
                                    className="w-full pl-10 p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && searchTerm.length > 1 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-[#222] border border-white/10 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                                    {filteredCustomers.length > 0 ? (
                                        filteredCustomers.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => { handleSelectCustomer(c); }}
                                                className="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex justify-between items-center"
                                            >
                                                <div>
                                                    <div className="text-white font-bold">{c.name}</div>
                                                    <div className="text-xs text-gray-400">{c.phone}</div>
                                                </div>
                                                <span className="text-xs bg-gold/10 text-gold px-2 py-1 rounded">Seleccionar</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-3 text-gray-500 text-sm italic">No se encontraron clientes</div>
                                    )}
                                </div>
                            )}
                            {selectedCustomerId && (
                                <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                                    ✓ Cliente vinculado: <b>{customerName}</b>
                                    <button onClick={() => { setSelectedCustomerId(null); setCustomerName(""); resetForm(); }} className="text-red-400 hover:underline ml-2">(Desvincular)</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Customer Info Form */}
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

                        {mode === 'order' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-1">Método de Pago</label>
                                <div className="relative">
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors appearance-none"
                                    >
                                        <option value="transfer" className="bg-[#1A1A1A] text-white">Transferencia</option>
                                        <option value="cash" className="bg-[#1A1A1A] text-white">Efectivo</option>
                                        <option value="debit" className="bg-[#1A1A1A] text-white">Débito/Crédito</option>
                                        <option value="other" className="bg-[#1A1A1A] text-white">Otro</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-1">Teléfono</label>
                            <div className="flex gap-2">
                                <div className="flex items-center justify-center bg-white/5 border border-white/10 rounded-xl px-3 text-gold font-bold select-none text-sm">+56</div>
                                <input
                                    type="tel"
                                    value={customerPhone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                                        setCustomerPhone(val);
                                    }}
                                    placeholder="9 1234 5678"
                                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors tracking-widest"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-1">Email</label>
                            <input
                                type="email"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                placeholder="cliente@email.com"
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Delivery & Address (Always show address input if needed) */}
                    {(mode === 'customer' || (mode === 'order' && deliveryMethod === 'delivery')) && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                            {mode === 'order' && (
                                <div className="flex gap-4 mb-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="deliveryMethod" value="pickup" checked={deliveryMethod === 'pickup'} onChange={(e) => setDeliveryMethod(e.target.value)} className="accent-gold h-4 w-4" />
                                        <span className="text-white text-sm">Retiro en Local</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="deliveryMethod" value="delivery" checked={deliveryMethod === 'delivery'} onChange={(e) => setDeliveryMethod(e.target.value)} className="accent-gold h-4 w-4" />
                                        <span className="text-white text-sm">Delivery</span>
                                    </label>
                                </div>
                            )}

                            <label className="block text-sm font-bold text-gray-400 mb-1">Dirección {mode === 'order' ? 'de Entrega' : 'del Cliente'}</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Ej: Av. Principal 123, Depto 402"
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors"
                            // If mode is 'order' and pickup, disable? No, maybe they want to record it.
                            />
                        </div>
                    )}

                    {/* Pickup toggle for Order mode if not showing above logic */}
                    {mode === 'order' && deliveryMethod === 'pickup' && (
                        <div className="flex gap-4 mb-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="deliveryMethod" value="pickup" checked={deliveryMethod === 'pickup'} onChange={(e) => setDeliveryMethod(e.target.value)} className="accent-gold h-4 w-4" />
                                <span className="text-white text-sm">Retiro</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="deliveryMethod" value="delivery" checked={false} onChange={(e) => setDeliveryMethod(e.target.value)} className="accent-gold h-4 w-4" />
                                <span className="text-gray-400 text-sm hover:text-white">Delivery</span>
                            </label>
                        </div>
                    )}


                    {/* Items Section - Only for New Order */}
                    {mode === 'order' && (
                        <div className="pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-bold text-gray-400">Ítems del Pedido</label>
                                <button onClick={handleAddItem} className="flex items-center gap-1 text-sm text-gold hover:text-yellow-400 font-bold transition-colors">
                                    <Plus className="w-4 h-4" /> Agregar Ítem
                                </button>
                            </div>

                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-start flex-wrap md:flex-nowrap bg-white/[0.02] p-2 rounded-xl">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                            className="w-16 p-3 bg-white/5 border border-white/10 rounded-xl text-center text-white focus:border-gold focus:outline-none"
                                            placeholder="Qty"
                                        />

                                        <div className="flex-1 min-w-[150px] relative">
                                            <select
                                                value={MENU_ITEMS.some(p => p.name === item.name) ? item.name : "Pizza Personalizada / Otra"}
                                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors appearance-none"
                                            >
                                                {MENU_ITEMS.map((menuItem) => (
                                                    <option key={menuItem.id} value={menuItem.name} className="bg-[#1A1A1A] text-white">
                                                        {menuItem.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                                        </div>

                                        {(item.name === "Pizza Personalizada / Otra" || !MENU_ITEMS.some(p => p.name === item.name)) && (
                                            <input
                                                type="text"
                                                value={item.name === "Pizza Personalizada / Otra" ? "" : item.name}
                                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                placeholder="Detalle personalización"
                                                className="flex-1 min-w-[150px] p-3 bg-white/5 border border-gold/30 rounded-xl text-white focus:border-gold focus:outline-none"
                                            />
                                        )}

                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => handleItemChange(index, 'price', parseInt(e.target.value) || 0)}
                                            className="w-28 p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none"
                                            placeholder="Precio"
                                        />
                                        <button onClick={() => handleRemoveItem(index)} className="p-3 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-xl transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
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
                        </div>
                    )}

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
                    <button onClick={onClose} className="px-6 py-3 text-gray-400 font-bold hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 bg-gold text-coal font-bold rounded-xl hover:bg-yellow-500 disabled:opacity-50 transition-all shadow-lg active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? "Guardando..." : (mode === 'order' ? "Crear Pedido" : "Registrar Cliente")}
                    </button>
                </div>
            </div>
        </div>
    );
}
