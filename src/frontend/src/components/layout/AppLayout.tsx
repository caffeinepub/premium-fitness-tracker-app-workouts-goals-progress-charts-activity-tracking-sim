import { ReactNode } from 'react';
import PrimaryNav from './PrimaryNav';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <PrimaryNav />
      <main className="pb-20 md:pb-0 md:pl-64">
        <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
