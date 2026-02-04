
import { createClient } from '@supabase/supabase-js';

// Configuration
const supabaseUrl = 'https://hseyozbbvkjdxvwjkodv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZXlvemJidmtqZHh2d2prb2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MjE0ODYsImV4cCI6MjA4NDQ5NzQ4Nn0.FRRWAa3Fk_P5j6OA2tFXXxVPyOklShvp65V1RBkNFaQ';

const supabase = createClient(supabaseUrl, supabaseKey);

interface Order {
    id: string;
    created_at: string;
    customer_name: string;
    total_amount: number;
    customer_phone?: string;
    customer_email?: string;
    address?: string;
    notes?: string;
    items: any[];
}

interface Customer {
    id?: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    first_order_date: string;
    last_order_date: string;
    total_spent: number;
    total_orders: number;
    favorite_pizza?: string;
}

async function migrateCustomers() {
    console.log("Starting Customer Migration...");

    // 1. Fetch all orders
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true });

    if (error || !orders) {
        console.error("Failed to fetch orders:", error);
        return;
    }

    console.log(`Fetched ${orders.length} orders.`);

    // 2. Aggregate Customers
    const customerMap = new Map<string, Customer>();
    const orderToCustomerMap = new Map<string, string>(); // orderId -> customerKey (Phone or CleanName)

    for (const order of orders) {
        const cleanName = order.customer_name?.trim();
        if (!cleanName) continue; // Skip bad data

        // Identifier Logic: Phone > Name (ignore single digit phones like '9')
        let uniqueKey = cleanName.toLowerCase();
        if (order.customer_phone && order.customer_phone.length > 6) {
            uniqueKey = order.customer_phone.replace(/\s+/g, '').trim();
        }

        orderToCustomerMap.set(order.id, uniqueKey);

        const existing = customerMap.get(uniqueKey);

        if (!existing) {
            customerMap.set(uniqueKey, {
                name: cleanName,
                phone: order.customer_phone,
                email: order.customer_email,
                address: order.address,
                first_order_date: order.created_at,
                last_order_date: order.created_at,
                total_spent: order.total_amount || 0,
                total_orders: 1
            });
        } else {
            // Merge logic
            existing.total_orders += 1;
            existing.total_spent += (order.total_amount || 0);
            if (new Date(order.created_at) > new Date(existing.last_order_date)) {
                existing.last_order_date = order.created_at;
                existing.address = order.address || existing.address; // Keep latest address
                existing.name = cleanName; // Update name to latest used
            }
            if (order.customer_phone) existing.phone = order.customer_phone;
            if (order.customer_email) existing.email = order.customer_email;
        }
    }

    console.log(`Identified ${customerMap.size} unique customers.`);

    // 3. Insert Customers and Link Orders
    let processed = 0;
    for (const [key, profile] of Array.from(customerMap.entries())) {
        processed++;

        // Insert Customer
        const { data: newCustomer, error: insertError } = await supabase
            .from('customers')
            .insert({
                name: profile.name,
                phone: profile.phone,
                email: profile.email,
                address: profile.address,
                total_spent: profile.total_spent,
                total_orders: profile.total_orders,
                last_order_date: profile.last_order_date
                // created_at defaults to now, could override if we want "first seen"
            })
            .select()
            .single();

        if (insertError) {
            console.error(`Error inserting customer ${profile.name} (${key}):`, insertError);
            continue;
        }

        const customerId = newCustomer.id;

        // Find all orders for this customer and update them
        // Inefficient to iterate all orders again, better to have grouped them?
        // Let's iterate orders and check our map
        const ordersToUpdate = orders.filter(o => orderToCustomerMap.get(o.id) === key);

        for (const order of ordersToUpdate) {
            const { error: updateError } = await supabase
                .from('orders')
                .update({ customer_id: customerId })
                .eq('id', order.id);

            if (updateError) {
                console.error(`Failed to link order ${order.id} to customer ${customerId}`, updateError);
            }
        }

        if (processed % 10 === 0) console.log(`Processed ${processed}/${customerMap.size} customers...`);
    }

    console.log("Migration Complete! 🎉");
}

migrateCustomers();
