'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Menu, X, Sun, Moon, Search } from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Explorer', href: '/explorer' },
  { name: 'Transactions', href: '/transactions' },
  { name: 'Blocks', href: '/blocks' },
  { name: 'Analytics', href: '/analytics' },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search functionality
    console.log('Search for:', searchQuery)
    setSearchQuery('')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="relative z-50 bg-white dark:bg-slate-900 shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-base-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </span>
            <span className="text-xl font-semibold text-base-blue-800 dark:text-white">BaseIndexer</span>
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-semibold leading-6 ${
                pathname === item.href
                  ? 'text-base-blue-600 dark:text-base-blue-400'
                  : 'text-gray-700 dark:text-gray-200 hover:text-base-blue-600 dark:hover:text-base-blue-400'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tx, address, block..."
              className="rounded-full py-1.5 px-4 pl-10 w-64 bg-gray-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-base-blue-500 text-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </form>
          
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-300 hover:text-base-blue-600 dark:hover:text-base-blue-400"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-slate-900 px-6 py-6 sm:max-w-sm">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-base-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </span>
                <span className="text-xl font-semibold text-base-blue-800 dark:text-white">BaseIndexer</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <form onSubmit={handleSearch} className="relative my-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by tx, address, block..."
                      className="rounded-full py-2 px-4 pl-10 w-full bg-gray-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-base-blue-500"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </form>
                  
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                        pathname === item.href
                          ? 'text-base-blue-600 dark:text-base-blue-400'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6 flex justify-between items-center">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun size={18} />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon size={18} />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}