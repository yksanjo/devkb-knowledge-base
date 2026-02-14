'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-forge-500 focus:ring-offset-2 focus:ring-offset-navy-950',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-forge-500/10 text-forge-400 hover:bg-forge-500/20',
        secondary:
          'border-transparent bg-navy-800 text-navy-200 hover:bg-navy-700',
        destructive:
          'border-transparent bg-red-500/10 text-red-400 hover:bg-red-500/20',
        outline: 'text-navy-300 border-navy-700',
        success:
          'border-transparent bg-green-500/10 text-green-400 hover:bg-green-500/20',
        warning:
          'border-transparent bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
