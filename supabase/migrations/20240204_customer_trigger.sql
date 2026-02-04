-- Create Function to Sync Customers
CREATE OR REPLACE FUNCTION public.handle_new_order_customer()
RETURNS TRIGGER AS $$
DECLARE
    found_customer_id UUID;
    clean_phone TEXT;
BEGIN
    -- 1. Try to normalize phone derived from NEW row
    -- Assuming format might be consistent, but let's be safe
    clean_phone := NEW.customer_phone; 
    
    -- 2. Try to find existing customer by Phone (High Confidence)
    IF clean_phone IS NOT NULL AND length(clean_phone) > 5 THEN
        SELECT id INTO found_customer_id FROM customers WHERE phone = clean_phone LIMIT 1;
    END IF;

    -- 3. If not found by phone, try by Name (Medium Confidence)
    IF found_customer_id IS NULL AND NEW.customer_name IS NOT NULL THEN
        SELECT id INTO found_customer_id FROM customers WHERE lower(name) = lower(trim(NEW.customer_name)) LIMIT 1;
    END IF;

    -- 4. If still not found, create new customer
    IF found_customer_id IS NULL THEN
        INSERT INTO customers (
            name, 
            phone, 
            email, 
            address, 
            created_at,
            total_spent,
            total_orders,
            last_order_date
        ) VALUES (
            COALESCE(NEW.customer_name, 'Cliente Sin Nombre'),
            NEW.customer_phone,
            NEW.customer_email,
            NEW.address,
            COALESCE(NEW.created_at, now()),
            0, -- Will calculate stats separately or update later
            0,
            COALESCE(NEW.created_at, now())
        ) RETURNING id INTO found_customer_id;
    END IF;

    -- 5. Link the order to the customer
    NEW.customer_id := found_customer_id;

    -- 6. Update Customer Stats (Simple increment)
    UPDATE customers 
    SET 
        total_orders = total_orders + 1,
        total_spent = total_spent + COALESCE(NEW.total_amount, 0),
        last_order_date = GREATEST(last_order_date, NEW.created_at)
    WHERE id = found_customer_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger
DROP TRIGGER IF EXISTS link_customer_on_order_insert ON orders;
CREATE TRIGGER link_customer_on_order_insert
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_order_customer();
