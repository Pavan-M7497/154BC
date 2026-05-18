'use client'

import Link from 'next/link'

interface OrderButtonsProps {
  variant?: 'inline' | 'full'
  className?: string
}

export function OrderButtons({ variant = 'inline', className = '' }: OrderButtonsProps) {
  if (variant === 'full') {
    return (
      <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <a
          href="https://www.swiggy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-swiggy text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.034 0C5.385 0 0 5.385 0 12.034s5.385 12.034 12.034 12.034 12.034-5.385 12.034-12.034S18.683 0 12.034 0zm-.88 5.523c.553 0 1.002.449 1.002 1.002v4.008c0 .553-.449 1.002-1.002 1.002s-1.002-.449-1.002-1.002V6.525c0-.553.449-1.002 1.002-1.002zm3.91 0c.553 0 1.002.449 1.002 1.002v4.008c0 .553-.449 1.002-1.002 1.002s-1.002-.449-1.002-1.002V6.525c0-.553.449-1.002 1.002-1.002zm-6.006 7.514h6.006c.553 0 1.002.449 1.002 1.002 0 1.657-1.343 3.003-3.003 3.003s-3.003-1.346-3.003-3.003c0-.553.449-1.002 1.002-1.002z" />
          </svg>
          Order on Swiggy
        </a>
        <a
          href="https://www.zomato.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-zomato text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.568 7.821c-.037.182-.219.328-.41.328h-7.86a.424.424 0 01-.416-.328l-1.58-7.821a.418.418 0 01.416-.511h10.996c.27 0 .467.236.422.511z" />
          </svg>
          Order on Zomato
        </a>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-mocha text-sm">Order Online:</span>
      <a
        href="https://www.swiggy.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-swiggy/10 text-swiggy px-4 py-2 rounded-lg text-sm font-medium hover:bg-swiggy hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.034 0C5.385 0 0 5.385 0 12.034s5.385 12.034 12.034 12.034 12.034-5.385 12.034-12.034S18.683 0 12.034 0zm-.88 5.523c.553 0 1.002.449 1.002 1.002v4.008c0 .553-.449 1.002-1.002 1.002s-1.002-.449-1.002-1.002V6.525c0-.553.449-1.002 1.002-1.002zm3.91 0c.553 0 1.002.449 1.002 1.002v4.008c0 .553-.449 1.002-1.002 1.002s-1.002-.449-1.002-1.002V6.525c0-.553.449-1.002 1.002-1.002zm-6.006 7.514h6.006c.553 0 1.002.449 1.002 1.002 0 1.657-1.343 3.003-3.003 3.003s-3.003-1.346-3.003-3.003c0-.553.449-1.002 1.002-1.002z" />
        </svg>
        Swiggy
      </a>
      <a
        href="https://www.zomato.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-zomato/10 text-zomato px-4 py-2 rounded-lg text-sm font-medium hover:bg-zomato hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.568 7.821c-.037.182-.219.328-.41.328h-7.86a.424.424 0 01-.416-.328l-1.58-7.821a.418.418 0 01.416-.511h10.996c.27 0 .467.236.422.511z" />
        </svg>
        Zomato
      </a>
    </div>
  )
}
