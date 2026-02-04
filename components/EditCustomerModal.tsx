"use client";

import { useState, useEffect } from "react";
import { CustomerProfile } from "../types/crm";
import { X, Save, User } from "lucide-react";

interface EditCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: CustomerProfile | null;
    onSave: (updatedCustomer: CustomerProfile) => Promise<void>;
}

export function EditCustomerModal({ isOpen, onClose, customer, onSave }: EditCustomerModalProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (customer) {
            setName(customer.name || "");
            setPhone(customer.phone?.replace('+56', '') || ""); // Strip prefix for input
            setEmail(customer.email || "");
            setAddress(customer.address || "");
            setNotes(customer.notes || "");
        }
    }, [customer]);

    if (!isOpen || !customer) return null;

    const handleSave = async () => {
        if (!name.trim()) {
            alert("El nombre es obligatorio");
            return;
        }

        setIsSaving(true);
        try {
            const updatedCustomer: CustomerProfile = {
                ...customer,
                name,
                phone: phone ? `+56${phone.replace(/\D/g, '')}` : undefined,
                email,
                address,
                notes
            };
            await onSave(updatedCustomer);
            onClose();
        } catch (error) {
            console.error("Error saving customer:", error);
            alert("Error al actualizar el cliente");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-md border border-white/10">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold font-serif text-gold flex items-center gap-2">
                        <User className="w-5 h-5" /> Editar Cliente
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">Nombre *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">Teléfono</label>
                        <div className="flex gap-2">
                            <div className="flex items-center justify-center bg-white/5 border border-white/10 rounded-xl px-3 text-gold font-bold select-none text-sm">+56</div>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                placeholder="9 1234 5678"
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors tracking-widest"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">Dirección Principal</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">Notas</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl h-24 text-white resize-none focus:border-gold focus:outline-none transition-colors"
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
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>
        </div>
    );
}
