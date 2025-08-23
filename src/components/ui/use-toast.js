'use client'

import { useState, useCallback } from 'react'

// Simple toast implementation
const toasts = []
let toastId = 0

export function useToast() {
  const [, forceUpdate] = useState({})

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = toastId++
    const newToast = {
      id,
      title,
      description,
      variant,
      timestamp: Date.now()
    }
    
    toasts.push(newToast)
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id)
      if (index > -1) {
        toasts.splice(index, 1)
        forceUpdate({})
      }
    }, 5000)
    
    // Log to console for now (simple implementation)
    console.log(`Toast ${variant}: ${title}`, description)
    
    forceUpdate({})
    return newToast
  }, [])

  return { toast, toasts }
}