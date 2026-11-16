'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Droplets,
  Leaf,
  Receipt,
  Heart,
  Bell,
  Users,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/milk', label: 'Milk', icon: Droplets },
  { href: '/manure', label: 'Manure', icon: Leaf },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/goats', label: 'Goats', icon: Heart },
  { href: '/reminders', label: 'Reminders & Care', icon: Bell },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/invoice', label: 'Invoice', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-all duration-150 group ${
        active
          ? 'bg-green-600 text-white shadow-sm'
          : 'text-green-100 hover:bg-green-800 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
    </Link>
  );
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const handleLogout = () => {
    document.cookie = 'farm_auth=; path=/; max-age=0';
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col h-full bg-[#1a3a1f] text-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-green-800">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-500 flex-shrink-0 bg-green-900 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="Logo"
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white leading-tight truncate">
            The Lamb House
          </p>
          <p className="text-xs text-green-300 truncate">Goat Farm</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded-md text-green-300 hover:text-white hover:bg-green-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
            }
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-green-800 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-green-300 hover:bg-green-800 hover:text-white transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
        <p className="text-xs text-green-600 text-center mt-3 leading-relaxed">
          Mananthavady, Wayanad
          <br />
          Kerala – 670645
        </p>
      </div>
    </div>
  );
}

export default function SidebarWrapper() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  const pathname = usePathname();
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setMobileOpen(false)} />
      </div>

      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#1a3a1f] text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-md text-green-300 hover:text-white hover:bg-green-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="w-7 h-7 rounded-full overflow-hidden border border-green-500 bg-green-900 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="Logo" width={28} height={28} className="w-full h-full object-cover" />
        </div>
        <span className="font-semibold text-sm">The Lamb House</span>
      </div>
    </>
  );
}
