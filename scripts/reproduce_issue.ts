
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// We need the URL and Key from lib/supabase.ts
// Hardcoding for the test script based on view_file output
const supabaseUrl = 'https://hseyozbbvkjdxvwjkodv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZXlvemJidmtqZHh2d2prb2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MjE0ODYsImV4cCI6MjA4NDQ5NzQ4Nn0.FRRWAa3Fk_P5j6OA2tFXXxVPyOklShvp65V1RBkNFaQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log("Testing INSERT into 'orders'...");

    const dummyOrder = {
        customer_name: "Test User Script",
        items: [],
        total_amount: 0,
        total_pizzas: 0,
        notes: "Test insert from script",
        delivery_method: "pickup",
        payment_method: "cash",
        status: "pending",
        created_at: new Date().toISOString(),
        customer_phone: "+56912345678",
        customer_email: "test@example.com"
    };

    const { data, error } = await supabase
        .from('orders')
        .insert(dummyOrder)
        .select();

    if (error) {
        console.error("❌ Insert FAILED:", JSON.stringify(error, null, 2));
    } else {
        console.log("✅ Insert SUCCEEDED:", data);

        // Cleanup
        if (data && data[0]?.id) {
            console.log("Cleaning up...");
            await supabase.from('orders').delete().eq('id', data[0].id);
        }
    }
}

testInsert();
