export interface OrderItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

export interface Order {
    id: string;
    created_at: string;
    customer_name: string;
    customer_id?: string;    // New FK
    total_amount: number;
    items: OrderItem[];      // JSONB
    address?: string;
    delivery_method?: string;
    delivery_time?: string;
    payment_method?: string;
    notes?: string;
    customer_phone?: string;
    customer_email?: string;
}

export interface CustomerProfile {
    id: string;
    created_at?: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    total_spent: number;    // DB column: total_spent
    total_orders: number;   // DB column: total_orders
    favorite_pizza?: string; // DB column: favorite_pizza
    last_order_date?: string; // DB column: last_order_date
    // Computed/Joined fields
    history?: Order[];
}
