"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void
    success: (message: string, duration?: number) => void
    error: (message: string, duration?: number) => void
    info: (message: string, duration?: number) => void
    warning: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within ToastProvider")
    }
    return context
}

const TOAST_ICONS = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle
}

const TOAST_STYLES = {
    success: "bg-primary text-primary-foreground border-primary/20",
    error: "bg-destructive text-destructive-foreground border-destructive/20",
    info: "bg-accent text-accent-foreground border-accent/20",
    warning: "bg-secondary text-secondary-foreground border-secondary/20"
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const showToast = useCallback((message: string, type: ToastType = "info", duration = 3000) => {
        const id = Math.random().toString(36).substring(2, 9)
        const toast: Toast = { id, message, type, duration }

        setToasts(prev => [...prev, toast])

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration)
        }
    }, [removeToast])

    const success = useCallback((message: string, duration?: number) => {
        showToast(message, "success", duration)
    }, [showToast])

    const error = useCallback((message: string, duration?: number) => {
        showToast(message, "error", duration)
    }, [showToast])

    const info = useCallback((message: string, duration?: number) => {
        showToast(message, "info", duration)
    }, [showToast])

    const warning = useCallback((message: string, duration?: number) => {
        showToast(message, "warning", duration)
    }, [showToast])

    return (
        <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-20 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => {
                        const Icon = TOAST_ICONS[toast.type]
                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md pointer-events-auto min-w-[300px] max-w-[400px]",
                                    TOAST_STYLES[toast.type]
                                )}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <p className="flex-1 text-sm font-medium">{toast.message}</p>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}
