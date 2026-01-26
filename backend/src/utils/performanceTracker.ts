/**
 * Performance Tracker Utility
 * Tracks API request latency and performance metrics
 * Stores in-memory with a rolling window of recent requests
 */

interface PerformanceMetric {
  method: string;
  endpoint: string;
  status: number;
  latency: number;
  timestamp: number;
}

class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 requests

  /**
   * Record a new performance metric
   */
  recordMetric(method: string, endpoint: string, status: number, latency: number) {
    const metric: PerformanceMetric = {
      method,
      endpoint,
      status,
      latency,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);

    // Keep only the last N metrics to avoid memory bloat
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    console.log(`[PERF_TRACKER] Recorded: ${method} ${endpoint} - ${latency}ms (${status})`);
  }

  /**
   * Get all recorded metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get recent metrics (last N requests)
   */
  getRecentMetrics(limit: number = 100): PerformanceMetric[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get metrics for a specific endpoint
   */
  getEndpointMetrics(endpoint: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.endpoint === endpoint);
  }

  /**
   * Calculate average latency
   */
  getAverageLatency(): number {
    if (this.metrics.length === 0) return 0;
    const sum = this.metrics.reduce((acc, m) => acc + m.latency, 0);
    return Math.round(sum / this.metrics.length);
  }

  /**
   * Get max latency
   */
  getMaxLatency(): number {
    if (this.metrics.length === 0) return 0;
    return Math.max(...this.metrics.map(m => m.latency));
  }

  /**
   * Get min latency
   */
  getMinLatency(): number {
    if (this.metrics.length === 0) return 0;
    return Math.min(...this.metrics.map(m => m.latency));
  }

  /**
   * Get performance summary
   */
  getSummary() {
    return {
      totalRequests: this.metrics.length,
      avgLatency: this.getAverageLatency(),
      maxLatency: this.getMaxLatency(),
      minLatency: this.getMinLatency(),
      recentRequests: this.getRecentMetrics(50),
    };
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
  }
}

// Export singleton instance
export const performanceTracker = new PerformanceTracker();
