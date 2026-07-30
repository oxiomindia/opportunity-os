import type { Metadata } from 'next';
import SiteHeader from './components/marketing/SiteHeader';
import SiteFooter from './components/marketing/SiteFooter';
import Hero from './components/marketing/Hero';
import PlatformOverview from './components/marketing/PlatformOverview';
import WhyOxiom from './components/marketing/WhyOxiom';
import BusinessSolutions from './components/marketing/BusinessSolutions';
import ProductCategoriesOverview from './components/marketing/ProductCategoriesOverview';
import Industries from './components/marketing/Industries';
import WhyChooseOxiom from './components/marketing/WhyChooseOxiom';
import Testimonials from './components/marketing/Testimonials';
import DemoCta from './components/marketing/DemoCta';
import ContactSales from './components/marketing/ContactSales';
import { buildMetadata } from '../lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  path: '/',
  title: 'Oxiom | Finance Automation Platform for Accounts Payable & Receivable',
  description: 'Oxiom is a finance automation platform for growing businesses — Accounts Payable, Accounts Receivable, and Finance Suite, built on one secure workspace.',
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <SiteHeader />
      <main>
        <Hero />
        <PlatformOverview />
        <WhyOxiom />
        <BusinessSolutions />
        <ProductCategoriesOverview />
        <Industries />
        <WhyChooseOxiom />
        <Testimonials />
        <DemoCta />
        <ContactSales />
      </main>
      <SiteFooter />
    </div>
  );
}
