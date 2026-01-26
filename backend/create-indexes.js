/**
 * Create Database Indexes - Run Sequentially
 * Executes each index creation query one at a time
 * Usage: node create-indexes.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// All index creation queries - MUST RUN SEQUENTIALLY
const queries = [
  {
    name: 'idx_inventory_quantity_available',
    sql: 'CREATE INDEX IF NOT EXISTS idx_inventory_quantity_available ON inventory(quantity_available) WHERE is_active = true;'
  },
  {
    name: 'idx_inventory_product_id',
    sql: 'CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);'
  },
  {
    name: 'idx_inventory_warehouse',
    sql: 'CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_location);'
  },
  {
    name: 'idx_carts_user_id',
    sql: 'CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);'
  },
  {
    name: 'idx_cart_items_cart_id',
    sql: 'CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);'
  },
  {
    name: 'idx_cart_items_product_id',
    sql: 'CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);'
  },
  {
    name: 'idx_orders_status',
    sql: 'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status) WHERE status IN (\'delivered\', \'pending\', \'cancelled\');'
  },
  {
    name: 'idx_orders_created_at',
    sql: 'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);'
  },
  {
    name: 'idx_orders_user_id',
    sql: 'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);'
  },
  {
    name: 'idx_b2b_requests_status',
    sql: 'CREATE INDEX IF NOT EXISTS idx_b2b_requests_status ON b2b_requests(status) WHERE status = \'pending\';'
  },
  {
    name: 'idx_products_category_id',
    sql: 'CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);'
  },
  {
    name: 'idx_inventory_history_inventory_id',
    sql: 'CREATE INDEX IF NOT EXISTS idx_inventory_history_inventory_id ON inventory_history(inventory_id);'
  },
  {
    name: 'idx_inventory_history_created_at',
    sql: 'CREATE INDEX IF NOT EXISTS idx_inventory_history_created_at ON inventory_history(created_at DESC);'
  },
  {
    name: 'idx_inventory_user_id_status',
    sql: 'CREATE INDEX IF NOT EXISTS idx_inventory_user_id_status ON inventory(product_id, is_active);'
  }
];

async function executeQuery(query) {
  try {
    const { data, error } = await supabase.rpc('exec', { sql: query.sql });
    
    if (error) {
      console.error(`❌ ${query.name}: ${error.message}`);
      return false;
    }
    
    console.log(`✅ ${query.name} - Created successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${query.name}: ${error.message}`);
    return false;
  }
}

async function createAllIndexes() {
  console.log('🚀 Starting index creation...\n');
  
  let successful = 0;
  let failed = 0;
  const startTime = Date.now();

  for (const query of queries) {
    const success = await executeQuery(query);
    if (success) {
      successful++;
    } else {
      failed++;
    }
    // Small delay between queries
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`\n📊 Results:`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏱️  Total time: ${duration}s\n`);

  process.exit(failed > 0 ? 1 : 0);
}

createAllIndexes();
