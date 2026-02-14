'use client'

import * as React from 'react'
import { cn } from '../utils/cn'

export interface SwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, ...props }, ref) => {
    return (
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              'h-6 w-11 rounded-full bg-navy-700 transition-colors',
              'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-forge-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-navy-950',
              'peer-checked:bg-forge-600',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              className
            )}
          >
            <div
              className={cn(
                'absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform',
                'peer-checked:translate-x-5'
              )}
            />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-white">{label}</span>
            )}
            {description && (
              <span className="text-sm text-navy-400">{description}</span>
            )}
          </div>
        )}
      </label>
    )
  }
)
Switch.displayName = 'Switch'

export { Switch }
