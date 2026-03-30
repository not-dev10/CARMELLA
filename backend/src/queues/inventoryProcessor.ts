import { inventoryQueue } from '../config/queues';
import { supabase } from '../config/supabase';

interface InventoryJobData {
  operation: 'update' | 'batch_update' | 'sync';
  productId?: string;
  quantity?: number;
  bulk?: Array<{ id: string; quantity: number }>;
  [key: string]: any;
}

export async function initInventoryProcessor() {
  // Process 3 inventory operations concurrently
  inventoryQueue.process(3, async (job) => {
    const jobData = job.data as InventoryJobData;
    console.log(`📦 Processing inventory ${job.id} (${jobData.operation})...`);

    try {
      if (jobData.operation === 'update' && jobData.productId && jobData.quantity !== undefined) {
        // Single product inventory update
        const { error } = await supabase
          .from('inventory')
          .update({ stock_quantity: jobData.quantity })
          .eq('product_id', jobData.productId);

        if (error) throw error;

        console.log(`✅ Inventory updated for product ${jobData.productId}: ${jobData.quantity} units`);
        return { updated: true, productId: jobData.productId, quantity: jobData.quantity };

      } else if (jobData.operation === 'batch_update' && jobData.bulk && Array.isArray(jobData.bulk)) {
        // Batch inventory update
        const updates = jobData.bulk;
        let successCount = 0;
        const results = [];

        job.progress(0);

        for (let i = 0; i < updates.length; i++) {
          const update = updates[i];
          const { error } = await supabase
            .from('inventory')
            .update({ stock_quantity: update.quantity })
            .eq('product_id', update.id);

          if (error) {
            console.error(`Failed to update product ${update.id}:`, error.message);
          } else {
            successCount++;
            results.push({ productId: update.id, status: 'success' });
          }

          // Update progress
          const progressPercent = Math.round(((i + 1) / updates.length) * 100);
          job.progress(progressPercent);
        }

        console.log(`✅ Batch inventory updated: ${successCount}/${updates.length} products`);
        return { 
          updated: true, 
          total: updates.length, 
          successCount,
          results 
        };

      } else if (jobData.operation === 'sync') {
        // Resync inventory from Supabase
        console.log('🔄 Syncing inventory cache...');
        
        const { data: inventory, error } = await supabase
          .from('inventory')
          .select('product_id, stock_quantity, reorder_level')
          .gt('stock_quantity', 0);

        if (error) throw error;

        console.log(`✅ Inventory synced: ${inventory?.length || 0} products in stock`);
        return { synced: true, productCount: inventory?.length || 0 };
      }

      throw new Error(`Unknown inventory operation: ${jobData.operation}`);

    } catch (error: any) {
      console.error(`❌ Inventory processing failed for job ${job.id}:`, error.message);
      throw error;
    }
  });

  console.log('📦 Inventory processor initialized');
}
