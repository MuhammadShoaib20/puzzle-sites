import { getSettings, getAllCategories } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import AdSlot from '@/components/AdSlot';
import BackgroundDecor from '@/components/BackgroundDecor';
import HomeScrollControls from '@/components/HomeScrollControls';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getAllCategories(),
  ]);

  return (
    <>
      <BackgroundDecor />
      <div className="site-content min-h-screen flex flex-col">
      <HomeScrollControls />
      {settings?.google_analytics_id && (
        <GoogleAnalytics gaId={settings.google_analytics_id} />
      )}
      <Navbar settings={settings} />
      {settings?.adsense_header && (
        <div className="container-page">
          <AdSlot code={settings.adsense_header} label="Header" />
        </div>
      )}
      <main className="flex-1">{children}</main>
      {settings?.adsense_footer && (
        <div className="container-page">
          <AdSlot code={settings.adsense_footer} label="Footer" />
        </div>
      )}
      <Footer settings={settings} categories={categories} />
    </div>
    </>
  );
}
