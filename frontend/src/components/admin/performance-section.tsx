import { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import { Activity, TrendingUp, AlertCircle, Zap, ChevronDown, ChevronUp, Copy, Check, Gauge } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { analyticsAPI } from "@/lib/api"

// Latency gauge component
function LatencyGauge({ latency, label, max = 1000 }: { latency: number; label: string; max?: number }) {
  const percentage = Math.min((latency / max) * 100, 100)
  
  const getGaugeColor = (percent: number) => {
    if (percent < 20) return 'from-green-500 to-green-600'
    if (percent < 40) return 'from-yellow-500 to-yellow-600'
    if (percent < 60) return 'from-orange-500 to-orange-600'
    if (percent < 80) return 'from-red-500 to-red-600'
    return 'from-red-600 to-red-700'
  }

  const getTextColor = (percent: number) => {
    if (percent < 20) return 'text-green-600 dark:text-green-400'
    if (percent < 40) return 'text-yellow-600 dark:text-yellow-400'
    if (percent < 60) return 'text-orange-600 dark:text-orange-400'
    if (percent < 80) return 'text-red-600 dark:text-red-400'
    return 'text-red-700 dark:text-red-500'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <span className={cn("text-lg font-bold", getTextColor(percentage))}>{latency}ms</span>
      </div>
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn("h-full bg-gradient-to-r rounded-full", getGaugeColor(percentage))}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0ms</span>
        <span>{max}ms</span>
      </div>
    </div>
  )
}

interface LatencyMetric {
  endpoint: string
  method: string
  latency: number
  timestamp: number
  status: number
}

interface LatencyStats {
  endpoint: string
  method: string
  count: number
  avgLatency: number
  minLatency: number
  maxLatency: number
  lastLatency: number
}

