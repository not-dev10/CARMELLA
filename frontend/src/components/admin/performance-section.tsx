import { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import { Activity, TrendingUp, AlertCircle, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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

  // Parse console logs to extract latency data
  useEffect(() => {
    if (!isMonitoring) return

    const originalLog = console.log
    const originalError = console.error

    const parseLatencyLog = (message: string) => {
      // Match [LATENCY] logs from backend
      const latencyMatch = message.match(/\[LATENCY\]\s+(\w+)\s+(\/[\w\/\-]*)\s+-\s+Status:\s+(\d+)\s+-\s+(\d+)ms/)
      if (latencyMatch) {
        const [, method, endpoint, status, latencyStr] = latencyMatch
        const metric: LatencyMetric = {
          endpoint,
          method,
          latency: parseInt(latencyStr),
          timestamp: Date.now(),
          status: parseInt(status),
        }
        
        setMetrics(prev => {
          const updated = [metric, ...prev].slice(0, 100) // Keep last 100
          updateStats(updated)
          return updated
        })
      }
    }

    console.log = function(...args: any[]) {
      const message = args[0]?.toString() || ''
      parseLatencyLog(message)
      originalLog.apply(console, args)
    }

    console.error = function(...args: any[]) {
      const message = args[0]?.toString() || ''
      parseLatencyLog(message)
      originalError.apply(console, args)
    }

    return () => {
      console.log = originalLog
      console.error = originalError
    }
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
      <div className="admin-card p-4">
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={cn(
            "px-6 py-2 rounded-lg font-semibold transition-all",
            isMonitoring
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          )}
        >
          {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
        </button>
        <p className="text-xs text-muted-foreground mt-2">
          {isMonitoring ? "Monitoring active - check console logs" : "Click to start monitoring API latency"}
        </p>
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

      {/* Endpoint Stats */}
      {stats.size > 0 && (
        <div className="admin-card p-6">
          <h3 className="text-xl font-bold mb-4 text-foreground">Endpoint Statistics</h3>
          <div className="space-y-3">
            {Array.from(stats.values())
              .sort((a, b) => b.lastLatency - a.lastLatency)
              .map((stat, idx) => (
                <motion.div
                  key={`${stat.method}-${stat.endpoint}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "p-4 rounded-lg border border-border",
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
                      <div className="grid grid-cols-4 gap-2 text-xs">
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
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Last</p>
                      <p className={cn("text-2xl font-bold", getLatencyColor(stat.lastLatency))}>
                        {stat.lastLatency}ms
                      </p>
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

      {!isMonitoring && metrics.length === 0 && (
        <div className="admin-card text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Click "Start Monitoring" to begin tracking API latency</p>
        </div>
      )}
    </motion.div>
  )
}
