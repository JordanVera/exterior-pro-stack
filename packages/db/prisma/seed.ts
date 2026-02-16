import { PrismaClient, PriceUnit } from '@prisma/client';
import chalk from 'chalk';

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

const divider = () => console.log(chalk.gray('─'.repeat(60)));

const header = (text: string) => {
  console.log();
  divider();
  console.log(chalk.bold.cyan(`  ${text}`));
  divider();
};

const success = (text: string) => console.log(chalk.green(`  ✔ ${text}`));
const info = (text: string) => console.log(chalk.blue(`  ℹ ${text}`));
const warn = (text: string) => console.log(chalk.yellow(`  ⚠ ${text}`));
const count = (label: string, n: number) =>
  console.log(chalk.white(`  ${chalk.bold.magenta(n)} ${label}`));

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log();
  console.log(chalk.bold.bgCyan.black(' EXTERIOR PRO — DATABASE SEEDER '));
  console.log();

  // ═══════════════════════════════════════════════════════════════════════════
  // SERVICE CATEGORIES
  // ═══════════════════════════════════════════════════════════════════════════

  header('Service Categories');

  const categoryData = [
    {
      name: 'Pressure Washing',
      description:
        'Professional pressure washing for driveways, siding, decks, and more.',
      icon: 'droplets',
      image:
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
    },
    {
      name: 'Lawn Maintenance',
      description:
        'Regular lawn care including mowing, edging, trimming, and blowing.',
      icon: 'grass',
      image:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    },
    {
      name: 'Landscaping',
      description:
        'Full landscaping services including design, planting, mulching, and hardscaping.',
      icon: 'trees',
      image:
        'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&q=80',
    },
    {
      name: 'Painting',
      description:
        'Exterior and interior painting for residential and commercial properties.',
      icon: 'paintbrush',
      image:
        'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&q=80',
    },
    {
      name: 'Window Cleaning',
      description: 'Professional window cleaning for homes and businesses.',
      icon: 'sparkles',
      image:
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80',
    },
    {
      name: 'Gutter Cleaning',
      description: 'Gutter cleaning, flushing, and minor repairs.',
      icon: 'home',
      image:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    },
    {
      name: 'Roof Cleaning',
      description: 'Soft wash roof cleaning to remove moss, algae, and stains.',
      icon: 'shield',
      image:
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80',
    },
    {
      name: 'Fence & Deck',
      description:
        'Fence repair, staining, deck restoration, and sealing services.',
      icon: 'fence',
      image:
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80',
    },
    {
      name: 'Holiday Lighting',
      description:
        'Professional holiday light installation, maintenance, and removal.',
      icon: 'lightbulb',
      image:
        'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=600&q=80',
    },
  ];

  const categories = await Promise.all(
    categoryData.map((cat) =>
      prisma.serviceCategory.upsert({
        where: { name: cat.name },
        update: {
          description: cat.description,
          icon: cat.icon,
          image: cat.image,
        },
        create: cat,
      }),
    ),
  );

  const catMap = Object.fromEntries(categories.map((c) => [c.name, c]));
  count('service categories', categories.length);

  // ═══════════════════════════════════════════════════════════════════════════
  // SERVICES
  // ═══════════════════════════════════════════════════════════════════════════

  header('Services');

  const serviceData: {
    category: string;
    name: string;
    description: string;
    basePrice: number;
    unit: PriceUnit;
  }[] = [
    // Pressure Washing
    {
      category: 'Pressure Washing',
      name: 'Driveway Pressure Wash',
      description: 'High-pressure cleaning of concrete or paver driveways.',
      basePrice: 150,
      unit: 'FLAT',
    },
    {
      category: 'Pressure Washing',
      name: 'House Siding Wash',
      description: 'Soft wash or pressure wash of exterior house siding.',
      basePrice: 250,
      unit: 'FLAT',
    },
    {
      category: 'Pressure Washing',
      name: 'Deck / Patio Wash',
      description: 'Pressure washing of wood or composite decks and patios.',
      basePrice: 175,
      unit: 'FLAT',
    },
    {
      category: 'Pressure Washing',
      name: 'Sidewalk & Walkway Wash',
      description: 'Pressure cleaning of concrete sidewalks and walkways.',
      basePrice: 100,
      unit: 'FLAT',
    },
    {
      category: 'Pressure Washing',
      name: 'Commercial Lot Wash',
      description:
        'Large-scale pressure washing for parking lots and commercial surfaces.',
      basePrice: 0.15,
      unit: 'SQFT',
    },
    // Lawn Maintenance
    {
      category: 'Lawn Maintenance',
      name: 'Weekly Lawn Mowing',
      description: 'Regular weekly mowing, edging, and blowing of clippings.',
      basePrice: 45,
      unit: 'FLAT',
    },
    {
      category: 'Lawn Maintenance',
      name: 'Bi-Weekly Lawn Mowing',
      description: 'Every-other-week mowing, edging, and blowing.',
      basePrice: 55,
      unit: 'FLAT',
    },
    {
      category: 'Lawn Maintenance',
      name: 'Lawn Fertilization',
      description:
        'Seasonal fertilization treatment for a healthy, green lawn.',
      basePrice: 75,
      unit: 'FLAT',
    },
    {
      category: 'Lawn Maintenance',
      name: 'Hedge Trimming',
      description: 'Trimming and shaping of hedges and shrubs.',
      basePrice: 60,
      unit: 'HOUR',
    },
    {
      category: 'Lawn Maintenance',
      name: 'Leaf Removal',
      description: 'Seasonal leaf cleanup and disposal.',
      basePrice: 120,
      unit: 'FLAT',
    },
    {
      category: 'Lawn Maintenance',
      name: 'Weed Control Treatment',
      description: 'Pre- and post-emergent weed treatment for lawns and beds.',
      basePrice: 65,
      unit: 'FLAT',
    },
    // Landscaping
    {
      category: 'Landscaping',
      name: 'Landscape Design Consultation',
      description: 'Custom landscape design consultation and planning.',
      basePrice: 300,
      unit: 'FLAT',
    },
    {
      category: 'Landscaping',
      name: 'Mulch Installation',
      description: 'Delivery and spreading of mulch in garden beds.',
      basePrice: 3.5,
      unit: 'SQFT',
    },
    {
      category: 'Landscaping',
      name: 'Tree Planting',
      description: 'Professional tree planting with soil preparation.',
      basePrice: 200,
      unit: 'FLAT',
    },
    {
      category: 'Landscaping',
      name: 'Sod Installation',
      description: 'Remove old turf, prep soil, and lay fresh sod.',
      basePrice: 2.0,
      unit: 'SQFT',
    },
    {
      category: 'Landscaping',
      name: 'Flower Bed Design & Planting',
      description: 'Custom flower bed design with seasonal plant selection.',
      basePrice: 250,
      unit: 'FLAT',
    },
    {
      category: 'Landscaping',
      name: 'Retaining Wall Construction',
      description: 'Design and build decorative or structural retaining walls.',
      basePrice: 35,
      unit: 'SQFT',
    },
    // Painting
    {
      category: 'Painting',
      name: 'Exterior House Painting',
      description:
        'Full exterior paint job including prep, priming, and two coats.',
      basePrice: 3.0,
      unit: 'SQFT',
    },
    {
      category: 'Painting',
      name: 'Fence / Deck Staining',
      description: 'Staining and sealing of fences, decks, and pergolas.',
      basePrice: 2.5,
      unit: 'SQFT',
    },
    {
      category: 'Painting',
      name: 'Trim & Shutters Painting',
      description:
        'Scraping, priming, and painting of trim, shutters, and fascia.',
      basePrice: 500,
      unit: 'FLAT',
    },
    {
      category: 'Painting',
      name: 'Garage Floor Epoxy Coating',
      description:
        'Professional epoxy coating for garage floors including prep.',
      basePrice: 5.0,
      unit: 'SQFT',
    },
    // Window Cleaning
    {
      category: 'Window Cleaning',
      name: 'Interior & Exterior Window Cleaning',
      description: 'Full window cleaning including tracks and screens.',
      basePrice: 8.0,
      unit: 'FLAT',
    },
    {
      category: 'Window Cleaning',
      name: 'Exterior Only Window Cleaning',
      description: 'Exterior window cleaning using water-fed pole system.',
      basePrice: 5.0,
      unit: 'FLAT',
    },
    {
      category: 'Window Cleaning',
      name: 'Screen Cleaning & Repair',
      description: 'Window screen removal, cleaning, and minor repair.',
      basePrice: 4.0,
      unit: 'FLAT',
    },
    // Gutter Cleaning
    {
      category: 'Gutter Cleaning',
      name: 'Gutter Clean & Flush',
      description: 'Remove debris from gutters and flush downspouts.',
      basePrice: 150,
      unit: 'FLAT',
    },
    {
      category: 'Gutter Cleaning',
      name: 'Gutter Guard Installation',
      description: 'Install leaf guards to prevent future gutter clogs.',
      basePrice: 12,
      unit: 'SQFT',
    },
    // Roof Cleaning
    {
      category: 'Roof Cleaning',
      name: 'Soft Wash Roof Treatment',
      description:
        'Chemical soft wash to remove moss, algae, and black streaks.',
      basePrice: 350,
      unit: 'FLAT',
    },
    {
      category: 'Roof Cleaning',
      name: 'Moss Removal & Prevention',
      description: 'Manual moss removal with zinc-strip prevention treatment.',
      basePrice: 275,
      unit: 'FLAT',
    },
    // Fence & Deck
    {
      category: 'Fence & Deck',
      name: 'Fence Repair',
      description: 'Repair damaged or leaning fence sections.',
      basePrice: 75,
      unit: 'HOUR',
    },
    {
      category: 'Fence & Deck',
      name: 'Deck Sanding & Refinishing',
      description: 'Sand, stain, and seal wood decks for like-new finish.',
      basePrice: 4.0,
      unit: 'SQFT',
    },
    // Holiday Lighting
    {
      category: 'Holiday Lighting',
      name: 'Holiday Light Installation',
      description: 'Professional design and installation of holiday lighting.',
      basePrice: 500,
      unit: 'FLAT',
    },
    {
      category: 'Holiday Lighting',
      name: 'Holiday Light Removal & Storage',
      description: 'Post-season takedown, testing, and storage of light sets.',
      basePrice: 250,
      unit: 'FLAT',
    },
  ];

  // Delete existing services to avoid duplicates on re-seed.
  // Must remove dependents first (ProviderService, Quote -> Job -> JobAssignment, RecurringSchedule).
  await prisma.jobAssignment.deleteMany({});
  await prisma.recurringSchedule.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.quote.deleteMany({});
  await prisma.providerService.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.property.deleteMany({});

  info('Cleared existing services');

  const services = await Promise.all(
    serviceData.map((s) =>
      prisma.service.create({
        data: {
          categoryId: catMap[s.category].id,
          name: s.name,
          description: s.description,
          basePrice: s.basePrice,
          unit: s.unit,
        },
      }),
    ),
  );

  count('services', services.length);

  // Group for display
  const byCategory = serviceData.reduce(
    (acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  for (const [cat, n] of Object.entries(byCategory)) {
    console.log(chalk.gray(`    └ ${cat}: ${n} services`));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN USER
  // ═══════════════════════════════════════════════════════════════════════════

  header('Admin User');

  const adminUser = await prisma.user.upsert({
    where: { phone: '+10000000000' },
    update: {},
    create: {
      phone: '+10000000000',
      role: 'ADMIN',
      verified: true,
    },
  });

  success(
    `Admin — ${chalk.white(adminUser.phone)} (${chalk.dim(adminUser.id)})`,
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST CUSTOMERS
  // ═══════════════════════════════════════════════════════════════════════════

  header('Test Customers');

  const customerData = [
    {
      phone: '+15551001001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@example.com',
      properties: [
        {
          address: '742 Evergreen Terrace',
          city: 'Dallas',
          state: 'TX',
          zip: '75201',
          notes: 'Main residence, large front yard. Gate code: 4521',
        },
        {
          address: '8800 Maple Ridge Dr',
          city: 'Plano',
          state: 'TX',
          zip: '75024',
          notes: 'Rental property, contact tenant before arrival',
        },
      ],
    },
    {
      phone: '+15551002002',
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike.chen@example.com',
      properties: [
        {
          address: '315 Oak Hollow Blvd',
          city: 'Fort Worth',
          state: 'TX',
          zip: '76102',
          notes: 'Two-story, back gate is unlocked',
        },
      ],
    },
    {
      phone: '+15551003003',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.r@example.com',
      properties: [
        {
          address: '1200 Lakeview Circle',
          city: 'Arlington',
          state: 'TX',
          zip: '76013',
          notes: 'Lakefront property, be careful near the dock',
        },
        {
          address: '509 W Commerce St',
          city: 'Dallas',
          state: 'TX',
          zip: '75208',
          notes: 'Commercial storefront, after-hours access only',
        },
        {
          address: '2211 Preston Rd',
          city: 'Frisco',
          state: 'TX',
          zip: '75034',
          notes: 'New construction, no landscaping yet',
        },
      ],
    },
    {
      phone: '+15551004004',
      firstName: 'James',
      lastName: 'Williams',
      email: 'jwilliams@example.com',
      properties: [
        {
          address: '4401 Cedar Springs Rd',
          city: 'Dallas',
          state: 'TX',
          zip: '75219',
          notes: 'Corner lot with large trees',
        },
      ],
    },
    {
      phone: '+15551005005',
      firstName: 'Lisa',
      lastName: 'Park',
      email: '',
      properties: [
        {
          address: '777 Southlake Blvd',
          city: 'Southlake',
          state: 'TX',
          zip: '76092',
          notes: 'HOA requires 48hr notice for exterior work',
        },
        {
          address: '900 Main St Apt 12B',
          city: 'Grapevine',
          state: 'TX',
          zip: '76051',
          notes: 'Apartment — parking lot cleaning only',
        },
      ],
    },
  ];

  for (const cust of customerData) {
    const user = await prisma.user.upsert({
      where: { phone: cust.phone },
      update: {},
      create: {
        phone: cust.phone,
        role: 'CUSTOMER',
        verified: true,
      },
    });

    const profile = await prisma.customerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: cust.firstName,
        lastName: cust.lastName,
        email: cust.email || undefined,
      },
    });

    for (const prop of cust.properties) {
      await prisma.property.upsert({
        where: {
          id: `seed-prop-${cust.phone}-${prop.address.slice(0, 20).replace(/\s/g, '-')}`,
        },
        update: {},
        create: {
          customerId: profile.id,
          ...prop,
        },
      });
    }

    const propCount = cust.properties.length;
    success(
      `${cust.firstName} ${cust.lastName} ${chalk.gray(`(${cust.phone})`)} — ${chalk.yellow(propCount)} ${propCount === 1 ? 'property' : 'properties'}`,
    );
  }

  count('customers', customerData.length);
  count(
    'properties',
    customerData.reduce((sum, c) => sum + c.properties.length, 0),
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST PROVIDERS
  // ═══════════════════════════════════════════════════════════════════════════

  header('Test Providers');

  const providerData = [
    {
      phone: '+15552001001',
      businessName: 'DFW Power Wash Pros',
      description:
        'Top-rated pressure washing company serving the Dallas-Fort Worth metroplex since 2018. Residential and commercial.',
      serviceArea: 'Dallas, Fort Worth, Plano, Frisco, Arlington',
      verified: true,
      serviceNames: [
        'Driveway Pressure Wash',
        'House Siding Wash',
        'Deck / Patio Wash',
        'Sidewalk & Walkway Wash',
        'Commercial Lot Wash',
      ],
      crews: [
        {
          name: 'Alpha Team',
          members: [
            { name: 'Carlos Rivera', phone: '+15559001001', role: 'Lead' },
            { name: 'David Kim', phone: '+15559001002', role: 'Technician' },
            { name: 'Marcus Johnson', role: 'Helper' },
          ],
        },
        {
          name: 'Bravo Team',
          members: [
            { name: 'Jake Thompson', phone: '+15559001003', role: 'Lead' },
            { name: 'Andre Williams', role: 'Technician' },
          ],
        },
      ],
    },
    {
      phone: '+15552002002',
      businessName: 'GreenScape Lawn & Garden',
      description:
        'Full-service lawn care and landscaping. Weekly maintenance plans and one-time projects. Licensed and insured.',
      serviceArea: 'Plano, Frisco, McKinney, Allen, Richardson',
      verified: true,
      serviceNames: [
        'Weekly Lawn Mowing',
        'Bi-Weekly Lawn Mowing',
        'Lawn Fertilization',
        'Hedge Trimming',
        'Leaf Removal',
        'Weed Control Treatment',
        'Landscape Design Consultation',
        'Mulch Installation',
        'Tree Planting',
        'Sod Installation',
        'Flower Bed Design & Planting',
      ],
      crews: [
        {
          name: 'Mowing Crew A',
          members: [
            {
              name: 'Roberto Hernandez',
              phone: '+15559002001',
              role: 'Foreman',
            },
            { name: 'Luis Garcia', role: 'Operator' },
            { name: 'Kevin Nguyen', role: 'Trimmer' },
            { name: 'Sam Patel', role: 'Blower' },
          ],
        },
        {
          name: 'Mowing Crew B',
          members: [
            { name: 'Chris Evans', phone: '+15559002002', role: 'Foreman' },
            { name: 'Tyler Brooks', role: 'Operator' },
          ],
        },
        {
          name: 'Landscaping Crew',
          members: [
            { name: 'Maria Santos', phone: '+15559002003', role: 'Designer' },
            { name: 'Josh Miller', role: 'Installer' },
            { name: 'Alex Park', role: 'Installer' },
          ],
        },
      ],
    },
    {
      phone: '+15552003003',
      businessName: 'Texas Exterior Painters',
      description:
        'Expert exterior painting with premium paints. Color consultation included. 5-year warranty on all jobs.',
      serviceArea: 'Dallas, Southlake, Keller, Colleyville, Grapevine',
      verified: true,
      serviceNames: [
        'Exterior House Painting',
        'Fence / Deck Staining',
        'Trim & Shutters Painting',
        'Garage Floor Epoxy Coating',
      ],
      crews: [
        {
          name: 'Paint Crew 1',
          members: [
            {
              name: 'Tony Martinez',
              phone: '+15559003001',
              role: 'Lead Painter',
            },
            { name: "Brian O'Neill", role: 'Painter' },
            { name: 'Derek Jackson', role: 'Painter' },
            { name: 'Miguel Torres', role: 'Prep' },
          ],
        },
      ],
    },
    {
      phone: '+15552004004',
      businessName: 'Crystal Clear Windows & Gutters',
      description:
        'Professional window cleaning and gutter services. Streak-free guaranteed. Serving DFW for 10+ years.',
      serviceArea: 'Dallas, Fort Worth, Arlington, Grand Prairie',
      verified: false,
      serviceNames: [
        'Interior & Exterior Window Cleaning',
        'Exterior Only Window Cleaning',
        'Screen Cleaning & Repair',
        'Gutter Clean & Flush',
        'Gutter Guard Installation',
      ],
      crews: [
        {
          name: 'Window Team',
          members: [
            { name: 'Ben Carter', phone: '+15559004001', role: 'Lead' },
            { name: 'Ryan Stokes', role: 'Technician' },
          ],
        },
      ],
    },
    {
      phone: '+15552005005',
      businessName: 'Lone Star Roof & Exterior',
      description:
        'Roof cleaning specialists. Soft wash experts. Also offering pressure washing and holiday lighting.',
      serviceArea: 'North Texas — 50-mile radius from Dallas',
      verified: true,
      serviceNames: [
        'Soft Wash Roof Treatment',
        'Moss Removal & Prevention',
        'House Siding Wash',
        'Driveway Pressure Wash',
        'Holiday Light Installation',
        'Holiday Light Removal & Storage',
      ],
      crews: [
        {
          name: 'Roof Crew',
          members: [
            { name: 'Nathan Reed', phone: '+15559005001', role: 'Lead' },
            { name: 'Austin Pierce', role: 'Technician' },
            { name: 'Omar Farah', role: 'Safety' },
          ],
        },
        {
          name: 'Lighting Crew',
          members: [
            { name: 'Cody Walsh', phone: '+15559005002', role: 'Lead' },
            { name: 'Ethan Moore', role: 'Installer' },
          ],
        },
      ],
    },
    {
      phone: '+15552006006',
      businessName: 'Handy Fence & Deck Co.',
      description:
        'Fence repair, deck restoration, and staining. Quality craftsmanship at honest prices.',
      serviceArea: 'Fort Worth, Arlington, Mansfield, Burleson',
      verified: true,
      serviceNames: [
        'Fence Repair',
        'Deck Sanding & Refinishing',
        'Fence / Deck Staining',
      ],
      crews: [
        {
          name: 'Field Crew',
          members: [
            { name: 'Steve Larson', phone: '+15559006001', role: 'Owner/Lead' },
            { name: 'Dustin Hayes', role: 'Carpenter' },
          ],
        },
      ],
    },
  ];

  // Build service name → id map
  const serviceMap = new Map<string, string>();
  const allServices = await prisma.service.findMany({
    select: { id: true, name: true },
  });
  for (const s of allServices) {
    serviceMap.set(s.name, s.id);
  }

  for (const prov of providerData) {
    const user = await prisma.user.upsert({
      where: { phone: prov.phone },
      update: {},
      create: {
        phone: prov.phone,
        role: 'PROVIDER',
        verified: true,
      },
    });

    const profile = await prisma.providerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        businessName: prov.businessName,
        description: prov.description,
        serviceArea: prov.serviceArea,
        verified: prov.verified,
      },
    });

    // Assign services with slight custom pricing variation
    for (const svcName of prov.serviceNames) {
      const serviceId = serviceMap.get(svcName);
      if (!serviceId) {
        warn(`Service not found: ${svcName}`);
        continue;
      }
      // Small random price adjustment (-10% to +15%)
      const baseSvc = await prisma.service.findUnique({
        where: { id: serviceId },
      });
      const variation = 0.9 + Math.random() * 0.25;
      const customPrice = baseSvc
        ? Math.round(Number(baseSvc.basePrice) * variation * 100) / 100
        : undefined;

      await prisma.providerService.upsert({
        where: {
          providerId_serviceId: { providerId: profile.id, serviceId },
        },
        update: { customPrice },
        create: {
          providerId: profile.id,
          serviceId,
          customPrice,
        },
      });
    }

    // Create crews and members
    for (const crewData of prov.crews) {
      const crew = await prisma.crew.create({
        data: {
          providerId: profile.id,
          name: crewData.name,
        },
      });

      for (const member of crewData.members) {
        await prisma.crewMember.create({
          data: {
            crewId: crew.id,
            name: member.name,
            phone: member.phone || null,
            role: member.role || null,
          },
        });
      }
    }

    const verified = prov.verified
      ? chalk.green('verified')
      : chalk.yellow('pending');
    const crewCount = prov.crews.length;
    const memberCount = prov.crews.reduce(
      (sum, c) => sum + c.members.length,
      0,
    );

    success(
      `${chalk.white.bold(prov.businessName)} [${verified}] — ${chalk.yellow(prov.serviceNames.length)} services, ${chalk.cyan(crewCount)} crews (${memberCount} members)`,
    );
  }

  count('providers', providerData.length);
  count(
    'crews',
    providerData.reduce((sum, p) => sum + p.crews.length, 0),
  );
  count(
    'crew members',
    providerData.reduce(
      (sum, p) => sum + p.crews.reduce((s, c) => s + c.members.length, 0),
      0,
    ),
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SAMPLE QUOTES & JOBS
  // ═══════════════════════════════════════════════════════════════════════════

  header('Sample Quotes & Jobs');

  // Fetch created data to wire up quotes
  const allCustomerProfiles = await prisma.customerProfile.findMany({
    include: { properties: true },
  });
  const allProviderProfiles = await prisma.providerProfile.findMany({
    include: { services: { include: { service: true } } },
  });

  let quotesCreated = 0;
  let jobsCreated = 0;

  // Create some quotes across customer–provider pairs
  const quoteScenarios: {
    customerPhone: string;
    providerBusiness: string;
    serviceName: string;
    status: 'PENDING' | 'SENT' | 'ACCEPTED' | 'DECLINED';
    customerNotes?: string;
    price?: number;
    providerNotes?: string;
    // Job details (only if ACCEPTED)
    jobStatus?: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
    scheduledDate?: string;
    scheduledTime?: string;
  }[] = [
    {
      customerPhone: '+15551001001',
      providerBusiness: 'DFW Power Wash Pros',
      serviceName: 'Driveway Pressure Wash',
      status: 'ACCEPTED',
      customerNotes: 'Driveway has oil stains near the garage.',
      price: 175,
      providerNotes: 'Oil stain treatment included at no extra charge.',
      jobStatus: 'SCHEDULED',
      scheduledDate: '2026-02-20',
      scheduledTime: '09:00',
    },
    {
      customerPhone: '+15551001001',
      providerBusiness: 'GreenScape Lawn & Garden',
      serviceName: 'Weekly Lawn Mowing',
      status: 'ACCEPTED',
      customerNotes: 'Front and back yard. Avoid flower beds near porch.',
      price: 50,
      jobStatus: 'COMPLETED',
      scheduledDate: '2026-02-05',
      scheduledTime: '08:00',
    },
    {
      customerPhone: '+15551002002',
      providerBusiness: 'Texas Exterior Painters',
      serviceName: 'Exterior House Painting',
      status: 'SENT',
      customerNotes:
        'Two-story colonial, approx 2500 sqft exterior. Prefer warm gray.',
      price: 7200,
      providerNotes:
        'Includes Sherwin-Williams Duration paint, 2 coats. Scaffolding needed for second story.',
    },
    {
      customerPhone: '+15551003003',
      providerBusiness: 'Crystal Clear Windows & Gutters',
      serviceName: 'Interior & Exterior Window Cleaning',
      status: 'PENDING',
      customerNotes: '24 windows total on lake house. Some are hard to reach.',
    },
    {
      customerPhone: '+15551003003',
      providerBusiness: 'GreenScape Lawn & Garden',
      serviceName: 'Landscape Design Consultation',
      status: 'ACCEPTED',
      price: 350,
      providerNotes: 'Includes 3D render of proposed design.',
      jobStatus: 'IN_PROGRESS',
      scheduledDate: '2026-02-10',
      scheduledTime: '10:00',
    },
    {
      customerPhone: '+15551003003',
      providerBusiness: 'Lone Star Roof & Exterior',
      serviceName: 'Soft Wash Roof Treatment',
      status: 'ACCEPTED',
      customerNotes: 'Significant algae on north-facing side.',
      price: 400,
      providerNotes: 'Heavy algae buildup requires double treatment.',
      jobStatus: 'PENDING',
    },
    {
      customerPhone: '+15551004004',
      providerBusiness: 'DFW Power Wash Pros',
      serviceName: 'House Siding Wash',
      status: 'DECLINED',
      customerNotes: 'Vinyl siding, two-story.',
      price: 285,
      providerNotes: 'Soft wash recommended for vinyl.',
    },
    {
      customerPhone: '+15551004004',
      providerBusiness: 'Handy Fence & Deck Co.',
      serviceName: 'Fence Repair',
      status: 'SENT',
      customerNotes:
        'Storm damage on back fence, about 3 sections need replacing.',
      price: 450,
      providerNotes: 'Will replace 3 sections with matching cedar pickets.',
    },
    {
      customerPhone: '+15551005005',
      providerBusiness: 'GreenScape Lawn & Garden',
      serviceName: 'Hedge Trimming',
      status: 'ACCEPTED',
      customerNotes: 'HOA requires 48-hour notice. 12 large boxwood hedges.',
      price: 180,
      providerNotes: '3 hours estimated. Will dispose of all clippings.',
      jobStatus: 'SCHEDULED',
      scheduledDate: '2026-02-25',
      scheduledTime: '07:30',
    },
    {
      customerPhone: '+15551005005',
      providerBusiness: 'Lone Star Roof & Exterior',
      serviceName: 'Holiday Light Installation',
      status: 'PENDING',
      customerNotes:
        'Front roofline, two trees, and porch columns. Warm white LEDs.',
    },
    {
      customerPhone: '+15551001001',
      providerBusiness: 'Crystal Clear Windows & Gutters',
      serviceName: 'Gutter Clean & Flush',
      status: 'ACCEPTED',
      price: 165,
      jobStatus: 'COMPLETED',
      scheduledDate: '2026-01-28',
      scheduledTime: '14:00',
    },
    {
      customerPhone: '+15551002002',
      providerBusiness: 'GreenScape Lawn & Garden',
      serviceName: 'Mulch Installation',
      status: 'SENT',
      customerNotes:
        'About 400 sqft of garden beds. Dark brown mulch preferred.',
      price: 1500,
      providerNotes: 'Includes mulch delivery, weed barrier, and installation.',
    },
  ];

  for (const scenario of quoteScenarios) {
    // Find customer profile & property
    const custProfile = allCustomerProfiles.find(
      (cp) =>
        customerData.find((cd) => cd.phone === scenario.customerPhone)
          ?.firstName === cp.firstName,
    );
    if (!custProfile || custProfile.properties.length === 0) continue;
    const property = custProfile.properties[0];

    // Find provider profile
    const provProfile = allProviderProfiles.find(
      (pp) => pp.businessName === scenario.providerBusiness,
    );
    if (!provProfile) continue;

    // Find service
    const svcId = serviceMap.get(scenario.serviceName);
    if (!svcId) continue;

    const quote = await prisma.quote.create({
      data: {
        propertyId: property.id,
        serviceId: svcId,
        providerId: provProfile.id,
        status: scenario.status,
        customerNotes: scenario.customerNotes,
        customPrice: scenario.price,
        notes: scenario.providerNotes,
      },
    });
    quotesCreated++;

    // Create job if quote accepted
    if (scenario.status === 'ACCEPTED' && scenario.jobStatus) {
      const job = await prisma.job.create({
        data: {
          quoteId: quote.id,
          status: scenario.jobStatus,
          scheduledDate: scenario.scheduledDate
            ? new Date(scenario.scheduledDate)
            : null,
          scheduledTime: scenario.scheduledTime || null,
          completedAt:
            scenario.jobStatus === 'COMPLETED' ? new Date('2026-02-05') : null,
        },
      });
      jobsCreated++;

      // Assign a crew if the job is scheduled or beyond
      if (scenario.jobStatus !== 'PENDING' && provProfile.id) {
        const crew = await prisma.crew.findFirst({
          where: { providerId: provProfile.id },
        });
        if (crew) {
          await prisma.jobAssignment.create({
            data: { jobId: job.id, crewId: crew.id },
          });
        }
      }

      const statusColor =
        scenario.jobStatus === 'COMPLETED'
          ? chalk.green
          : scenario.jobStatus === 'IN_PROGRESS'
            ? chalk.yellow
            : scenario.jobStatus === 'SCHEDULED'
              ? chalk.blue
              : chalk.gray;

      info(
        `${chalk.dim('Quote')} ${scenario.serviceName} → ${chalk.dim('Job')} ${statusColor(scenario.jobStatus)}`,
      );
    } else {
      const statusColor =
        scenario.status === 'SENT'
          ? chalk.blue
          : scenario.status === 'DECLINED'
            ? chalk.red
            : chalk.gray;
      info(
        `${chalk.dim('Quote')} ${scenario.serviceName} — ${statusColor(scenario.status)}`,
      );
    }
  }

  count('quotes', quotesCreated);
  count('jobs', jobsCreated);

  // ═══════════════════════════════════════════════════════════════════════════
  // SAMPLE NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  header('Sample Notifications');

  const notifCustomers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    take: 3,
  });

  const notifProviders = await prisma.user.findMany({
    where: { role: 'PROVIDER' },
    take: 3,
  });

  let notifsCreated = 0;

  for (const user of notifCustomers) {
    await prisma.notification.createMany({
      data: [
        {
          userId: user.id,
          type: 'QUOTE_RECEIVED',
          title: 'New Quote Received',
          body: 'DFW Power Wash Pros sent you a quote for Driveway Pressure Wash.',
          read: false,
        },
        {
          userId: user.id,
          type: 'JOB_SCHEDULED',
          title: 'Job Scheduled',
          body: 'Your Lawn Mowing job is scheduled for Feb 20, 2026 at 9:00 AM.',
          read: true,
        },
        {
          userId: user.id,
          type: 'JOB_COMPLETED',
          title: 'Job Completed',
          body: 'Your Gutter Clean & Flush job has been completed!',
          read: false,
        },
      ],
    });
    notifsCreated += 3;
  }

  for (const user of notifProviders) {
    await prisma.notification.createMany({
      data: [
        {
          userId: user.id,
          type: 'NEW_QUOTE_REQUEST',
          title: 'New Quote Request',
          body: 'New request for Window Cleaning at 1200 Lakeview Circle, Arlington.',
          read: false,
        },
        {
          userId: user.id,
          type: 'QUOTE_ACCEPTED',
          title: 'Quote Accepted',
          body: 'Sarah Johnson accepted your quote for Weekly Lawn Mowing!',
          read: true,
        },
      ],
    });
    notifsCreated += 2;
  }

  count('notifications', notifsCreated);

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════

  console.log();
  divider();
  console.log(chalk.bold.green('  Seeding complete!'));
  divider();
  console.log();

  const totalUsers = await prisma.user.count();
  const totalProperties = await prisma.property.count();
  const totalServices = await prisma.service.count();
  const totalCrews = await prisma.crew.count();
  const totalMembers = await prisma.crewMember.count();
  const totalQuotes = await prisma.quote.count();
  const totalJobs = await prisma.job.count();
  const totalNotifs = await prisma.notification.count();

  console.log(chalk.bold('  Database totals:'));
  console.log(`    Users ............. ${chalk.cyan(totalUsers)}`);
  console.log(`    Properties ........ ${chalk.cyan(totalProperties)}`);
  console.log(`    Service Categories  ${chalk.cyan(categories.length)}`);
  console.log(`    Services .......... ${chalk.cyan(totalServices)}`);
  console.log(`    Crews ............. ${chalk.cyan(totalCrews)}`);
  console.log(`    Crew Members ...... ${chalk.cyan(totalMembers)}`);
  console.log(`    Quotes ............ ${chalk.cyan(totalQuotes)}`);
  console.log(`    Jobs .............. ${chalk.cyan(totalJobs)}`);
  console.log(`    Notifications ..... ${chalk.cyan(totalNotifs)}`);
  console.log();

  console.log(chalk.dim('  Test login phones:'));
  console.log(chalk.dim('    Admin:    +10000000000'));
  console.log(chalk.dim('    Customer: +15551001001 through +15551005005'));
  console.log(chalk.dim('    Provider: +15552001001 through +15552006006'));
  console.log();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(chalk.red.bold('\n  Seed failed!\n'));
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
