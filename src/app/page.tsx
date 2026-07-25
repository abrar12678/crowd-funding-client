import Hero from '@/components/Hero';
import TopCampaigns from '@/components/TopCampaigns';
import HowItWorks from '@/components/HowItWorks';
import Categories from '@/components/Categories';
import PlatformImpact from '@/components/PlatformImpact';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <Hero />
      <HowItWorks />
      <TopCampaigns />
      <Categories />
      <PlatformImpact />
      <Testimonials />
      <Footer />
    </div>
  );
}
