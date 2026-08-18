'use client';

import { PropertyCarousel } from '../(customer)/customer/_components/property-carousel';
import type { PropertySummary } from '../(customer)/customer/_components/utils';

const SUMMARIES: PropertySummary[] = [
  {
    property: {
      id: '1',
      address: '2211 Preston Rd',
      city: 'Frisco',
      state: 'TX',
      zip: '75034',
      imageUrl:
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=640&h=320&fit=crop',
    },
    activeJobsCount: 1,
    openJobsCount: 0,
    lastCompletedJob: {
      id: 'j1',
      serviceName: 'Sidewalk & Walkway Wash',
      completedAt: new Date().toISOString(),
      service: { id: 's1', name: 'Sidewalk & Walkway Wash' },
      property: { id: '1' },
    },
  },
  {
    property: {
      id: '2',
      address: '1200 Lakeview Circle',
      city: 'Arlington',
      state: 'TX',
      zip: '76013',
      imageUrl:
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=640&h=320&fit=crop',
    },
    activeJobsCount: 1,
    openJobsCount: 2,
    lastCompletedJob: null,
  },
  {
    property: {
      id: '3',
      address: '509 W Commerce St',
      city: 'Dallas',
      state: 'TX',
      zip: '75208',
      imageUrl: null,
    },
    activeJobsCount: 0,
    openJobsCount: 0,
    lastCompletedJob: null,
  },
];

export default function PropertyCardPreview() {
  return (
    <div className="p-10 mx-auto space-y-10 max-w-6xl">
      <PropertyCarousel summaries={SUMMARIES} />
    </div>
  );
}
