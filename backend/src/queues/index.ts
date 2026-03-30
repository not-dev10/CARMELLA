// Export all queue processors
export { initOrderProcessor } from './orderProcessor';
export { initEmailProcessor } from './emailProcessor';
export { initInventoryProcessor } from './inventoryProcessor';

// Initialize all processors
export async function initializeAllProcessors() {
  console.log('🚀 Initializing all queue processors...');

  try {
    const { initOrderProcessor } = await import('./orderProcessor');
    const { initEmailProcessor } = await import('./emailProcessor');
    const { initInventoryProcessor } = await import('./inventoryProcessor');

    await initOrderProcessor();
    await initEmailProcessor();
    await initInventoryProcessor();

    console.log('✅ All queue processors initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing queue processors:', error);
    throw error;
  }
}
