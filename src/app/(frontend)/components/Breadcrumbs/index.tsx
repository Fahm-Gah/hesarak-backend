import React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export const Breadcrumbs = ({ items, className = '' }: BreadcrumbsProps) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      {items.map((item: BreadcrumbItem, index: number) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronLeft className="w-4 h-4 text-gray-400 mx-2" />}
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-gray-600 hover:text-orange-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={`${
                index === items.length - 1 ? 'text-orange-600 font-medium' : 'text-gray-600'
              }`}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
