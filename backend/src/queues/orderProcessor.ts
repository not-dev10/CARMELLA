import { orderQueue, emailQueue } from '../config/queues.js';
import { supabase } from '../config/supabase.js';

interface OrderJobData {
  userId: string;
  cartId: string;
  shippingAddress: any;
  paymentMethod: string;
  isBulk: boolean;
  requestedQuantities?: object;
}

export async function initOrderProcessor() {
  // Process 5 orders concurrently
  orderQueue.process(5, async (job) => {
    console.log(`📦 Processing order ${job.id}...`);
    
    const { userId, cartId, shippingAddress, paymentMethod, isBulk, requestedQuantities } = job.data as OrderJobData;

    try {
      job.progress(10); // 10% - Started

      // 1. Get cart items
      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId);

      if (cartError) throw cartError;
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Cart is empty');
      }
      job.progress(25); // 25% - Cart retrieved

      // 2. Validate inventory
      const inventoryCheck = await Promise.all(
        cartItems.map(async (item: any) => {
          const { data, error } = await supabase
            .from('inventory')
            .select('stock_quantity')
            .eq('product_id', item.product_id)
            .single();
          
          if (error) throw error;
          if (!data || data.stock_quantity < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.product_id}`);
          }
          return data;
        })
      );
      job.progress(50); // 50% - Inventory validated

      // 3. Calculate pricing
      const { data: cartData, error: priceError } = await supabase
        .from('carts')
        .select('calculated_total, discount_amount')
        .eq('id', cartId)
        .single();

      if (priceError) throw priceError;
      job.progress(65); // 65% - Pricing calculated

      // 4. Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // 5. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          order_number: orderNumber,
          total_amount: cartData?.calculated_total || 0,
          discount_amount: cartData?.discount_amount || 0,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
          order_status: 'pending_payment',
          is_bulk: isBulk,
          requested_quantities: requestedQuantities,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error('Failed to create order');
      job.progress(80); // 80% - Order created

      // 6. Add items to order
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;
      job.progress(90); // 90% - Items added

      // 7. Queue email notification (non-blocking)
      await emailQueue.add(
        'order_confirmation',
        {
          type: 'order_confirmation',
          orderId: order.id,
          userId,
          orderNumber,
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      );

      // 8. Clear cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);

      job.progress(100); // 100% - Complete

      console.log(`✅ Order ${order.id} (${orderNumber}) created successfully`);
      return { orderId: order.id, orderNumber, status: 'success' };

    } catch (error: any) {
      console.error(`❌ Order processing failed for job ${job.id}:`, error.message);
      throw error;
    }
  });

  console.log('📦 Order processor initialized');
}
