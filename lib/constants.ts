// Constants for Lambhouse Goat Farm Management App

import type { GoatBreed, ExpenseCategory, ManureType } from './types';

export const FARM_NAME = 'The Lamb House Goat Farm';
export const FARM_ADDRESS = 'Mananthavady, Wayanad (Dist.) Kerala – 670645';
export const FARM_PHONE1 = '7306874214';
export const FARM_PHONE2 = '9061237526';
export const FARM_PHONE3 = '7902650760';
export const FARM_UPI = '7306874214-2@ybl';
export const FARMLINK_WHATSAPP_PHONE = '916235034409';
export const FARMLINK_WHATSAPP_LINK = 'https://wa.me/916235034409';

export const DEFAULT_MILK_RATE = 30; // ₹ per glass
export const ML_PER_GLASS = 200;

// Goat breeds with display names and Tailwind color classes
export const GOAT_BREEDS: Record<
  GoatBreed,
  { label: string; color: string; bgColor: string; hex: string }
> = {
  ajmeri: {
    label: 'Ajmeri',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    hex: '#1d4ed8',
  },
  jamnabari: {
    label: 'Jamnabari',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    hex: '#7e22ce',
  },
  hyderabadi: {
    label: 'Hyderabadi',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    hex: '#c2410c',
  },
  malabari: {
    label: 'Malabari',
    color: 'text-teal-700',
    bgColor: 'bg-teal-100',
    hex: '#0f766e',
  },
  beetal: {
    label: 'Beetal',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    hex: '#b91c1c',
  },
  mixed: {
    label: 'Mixed',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    hex: '#374151',
  },
  other: {
    label: 'Other',
    color: 'text-zinc-700',
    bgColor: 'bg-zinc-100',
    hex: '#52525b',
  },
};

// Expense categories with icons (Lucide icon names) and colors
export const EXPENSE_CATEGORIES: Record<
  ExpenseCategory,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  feed: {
    label: 'Feed & Fodder',
    icon: 'Wheat',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  medicine: {
    label: 'Medicine',
    icon: 'Pill',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
  veterinary: {
    label: 'Veterinary',
    icon: 'Stethoscope',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  labor: {
    label: 'Labor',
    icon: 'Users',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
  },
  equipment: {
    label: 'Equipment',
    icon: 'Wrench',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  transport: {
    label: 'Transport',
    icon: 'Truck',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  utilities: {
    label: 'Utilities',
    icon: 'Zap',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-100',
  },
  miscellaneous: {
    label: 'Miscellaneous',
    icon: 'Package',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
};

// Manure types with default rates
export const MANURE_TYPES: Record<
  ManureType,
  { label: string; default_rate: number; unit: string }
> = {
  raw: {
    label: 'Raw Manure',
    default_rate: 200,
    unit: 'per 50kg bag',
  },
  granules: {
    label: 'Granules',
    default_rate: 200,
    unit: 'per 50kg bag',
  },
  powder: {
    label: 'Powder',
    default_rate: 400,
    unit: 'per 50kg bag',
  },
  custom: {
    label: 'Custom',
    default_rate: 0,
    unit: 'custom',
  },
};

// Milk quick options
export const MILK_QUICK_OPTIONS = [
  { label: '1 Glass', glasses: 1 },
  { label: '2 Glasses', glasses: 2 },
  { label: '½ Litre', glasses: 2.5 },
  { label: '1 Litre', glasses: 5 },
];

// Pie chart colors for breed distribution
export const PIE_COLORS = [
  '#1d4ed8', // blue - ajmeri
  '#7e22ce', // purple - jamnabari
  '#c2410c', // orange - hyderabadi
  '#0f766e', // teal - malabari
  '#b91c1c', // red - beetal
  '#374151', // gray - mixed
  '#52525b', // zinc - other
];

// Nav items for sidebar
export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/milk', label: 'Milk', icon: 'Droplets' },
  { href: '/manure', label: 'Manure', icon: 'Leaf' },
  { href: '/expenses', label: 'Expenses', icon: 'Receipt' },
  { href: '/goats', label: 'Goats', icon: 'Heart' },
  { href: '/customers', label: 'Customers', icon: 'Users' },
  { href: '/invoice', label: 'Invoice', icon: 'FileText' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
];
