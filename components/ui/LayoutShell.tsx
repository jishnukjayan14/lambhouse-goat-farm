'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import SidebarWrapper from '@/components/ui/Sidebar';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0 h-full border-r border-green-900">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <SidebarWrapper />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto lg:pt-0 pt-14">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
