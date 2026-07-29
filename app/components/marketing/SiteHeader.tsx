'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { productCategories, getProductsByCategory } from '../../../lib/products/catalog';
import { getProductDisplayName } from '../../../lib/products/types';
import { ProductIcon, ChevronDownIcon, MenuIcon, CloseIcon } from './icons';

const staticNavLinks = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/#industries', label: 'Industries' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function SiteHeader() {
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setProductsOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setProductsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const categoriesWithProducts = productCategories
    .map((category) => ({ category, products: getProductsByCategory(category.id) }))
    .filter((entry) => entry.products.length > 0);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
        <Link href="/" className="rounded text-xl font-semibold tracking-tight text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          Oxiom
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setProductsOpen((open) => !open)}
              aria-expanded={productsOpen}
              aria-haspopup="true"
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Platform
              <ChevronDownIcon size={14} className={`transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
            </button>
            {productsOpen && (
              <div className="absolute left-1/2 top-full mt-2 w-[36rem] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  {categoriesWithProducts.map(({ category, products }) => (
                    <div key={category.id}>
                      <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{category.label}</p>
                      <ul className="mt-2 space-y-1">
                        {products.map((product) => (
                          <li key={product.id}>
                            <Link
                              href={product.learnMoreHref}
                              onClick={() => setProductsOpen(false)}
                              className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                <ProductIcon icon={product.icon} size={16} />
                              </span>
                              <span>
                                <span className="block text-sm font-semibold text-slate-950">{getProductDisplayName(product)}</span>
                                <span className="block text-xs leading-5 text-slate-500">{product.tagline}</span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <Link
                    href="/platform"
                    onClick={() => setProductsOpen(false)}
                    className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                  >
                    View all products →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {staticNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            Login
          </Link>
          <Link href="/trial" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
            Start Free Trial
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
        >
          {mobileOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-8">
            <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Platform</p>
            {categoriesWithProducts.flatMap(({ products }) => products).map((product) => (
              <Link
                key={product.id}
                href={product.learnMoreHref}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {getProductDisplayName(product)}
              </Link>
            ))}
            <div className="my-2 border-t border-slate-100" />
            {staticNavLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-800">
                Login
              </Link>
              <Link href="/trial" onClick={() => setMobileOpen(false)} className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
                Start Free Trial
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
