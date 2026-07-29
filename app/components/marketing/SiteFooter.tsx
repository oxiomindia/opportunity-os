import Link from 'next/link';
import { getPublicProducts } from '../../../lib/products/catalog';
import { getProductDisplayName } from '../../../lib/products/types';

const salesEmail = 'oximindia@gmail.com';

const companyLinks = [
  { href: '/about', label: 'About' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/docs', label: 'Docs' },
  { href: '/security', label: 'Security' },
  { href: '/faq', label: 'FAQ' },
];

const legalLinks = [
  { href: '/legal/terms', label: 'Terms of Service' },
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/data-processing', label: 'Data Processing' },
  { href: '/legal/cookies', label: 'Cookies' },
];

export default function SiteFooter() {
  // Cap the footer's product list so it stays a fixed, predictable size no
  // matter how many products the catalog grows to — the full, always-current
  // list lives at /platform.
  const featuredProducts = getPublicProducts().slice(0, 5);

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-5 lg:px-10">
        <div className="lg:col-span-2">
          <p className="text-xl font-semibold text-white">Oxiom</p>
          <p className="mt-3 max-w-sm text-sm leading-6">
            Oxiom builds finance automation software for growing businesses — from a single product to a full commercial platform.
          </p>
          <div className="mt-5 flex flex-col gap-1 text-sm">
            <a href={`mailto:${salesEmail}`} className="w-fit hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              {salesEmail}
            </a>
          </div>
        </div>

        <nav aria-label="Product links">
          <p className="font-semibold text-white">Products</p>
          <ul className="mt-3 space-y-2 text-sm">
            {featuredProducts.map((product) => (
              <li key={product.id}>
                <Link href={product.learnMoreHref} className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                  {getProductDisplayName(product)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/platform" className="font-semibold text-blue-400 hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                View all products →
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Company links">
          <p className="font-semibold text-white">Company</p>
          <ul className="mt-3 space-y-2 text-sm">
            {companyLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Legal links">
          <p className="font-semibold text-white">Legal</p>
          <ul className="mt-3 space-y-2 text-sm">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-slate-800 px-5 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Oxiom. All rights reserved.
      </div>
    </footer>
  );
}
