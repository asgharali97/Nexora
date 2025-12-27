'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/src/components/Navbar';


export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  const isDashboard = () => {
    if (!pathname) return false;
    
    const dashboardPatterns = [
      /^\/[^/]+\/dashboard*/,
      /^\/[^/]+\/analytics/,
      /^\/[^/]+\/settings/,
      /^\/[^/]+\/setup/,
      /^\/[^/]+\/events/,
    ];
    
    return dashboardPatterns.some(pattern => pattern.test(pathname));
  };

  if (isDashboard()) {
    return null;
  }

  return <Navbar />;
}