// Export all queue processors
export { initOrderProcessor } from './orderProcessor.js';
export { initEmailProcessor } from './emailProcessor.js';
export { initInventoryProcessor } from './inventoryProcessor.js';

// Initialize all processors
export async function initializeAllProcessors() {
  console.log('🚀 Initializing all queue processors...');

  try {
    const { initOrderProcessor } = await import('./orderProcessor.js');
    const { initEmailProcessor } = await import('./emailProcessor.js');
    const { initInventoryProcessor } = await import('./inventoryProcessor.js');

    await initOrderProcessor();
    await initEmailProcessor();
    await initInventoryProcessor();

    console.log('✅ All queue processors initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing queue processors:', error);
    throw error;
  }
}
