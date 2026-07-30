import SiteHeader from '../components/marketing/SiteHeader';
import SiteFooter from '../components/marketing/SiteFooter';

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