export function PerformanceSection() {
  const [metrics, setMetrics] = useState<LatencyMetric[]>([])
  const [stats, setStats] = useState<Map<string, LatencyStats>>(new Map())
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [rawData, setRawData] = useState<any>(null)
  const [showRawData, setShowRawData] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Fetch performance data from API
  useEffect(() => {
    if (!isMonitoring) return

    const fetchPerformanceData = async () => {
      try {
        const data = await analyticsAPI.getDashboard()
        
        // Store raw data for debugging
        setRawData(data)
        console.log('[PERFORMANCE] Raw API Response:', data)
        console.log('[PERFORMANCE] Performance data:', data?.performance)
        console.log('[PERFORMANCE] Dashboard stats:', data?.dashboardStats)
        
        if (data && data.performance) {
          console.log('[PERFORMANCE] Found performance data, processing metrics...')
          // Convert API response to metrics format
          const apiMetrics: LatencyMetric[] = (data.performance.recentRequests || []).map((req: any) => ({
            endpoint: req.endpoint || '/',
            method: req.method || 'GET',
            latency: req.latency || 0,
            timestamp: req.timestamp || Date.now(),
            status: req.status || 200,
          }))
          
          console.log('[PERFORMANCE] Converted metrics:', apiMetrics.length, 'requests')
          setMetrics(apiMetrics)
          updateStats(apiMetrics)
        } else {
          console.warn('[PERFORMANCE] No performance data in response')
        }
      } catch (error) {
        console.error('Failed to fetch performance data:', error)
      }
    }

    // Fetch immediately and then every 5 seconds while monitoring
    fetchPerformanceData()
    const interval = setInterval(fetchPerformanceData, 5000)
    
    return () => clearInterval(interval)
  }, [isMonitoring])

  const updateStats = (allMetrics: LatencyMetric[]) => {
    const newStats = new Map<string, LatencyStats>()

    allMetrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`
      const existing = newStats.get(key)

      if (existing) {
        existing.count++
        existing.avgLatency = (existing.avgLatency * (existing.count - 1) + metric.latency) / existing.count
        existing.minLatency = Math.min(existing.minLatency, metric.latency)
        existing.maxLatency = Math.max(existing.maxLatency, metric.latency)
        existing.lastLatency = metric.latency
      } else {
        newStats.set(key, {
          endpoint: metric.endpoint,
          method: metric.method,
          count: 1,
          avgLatency: metric.latency,
          minLatency: metric.latency,
          maxLatency: metric.latency,
          lastLatency: metric.latency,
        })
      }
    })

    setStats(newStats)
  }

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'text-green-600 dark:text-green-400'
    if (latency < 300) return 'text-yellow-600 dark:text-yellow-400'
    if (latency < 500) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getLatencyBg = (latency: number) => {
    if (latency < 100) return 'bg-green-100 dark:bg-green-900/30'
    if (latency < 300) return 'bg-yellow-100 dark:bg-yellow-900/30'
    if (latency < 500) return 'bg-orange-100 dark:bg-orange-900/30'
    return 'bg-red-100 dark:bg-red-900/30'
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'POST':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'PUT':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'DELETE':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
    }
  }

  const avgLatency = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + m.latency, 0) / metrics.length)
    : 0

  const maxLatency = metrics.length > 0
    ? Math.max(...metrics.map(m => m.latency))
    : 0

  const minLatency = metrics.length > 0
    ? Math.min(...metrics.map(m => m.latency))
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-4xl font-black tracking-tight text-foreground mb-2">API Performance Monitor</h2>
        <p className="text-muted-foreground">Real-time latency tracking for all API endpoints</p>
      </div>

      {/* Control */}
      <div className="admin-card p-4 flex items-center justify-between">
        <div>
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={cn(
              "px-6 py-2 rounded-lg font-semibold transition-all",
              isMonitoring
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            {isMonitoring ? "Stop Tracking" : "Start Tracking"}
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            {isMonitoring 
              ? `Tracking active - updating every 5 seconds (${metrics.length} requests captured)` 
              : "Click to start tracking API performance"}
          </p>
        </div>
        {isMonitoring && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-red-600">LIVE</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Latency</p>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <p className={cn("text-3xl font-bold", getLatencyColor(avgLatency))}>{avgLatency}ms</p>
        </div>

        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Max Latency</p>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <p className={cn("text-3xl font-bold", getLatencyColor(maxLatency))}>{maxLatency}ms</p>
        </div>

        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Min Latency</p>
            <Zap className="w-4 h-4 text-green-600" />
          </div>
          <p className={cn("text-3xl font-bold", getLatencyColor(minLatency))}>{minLatency}ms</p>
        </div>

        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Requests</p>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{metrics.length}</p>
        </div>
      </div>

      {/* Latency Gauges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-card p-6 space-y-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Latency Gauges</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <LatencyGauge latency={avgLatency} label="Average Latency" max={500} />
          <LatencyGauge latency={maxLatency} label="Maximum Latency" max={1000} />
          <LatencyGauge latency={minLatency} label="Minimum Latency" max={200} />
          {metrics.length > 0 && (
            <LatencyGauge 
              latency={metrics[metrics.length - 1]?.latency || 0} 
              label="Latest Request" 
              max={500} 
            />
          )}
        </div>

        {/* Gauge Legend */}
        <div className="border-t border-border pt-4 mt-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Performance Levels</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-muted-foreground">Excellent (&lt;20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-muted-foreground">Good (20-40%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs text-muted-foreground">Fair (40-60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-muted-foreground">Poor (&gt;60%)</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Endpoint Stats */}
      {stats.size > 0 && (
        <div className="admin-card p-6">
          <h3 className="text-xl font-bold mb-4 text-foreground">Endpoint Statistics</h3>
          <div className="space-y-4">
            {Array.from(stats.values())
              .sort((a, b) => b.lastLatency - a.lastLatency)
              .map((stat, idx) => (
                <motion.div
                  key={`${stat.method}-${stat.endpoint}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "p-4 rounded-lg border border-border space-y-3",
                    getLatencyBg(stat.lastLatency)
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getMethodColor(stat.method)}>
                          {stat.method}
                        </Badge>
                        <code className="text-sm font-mono text-foreground truncate">
                          {stat.endpoint}
                        </code>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Last</p>
                      <p className={cn("text-2xl font-bold", getLatencyColor(stat.lastLatency))}>
                        {stat.lastLatency}ms
                      </p>
                    </div>
                  </div>

                  {/* Endpoint Latency Gauge */}
                  <div className="pt-2">
                    <LatencyGauge latency={stat.lastLatency} label="Last Request" max={500} />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 text-xs pt-2 border-t border-border/50">
                    <div>
                      <p className="text-muted-foreground">Avg</p>
                      <p className="font-semibold text-foreground">{Math.round(stat.avgLatency)}ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">{stat.minLatency}ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Max</p>
                      <p className="font-semibold text-red-600 dark:text-red-400">{stat.maxLatency}ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Count</p>
                      <p className="font-semibold text-foreground">{stat.count}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Requests */}
      {metrics.length > 0 && (
        <div className="admin-card p-6">
          <h3 className="text-xl font-bold mb-4 text-foreground">Recent Requests</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {metrics.slice(0, 20).map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "p-3 rounded-lg border border-border flex items-center justify-between",
                  getLatencyBg(metric.latency)
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Badge className={getMethodColor(metric.method)} variant="outline">
                    {metric.method}
                  </Badge>
                  <code className="text-sm font-mono text-foreground truncate">
                    {metric.endpoint}
                  </code>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn("text-sm font-semibold", getLatencyColor(metric.latency))}>
                    {metric.latency}ms
                  </span>
                  <Badge variant={metric.status === 200 ? "default" : "destructive"}>
                    {metric.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Raw JSON Data Viewer */}
      {rawData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-card"
        >
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-foreground">Raw API Response</h3>
              <Badge variant="outline" className="text-xs">JSON</Badge>
            </div>
            {showRawData ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {showRawData && (
            <div className="border-t border-border p-6 space-y-4">
              <div className="bg-muted/50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto font-mono text-xs">
                <pre className="text-foreground whitespace-pre-wrap break-words">
                  {JSON.stringify(rawData, null, 2)}
                </pre>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(rawData, null, 2))
                  setCopiedIndex(0)
                  setTimeout(() => setCopiedIndex(null), 2000)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-semibold"
              >
                {copiedIndex === 0 ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy JSON
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Performance Data Breakdown */}
      {rawData && rawData.performance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-card p-6 space-y-4"
        >
          <h3 className="text-lg font-bold text-foreground">Performance Data Breakdown</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dashboard Stats */}
            {rawData.dashboardStats && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">Dashboard Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Orders:</span>
                    <span className="font-semibold">{rawData.dashboardStats.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Revenue:</span>
                    <span className="font-semibold">${rawData.dashboardStats.totalRevenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Users:</span>
                    <span className="font-semibold">{rawData.dashboardStats.activeUsers}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Stats */}
            {rawData.performance && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">Performance Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Latency:</span>
                    <span className="font-semibold">{rawData.performance.avgLatency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Latency:</span>
                    <span className="font-semibold">{rawData.performance.maxLatency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Latency:</span>
                    <span className="font-semibold">{rawData.performance.minLatency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Requests:</span>
                    <span className="font-semibold">{rawData.performance.recentRequests?.length || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Requests Details */}
          {rawData.performance?.recentRequests && rawData.performance.recentRequests.length > 0 && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold text-foreground mb-3">Recent Requests ({rawData.performance.recentRequests.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {rawData.performance.recentRequests.slice(0, 10).map((req: any, idx: number) => (
                  <div key={idx} className="text-xs bg-background/50 p-2 rounded border border-border">
                    <div className="flex justify-between mb-1">
                      <span className="font-mono text-primary">{req.method} {req.endpoint}</span>
                      <span className={cn(
                        "font-semibold",
                        req.status === 200 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {req.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>{req.latency}ms</span>
                      <span>{new Date(req.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {!isMonitoring && metrics.length === 0 && (
        <div className="admin-card text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Click "Start Tracking" to begin monitoring API performance</p>
        </div>
      )}
    </motion.div>
  )
}
