"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Users, DollarSign, ShoppingBag, MapPin, Search, Lock, Pizza, Award, ArrowUpRight, Trash2 } from "lucide-react";

import { Order, OrderItem, CustomerProfile } from "../../types/crm";
import { EditOrderModal } from "../../components/EditOrderModal";
import { AddManualOrderModal } from "../../components/AddManualOrderModal";
import { EditCustomerModal } from "../../components/EditCustomerModal";

// --- Components ---

export default function CRMPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Data State
    const [orders, setOrders] = useState<Order[]>([]);
    const [customersList, setCustomersList] = useState<CustomerProfile[]>([]); // Data from DB
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false); // New state
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null); // New state
    const [viewMode, setViewMode] = useState<'database' | 'daily'>('daily'); // Start on Daily view by default? Or database? Let's stick to database or what user prefers. User asked for "like crm but only today", implying a separate view. Let's make it 'database' default for now so it looks familiar. Actually user "me gustaria que en el crm... hagas algo asi como las ordenes por dia". Let's default to 'database' but allow switch.

    // --- Auth Handler ---
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === "1234") { // Simple PIN as requested
            setIsAuthenticated(true);
            fetchData();
        } else {
            setError("PIN Incorrecto");
            setTimeout(() => setError(""), 2000);
        }
    };

    // --- Data Fetching ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, customersRes] = await Promise.all([
                supabase.from('orders').select('*').order('created_at', { ascending: false }),
                supabase.from('customers').select('*').order('last_order_date', { ascending: false, nullsFirst: false })
            ]);

            if (ordersRes.error) throw ordersRes.error;
            if (customersRes.error) throw customersRes.error;

            setOrders(ordersRes.data || []);
            setCustomersList(customersRes.data || []);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
        setLoading(false);
    };

    // --- Data Processing (Joined) ---
    const customers = useMemo(() => {
        // Create full profiles by attaching history to DB customers
        const map = new Map<string, CustomerProfile>();

        // Initialize from DB Customers
        customersList.forEach(c => {
            map.set(c.id, { ...c, history: [] });
        });

        // Attach orders to customers
        orders.forEach(order => {
            // 1. Try linking by customer_id (Best)
            if (order.customer_id && map.has(order.customer_id)) {
                map.get(order.customer_id)!.history!.push(order);
                return;
            }

            // 2. Fallback: Link by Phone (if migration missed something or legacy)
            // This is technically redundant if everything is migrated, but good for safety
            if (order.customer_phone) {
                const found = customersList.find(c => c.phone === order.customer_phone);
                if (found) {
                    map.get(found.id)!.history!.push(order);
                }
            }
        });

        return Array.from(map.values());
    }, [orders, customersList]);

    // Filtered List
    const filteredCustomers = useMemo(() => {
        return customers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone && c.phone.includes(searchTerm))
        ).sort((a, b) => b.total_spent - a.total_spent);
    }, [customers, searchTerm]);

    // Daily Orders View Data
    const dailyOrders = useMemo(() => {
        const now = new Date();
        return orders.filter(order => {
            const d = new Date(order.created_at);
            return d.getDate() === now.getDate() &&
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear();
        }).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); // Ascending (Chronological)
    }, [orders]);

    // KPI Stats
    const totalRevenue = customers.reduce((acc, c) => acc + c.total_spent, 0);
    const avgTicket = customers.length > 0 ? totalRevenue / customers.length : 0; // Lifetime value actually

    // Format currency
    const formatCLP = (amount: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    const handleEditOrder = (order: Order) => {
        setSelectedOrder(order);
        setIsEditModalOpen(true);
    };

    const handleUpdateOrder = async (updatedOrder: Order) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({
                    customer_name: updatedOrder.customer_name,
                    items: updatedOrder.items,
                    total_amount: updatedOrder.total_amount,
                    notes: updatedOrder.notes
                })
                .eq('id', updatedOrder.id);

            if (error) throw error;

            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            await fetchData();
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error updating order:", error);
            alert("Error al actualizar el pedido");
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) throw error;

            // Optimistic update
            setOrders(prev => prev.filter(o => o.id !== orderId));
            await fetchData(); // Ensure sync
        } catch (error) {
            console.error("Error deleting order:", error);
            alert("Error al eliminar el pedido");
        }
    };

    const toggleExpand = (customerId: string) => {
        setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
    };

    const handleCreateOrder = async (newOrder: any) => {
        try {
            const { error } = await supabase
                .from('orders')
                .insert(newOrder);

            if (error) throw error;

            await fetchData();
            setIsAddModalOpen(false);
            alert("Pedido creado exitosamente");
        } catch (error) {
            console.error("Error creating order:", error);
            alert("Error al crear el pedido");
        }
    };

    const handleCreateCustomer = async (newCustomer: any) => {
        try {
            const { error } = await supabase
                .from('customers')
                .insert(newCustomer);

            if (error) throw error;

            await fetchData();
            alert("Cliente registrado exitosamente");
        } catch (error) {
            console.error("Error creating customer:", error);
            alert("Error al registrar cliente");
        }
    };

    const handleUpdateCustomer = async (updatedCustomer: CustomerProfile) => {
        try {
            const { error } = await supabase
                .from('customers')
                .update({
                    name: updatedCustomer.name,
                    phone: updatedCustomer.phone,
                    email: updatedCustomer.email,
                    address: updatedCustomer.address,
                    notes: updatedCustomer.notes
                })
                .eq('id', updatedCustomer.id);

            if (error) throw error;

            await fetchData();
            setIsEditCustomerModalOpen(false);
            // alert("Cliente actualizado exitosamente");
        } catch (error) {
            console.error("Error updating customer:", error);
            alert("Error al actualizar cliente");
        }
    };

    const handleEditCustomerClick = (customer: CustomerProfile, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row expand
        setSelectedCustomer(customer);
        setIsEditCustomerModalOpen(true);
    };


    // --- Render: Login Screen ---
    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-coal flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm bg-[#1A1A1A] p-8 rounded-2xl border border-white/5 shadow-2xl"
                >
                    <div className="flex justify-center mb-6">
                        <div className="bg-gold/10 p-4 rounded-full">
                            <Lock className="h-8 w-8 text-gold" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-serif text-center text-white mb-2">La Biga CRM</h1>
                    <p className="text-center text-gray-400 text-sm mb-8">Acceso restringido para administración</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Ingrese PIN"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-center text-xl tracking-widest text-white focus:border-gold focus:outline-none transition-colors"
                            autoFocus
                        />
                        {error && <p className="text-red-400 text-center text-sm font-bold animate-pulse">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-gold text-coal font-bold p-4 rounded-xl hover:bg-yellow-500 transition-colors"
                        >
                            Ingresar
                        </button>
                    </form>
                </motion.div>
            </main>
        );
    }

    // --- Render: Dashboard ---
    return (
        <main className="min-h-screen bg-coal text-white">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#1A1A1A]/80 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users className="text-gold h-6 w-6" />
                        <h1 className="text-xl font-serif font-bold">La Biga <span className="text-gold">CRM</span></h1>
                    </div>
                    <div className="flex bg-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 bg-gold text-coal font-bold rounded-md text-sm hover:bg-yellow-500 transition-colors mr-2 flex items-center gap-2"
                        >
                            + Nuevo Cliente
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 bg-white/10 text-white font-bold rounded-md text-sm hover:bg-white/20 transition-colors mr-2"
                        >
                            Agregar Pedido
                        </button>
                        <button
                            onClick={() => setIsAuthenticated(false)}
                            className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                        >
                            SALIR
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <GradientCard
                        label="Clientes Totales"
                        value={customers.length.toString()}
                        icon={<Users className="h-5 w-5 text-blue-400" />}
                        subValue="Basado en historial"
                    />
                    <GradientCard
                        label="Ingresos Históricos"
                        value={formatCLP(totalRevenue)}
                        icon={<DollarSign className="h-5 w-5 text-green-400" />}
                        subValue="Total ventas acumuladas"

                    />
                    <GradientCard
                        label="Valor Promedio (LTV)"
                        value={formatCLP(avgTicket)}
                        icon={<Award className="h-5 w-5 text-purple-400" />}
                        subValue="Por cliente único"
                    />
                </div>

                {/* Main Content */}
                <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-bold font-serif">
                                {viewMode === 'database' ? 'Base de Datos de Clientes' : 'Pedidos del Día (Orden de Llegada)'}
                            </h2>
                            <div className="bg-black/20 p-1 rounded-lg flex gap-1">
                                <button
                                    onClick={() => setViewMode('daily')}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${viewMode === 'daily' ? 'bg-gold text-coal' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Hoy
                                </button>
                                <button
                                    onClick={() => setViewMode('database')}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${viewMode === 'database' ? 'bg-gold text-coal' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Clientes
                                </button>
                            </div>
                        </div>
                        {viewMode === 'database' && (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar cliente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold w-full md:w-64"
                                />
                            </div>
                        )}
                    </div>
                    {viewMode === 'database' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="p-4 w-8"></th>
                                        <th className="p-4">Cliente</th>
                                        <th className="p-4">Pizza Favorita</th>
                                        <th className="p-4">Dirección (Última)</th>
                                        <th className="p-4 text-center">Pedidos</th>
                                        <th className="p-4 text-right">Total Gastado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-gray-500">Cargando datos...</td>
                                        </tr>
                                    ) : filteredCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-gray-500">No se encontraron clientes</td>
                                        </tr>
                                    ) : (
                                        filteredCustomers.map((customer, idx) => (
                                            <>
                                                <tr
                                                    key={customer.id}
                                                    className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${expandedCustomer === customer.id ? "bg-white/[0.02]" : ""}`}
                                                    onClick={() => toggleExpand(customer.id)}
                                                >
                                                    <td className="p-4 text-gray-500">
                                                        <ArrowUpRight className={`h-4 w-4 transition-transform ${expandedCustomer === customer.id ? "rotate-90 text-gold" : ""}`} />
                                                    </td>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-bold text-white group-hover:text-gold transition-colors">{customer.name}</div>
                                                        <button
                                                            onClick={(e) => handleEditCustomerClick(customer, e)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white"
                                                            title="Editar Cliente"
                                                        >
                                                            <Award className="h-3 w-3" /> {/* Reusing Award icon as placeholder, or use another if imported */}
                                                        </button>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {customer.phone && <span className="block">📞 {customer.phone}</span>}
                                                        {customer.email && <span className="block truncate max-w-[150px]">✉️ {customer.email}</span>}
                                                    </div>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                                                                <Pizza className="h-3 w-3 text-orange-500" />
                                                            </div>
                                                            <span className="text-sm">{customer.favorite_pizza || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-400 max-w-xs truncate" title={customer.address}>
                                                        {customer.address || '-'}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white">
                                                            {customer.total_orders}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right font-mono font-bold text-green-400">
                                                        {formatCLP(customer.total_spent)}
                                                    </td>
                                                </tr>
                                                {/* Expandable Row */}
                                                {expandedCustomer === customer.id && (
                                                    <tr className="bg-white/[0.01]">
                                                        <td colSpan={6} className="p-4 md:p-6">
                                                            <div className="bg-[#111] rounded-xl border border-white/5 p-4 overflow-hidden">
                                                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                                                                    <ShoppingBag className="h-4 w-4" /> Historial de Pedidos
                                                                </h3>
                                                                <div className="overflow-x-auto">
                                                                    <table className="w-full text-left text-sm">
                                                                        <thead>
                                                                            <tr className="border-b border-white/5 text-gray-500">
                                                                                <th className="pb-2">Fecha</th>
                                                                                <th className="pb-2">Items</th>
                                                                                <th className="pb-2">Tipo</th>
                                                                                <th className="pb-2">Dirección / Info</th>
                                                                                <th className="pb-2">Pago</th>
                                                                                <th className="pb-2 text-right">Monto</th>
                                                                                <th className="pb-2 text-right">Acciones</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-white/5">
                                                                            {customer.history?.map((order) => (
                                                                                <tr key={order.id} className="text-gray-300">
                                                                                    <td className="py-3 align-top whitespace-nowrap text-xs text-gray-500">
                                                                                        {new Date(order.created_at).toLocaleDateString()} <br />
                                                                                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                    </td>
                                                                                    <td className="py-3 align-top">
                                                                                        <ul className="space-y-1">
                                                                                            {Array.isArray(order.items) && order.items.map((item, i) => (
                                                                                                <li key={i} className="flex gap-2">
                                                                                                    <span className="text-gold font-bold">{item.quantity}x</span>
                                                                                                    <span>{item.name}</span>
                                                                                                </li>
                                                                                            ))}
                                                                                        </ul>
                                                                                    </td>
                                                                                    <td className="py-3 align-top">
                                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${order.delivery_method === 'delivery'
                                                                                            ? 'bg-blue-500/10 text-blue-400'
                                                                                            : 'bg-green-500/10 text-green-400'
                                                                                            }`}>
                                                                                            {order.delivery_method === 'delivery' ? 'Delivery' : 'Retiro'}
                                                                                        </span>
                                                                                        {order.delivery_time && (
                                                                                            <div className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                                                                                                <span className="opacity-70">Hora:</span> {order.delivery_time}
                                                                                            </div>
                                                                                        )}
                                                                                    </td>
                                                                                    <td className="py-3 align-top max-w-[200px]">
                                                                                        {order.delivery_method === 'delivery' ? (
                                                                                            <span className="flex items-start gap-1 text-xs">
                                                                                                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                                                                {order.address}
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className="text-xs text-gray-500 italic">Retiro en local</span>
                                                                                        )}
                                                                                    </td>
                                                                                    <td className="py-3 align-top">
                                                                                        <span className="text-xs capitalize">{order.payment_method === 'transfer' ? 'Transferencia' : (order.payment_method === 'cash' ? 'Efectivo' : order.payment_method || '-')}</span>
                                                                                    </td>
                                                                                    <td className="py-3 align-top text-right font-mono font-bold text-white">
                                                                                        {formatCLP(order.total_amount)}
                                                                                    </td>
                                                                                    <td className="py-3 align-top text-right">
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleEditOrder(order);
                                                                                            }}
                                                                                            className="text-white hover:text-orange-500 transition-colors p-1"
                                                                                            title="Editar Pedido"
                                                                                        >
                                                                                            <Award className="h-4 w-4" />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleDeleteOrder(order.id);
                                                                                            }}
                                                                                            className="text-white hover:text-red-500 transition-colors p-1"
                                                                                            title="Eliminar Pedido"
                                                                                        >
                                                                                            <Trash2 className="h-4 w-4" />
                                                                                        </button>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="p-4">Hora</th>
                                        <th className="p-4">Cliente</th>
                                        <th className="p-4">Items</th>
                                        <th className="p-4">Tipo</th>
                                        <th className="p-4">Pago</th>
                                        <th className="p-4 text-right">Total</th>
                                        <th className="p-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {dailyOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-gray-500">No hay pedidos hoy</td>
                                        </tr>
                                    ) : (
                                        dailyOrders.map(order => (
                                            <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4 text-sm text-gray-300 font-mono">
                                                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-white">{order.customer_name}</div>
                                                    <div className="text-xs text-gray-500 font-mono tracking-wider">
                                                        {order.customer_phone || "-"}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-300">
                                                    <ul className="space-y-1 max-w-[200px]">
                                                        {Array.isArray(order.items) && order.items.map((item: any, i: number) => (
                                                            <li key={i} className="flex gap-1.5 text-xs">
                                                                <span className="text-gold font-bold">{item.quantity}x</span>
                                                                <span className="truncate">{item.name}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${order.delivery_method === 'delivery'
                                                        ? 'bg-blue-500/10 text-blue-400'
                                                        : 'bg-green-500/10 text-green-400'
                                                        }`}>
                                                        {order.delivery_method === 'delivery' ? 'Del' : 'Ret'}
                                                    </span>
                                                    {order.delivery_time && (
                                                        <div className="text-xs text-yellow-500 mt-1">
                                                            {order.delivery_time}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-xs capitalize text-gray-400">
                                                    {order.payment_method === 'transfer' ? 'Transf' : (order.payment_method || '-')}
                                                </td>
                                                <td className="p-4 text-right font-mono font-bold text-gold">
                                                    {formatCLP(order.total_amount)}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleEditOrder(order)}
                                                            className="text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                                                        >
                                                            <Award className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteOrder(order.id)}
                                                            className="text-red-400/50 hover:text-red-400 transition-colors p-2 hover:bg-white/10 rounded-lg"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>


            <EditOrderModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                order={selectedOrder}
                onSave={handleUpdateOrder}
            />

            <AddManualOrderModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSaveOrder={handleCreateOrder}
                onSaveCustomer={handleCreateCustomer}
                existingCustomers={customersList}
            />

            <EditCustomerModal
                isOpen={isEditCustomerModalOpen}
                onClose={() => setIsEditCustomerModalOpen(false)}
                customer={selectedCustomer}
                onSave={handleUpdateCustomer}
            />

        </main >
    );
}

// --- Subcomponents ---
function GradientCard({ label, value, subValue, icon }: { label: string, value: string, subValue: string, icon: React.ReactNode }) {
    return (
        <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {icon}
            </div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/5 rounded-lg">
                    {icon}
                </div>
                <span className="text-sm font-bold text-gray-400">{label}</span>
            </div>
            <div className="text-2xl font-bold text-white font-serif">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{subValue}</div>
        </div>
    );
}
