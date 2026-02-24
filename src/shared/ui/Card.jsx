
import { createElement } from 'react'
import { cn } from '../lib/cn.js'

export function Card({ as: Component = 'div', className, children, ...props }) {
  return createElement(
    Component,
    {
      className: cn(
        'rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg',
        className
      ),
      ...props,
    },
    children
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('p-8 border-b border-gray-100 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ as: Component = 'h3', className, children, ...props }) {
  return createElement(
    Component,
    {
      className: cn('font-bold text-gray-900 text-xl', className),
      ...props,
    },
    children
  )
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn('p-8', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('p-8 border-t border-gray-100', className)} {...props}>
      {children}
    </div>
  )

}
