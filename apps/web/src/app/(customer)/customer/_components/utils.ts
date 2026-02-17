import {
  Trees,
  Droplets,
  Paintbrush,
  Grid3X3,
  Home as HomeIcon,
  Shield,
  Wrench,
  Sparkles,
  Scissors,
  Bug,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export function getCategoryIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes('lawn') || n.includes('landscap')) return Trees;
  if (n.includes('pressure') || n.includes('wash')) return Droplets;
  if (n.includes('paint')) return Paintbrush;
  if (n.includes('window')) return Grid3X3;
  if (n.includes('gutter')) return HomeIcon;
  if (n.includes('roof')) return Shield;
  if (n.includes('pest') || n.includes('bug')) return Bug;
  if (n.includes('light') || n.includes('electric')) return Zap;
  if (n.includes('clean')) return Sparkles;
  if (n.includes('trim') || n.includes('hedge')) return Scissors;
  return Wrench;
}

export const CATEGORY_COLORS = [
  { bg: 'bg-emerald-500/10', icon: 'text-emerald-400' },
  { bg: 'bg-blue-500/10', icon: 'text-blue-400' },
  { bg: 'bg-amber-500/10', icon: 'text-amber-400' },
  { bg: 'bg-purple-500/10', icon: 'text-purple-400' },
  { bg: 'bg-rose-500/10', icon: 'text-rose-400' },
  { bg: 'bg-teal-500/10', icon: 'text-teal-400' },
];

export function formatPrice(price: number | string, unit?: string) {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  const str = `$${num.toFixed(2)}`;
  if (unit === 'SQFT') return `${str}/sq ft`;
  if (unit === 'HOUR') return `${str}/hr`;
  return str;
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getDateString() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export const STEPS = ['Category', 'Service', 'Property', 'Review'];

export interface PropertySummary {
  property: {
    id: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  activeJobsCount: number;
  openJobsCount: number;
  lastCompletedJob: {
    id: string;
    serviceName: string;
    completedAt: string;
    service: any;
    property: any;
  } | null;
}

export function groupDataByProperty(
  properties: {
    id: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  }[],
  jobs: {
    id: string;
    status: string;
    propertyId: string;
    completedAt?: string | null;
    service: { name: string };
    property: any;
  }[],
): PropertySummary[] {
  return properties.map((property) => {
    const propertyJobs = jobs.filter((j) => j.propertyId === property.id);

    const activeJobsCount = propertyJobs.filter((j) =>
      ['SCHEDULED', 'IN_PROGRESS'].includes(j.status),
    ).length;
    const openJobsCount = propertyJobs.filter(
      (j) => j.status === 'OPEN' || j.status === 'PENDING',
    ).length;

    const completedJobs = propertyJobs
      .filter((j) => j.status === 'COMPLETED' && j.completedAt)
      .sort(
        (a, b) =>
          new Date(b.completedAt!).getTime() -
          new Date(a.completedAt!).getTime(),
      );
    const lastCompletedJob = completedJobs[0]
      ? {
          id: completedJobs[0].id,
          serviceName: completedJobs[0].service.name,
          completedAt: completedJobs[0].completedAt!,
          service: completedJobs[0].service,
          property: completedJobs[0].property,
        }
      : null;

    return {
      property,
      activeJobsCount,
      openJobsCount,
      lastCompletedJob,
    };
  });
}
