
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
    console.log("1. Creating a test customer...");
    const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
            name: "Test Update User",
            email: "test_update@example.com"
        })
        .select()
        .single();

    if (createError) {
        console.error("Failed to create customer:", createError);
        return;
    }

    console.log("Customer created with ID:", newCustomer.id);

    console.log("2. Updating name and adding phone...");
    const { error: updateError } = await supabase
        .from('customers')
        .update({
            name: "Updated Name",
            phone: "+56912345678",
            notes: "Updated notes via script"
        })
        .eq('id', newCustomer.id);

    if (updateError) {
        console.error("❌ Update Failed:", updateError);
    } else {
        console.log("✅ Update sent.");
    }

    console.log("3. Fetching to verify persistence...");
    const { data: updatedCustomer, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', newCustomer.id)
        .single();

    if (fetchError) {
        console.error("Failed to fetch customer:", fetchError);
    } else {
        console.log("Refetched State:", updatedCustomer);
        if (updatedCustomer.name === "Updated Name" && updatedCustomer.phone === "+56912345678") {
            console.log("✅ SUCCESS: Data was persisted.");
        } else {
            console.error("❌ FAILURE: Data mismatch.");
        }
    }

    // Cleanup
    await supabase.from('customers').delete().eq('id', newCustomer.id);
}

testUpdate();
