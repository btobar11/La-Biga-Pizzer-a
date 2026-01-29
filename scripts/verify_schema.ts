
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchema() {
    console.log("Verifying 'orders' table schema...");

    const testOrder = {
        customer_name: "Test Schema User",
        total_amount: 100,
        items: [],
        status: 'cancelled',
        customer_phone: "+56912345678", // Field to test
        customer_email: "test@example.com" // Field to test
    };

    console.log("Attempting insert with phone/email...");
    const { data, error } = await supabase
        .from('orders')
        .insert(testOrder)
        .select()
        .single();

    if (error) {
        console.error("❌ Insert Failed. Schema mismatch likely.");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        console.error("Error Details:", error.details);
    } else {
        console.log("✅ Insert Successful! Columns 'customer_phone' and 'customer_email' exist.");
        // Cleanup
        console.log("Cleaning up test order...");
        await supabase.from('orders').delete().eq('id', data.id);
        console.log("Done.");
    }
}

verifySchema();
