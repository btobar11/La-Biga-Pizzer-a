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
    total_amount: number;
    items: OrderItem[];      // JSONB
    address?: string;
    delivery_method?: string;
    delivery_time?: string;
    payment_method?: string;
    notes?: string;
}

export interface CustomerProfile {
    id: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
    favoritePizza: string;
    lastAddress: string;
    firstOrderDate: string;
    lastOrderDate: string;
    history: Order[];
}
