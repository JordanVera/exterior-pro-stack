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

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(9, 0, 0, 0);
  return d;
}

function toCents(amount: number) {
  return Math.round(amount * 100);
}

/** Local copy of platform fee split (18% + 2.9% + 30¢). Do not import from @repo/api. */
function splitCharge(amountCents: number) {
  const stripeFeeCents = Math.round(amountCents * 0.029) + 30;
  const platformFeeCents = Math.round((amountCents * 1800) / 10_000);
  const transferAmountCents = Math.max(
    0,
    amountCents - platformFeeCents - stripeFeeCents,
  );
  return { stripeFeeCents, platformFeeCents, transferAmountCents };
}

const PAID_OUT_STATUSES = new Set([
  'PENDING',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
]);

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

  // Delete existing data to avoid duplicates on re-seed (FK order).
  await prisma.transfer.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.jobAssignment.deleteMany({});
  await prisma.recurringSchedule.deleteMany({});
  await prisma.jobBid.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.customerSubscription.deleteMany({});
  await prisma.planService.deleteMany({});
  await prisma.subscriptionPlan.deleteMany({});
  await prisma.providerService.deleteMany({});
  await prisma.crewMember.deleteMany({});
  await prisma.crew.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.property.deleteMany({});

  info('Cleared existing data');

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

  const contractorAgreedAt = daysFromNow(-21);

  const providerData: {
    phone: string;
    businessName: string;
    description: string;
    email?: string;
    serviceArea: string;
    serviceAreaZips: string;
    verified: boolean;
    stripeAccountId?: string;
    stripeTransfersEnabled?: boolean;
    contractorAgreedAt?: Date;
    serviceNames: string[];
    crews: {
      name: string;
      members: { name: string; phone?: string; role?: string }[];
    }[];
  }[] = [
    {
      phone: '+15552001001',
      businessName: 'DFW Power Wash Pros',
      description:
        'Top-rated pressure washing company serving the Dallas-Fort Worth metroplex since 2018. Residential and commercial.',
      email: 'payouts@dfwpowerwash.example.com',
      serviceArea: 'Dallas, Fort Worth, Plano, Frisco, Arlington',
      serviceAreaZips: '75201,75208,75219,75024,75034,76102,76013',
      verified: true,
      stripeAccountId: 'acct_seed_dfwpowerwash',
      stripeTransfersEnabled: true,
      contractorAgreedAt,
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
      email: 'billing@greenscape.example.com',
      serviceArea: 'Plano, Frisco, McKinney, Allen, Richardson',
      serviceAreaZips: '75024,75034,75201,75208,75219,76013,76092,76051',
      verified: true,
      stripeAccountId: 'acct_seed_greenscape',
      stripeTransfersEnabled: true,
      contractorAgreedAt,
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
      email: 'hello@texaspainters.example.com',
      serviceArea: 'Dallas, Southlake, Keller, Colleyville, Grapevine',
      serviceAreaZips: '75201,75208,75219,76092,76051',
      verified: true,
      stripeAccountId: 'acct_seed_texaspainters',
      stripeTransfersEnabled: true,
      contractorAgreedAt,
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
      email: 'payouts@crystalclear.example.com',
      serviceArea: 'Dallas, Fort Worth, Arlington, Grand Prairie',
      serviceAreaZips: '75201,75208,75219,76102,76013',
      verified: true,
      stripeAccountId: 'acct_seed_crystalclear',
      stripeTransfersEnabled: true,
      contractorAgreedAt,
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
      serviceAreaZips: '75201,75208,75219,75024,75034,76102,76013,76092,76051',
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
      email: 'steve@handyfence.example.com',
      serviceArea: 'Fort Worth, Arlington, Mansfield, Burleson',
      serviceAreaZips: '76102,76013,75201',
      verified: true,
      stripeTransfersEnabled: false,
      contractorAgreedAt,
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
    {
      phone: '+15552007007',
      businessName: 'Metroplex Irrigation & Lighting',
      description:
        'Holiday lighting design plus seasonal exterior lighting. Fully insured crews serving North Texas.',
      email: 'payouts@metroplexlights.example.com',
      serviceArea: 'Dallas, Plano, Frisco, McKinney, Allen',
      serviceAreaZips: '75201,75208,75219,75024,75034,76092',
      verified: true,
      stripeAccountId: 'acct_seed_metroplexlights',
      stripeTransfersEnabled: true,
      contractorAgreedAt,
      serviceNames: [
        'Holiday Light Installation',
        'Holiday Light Removal & Storage',
        'Gutter Clean & Flush',
        'Trim & Shutters Painting',
      ],
      crews: [
        {
          name: 'Lighting Crew',
          members: [
            { name: 'Nina Patel', phone: '+15559007001', role: 'Lead' },
            { name: 'Cole Ramirez', role: 'Installer' },
            { name: 'Harper Lee', role: 'Installer' },
          ],
        },
      ],
    },
    {
      phone: '+15552008008',
      businessName: 'All-Seasons Gutters DFW',
      description:
        'Gutter cleaning, flushing, and guard installation. Same-week residential appointments.',
      serviceArea: 'Dallas, Arlington, Grand Prairie, Irving',
      serviceAreaZips: '75201,75208,75219,76102,76013',
      verified: true,
      serviceNames: [
        'Gutter Clean & Flush',
        'Gutter Guard Installation',
        'House Siding Wash',
      ],
      crews: [
        {
          name: 'Gutter Crew',
          members: [
            { name: 'Paul Nguyen', phone: '+15559008001', role: 'Lead' },
            { name: 'Ricky Alvarez', role: 'Technician' },
          ],
        },
      ],
    },
    {
      phone: '+15552009009',
      businessName: 'Prairie View Land Care',
      description:
        'New lawn-care outfit covering Frisco and McKinney. Awaiting admin verification.',
      serviceArea: 'Frisco, McKinney, Allen',
      serviceAreaZips: '75034,75024',
      verified: false,
      serviceNames: [
        'Weekly Lawn Mowing',
        'Bi-Weekly Lawn Mowing',
        'Hedge Trimming',
        'Leaf Removal',
      ],
      crews: [
        {
          name: 'Startup Crew',
          members: [
            { name: 'Jordan Blake', phone: '+15559009001', role: 'Owner' },
          ],
        },
      ],
    },
    {
      phone: '+15552010010',
      businessName: 'Sparkle Soft Wash Co.',
      description:
        'Residential soft wash for siding, driveways, and roofs. Family-owned in Arlington.',
      serviceArea: 'Arlington, Fort Worth, Mansfield',
      serviceAreaZips: '76013,76102,75201',
      verified: true,
      serviceNames: [
        'Driveway Pressure Wash',
        'House Siding Wash',
        'Deck / Patio Wash',
        'Soft Wash Roof Treatment',
      ],
      crews: [
        {
          name: 'Wash Crew',
          members: [
            { name: 'Elena Cruz', phone: '+15559010001', role: 'Lead' },
            { name: 'Mason Wright', role: 'Technician' },
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
      update: {
        businessName: prov.businessName,
        description: prov.description,
        email: prov.email ?? null,
        serviceArea: prov.serviceArea,
        serviceAreaZips: prov.serviceAreaZips,
        verified: prov.verified,
        stripeAccountId: prov.stripeAccountId ?? null,
        stripeTransfersEnabled: prov.stripeTransfersEnabled ?? false,
        contractorAgreedAt: prov.contractorAgreedAt ?? null,
      },
      create: {
        userId: user.id,
        businessName: prov.businessName,
        description: prov.description,
        email: prov.email,
        serviceArea: prov.serviceArea,
        serviceAreaZips: prov.serviceAreaZips,
        verified: prov.verified,
        stripeAccountId: prov.stripeAccountId,
        stripeTransfersEnabled: prov.stripeTransfersEnabled ?? false,
        contractorAgreedAt: prov.contractorAgreedAt,
      },
    });

    // Assign services with slight custom pricing variation
    for (const svcName of prov.serviceNames) {
      const serviceId = serviceMap.get(svcName);
      if (!serviceId) {
        warn(`Service not found: ${svcName}`);
        continue;
      }
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
      : chalk.yellow('unverified');
    const payout = prov.stripeTransfersEnabled
      ? chalk.green('payouts ready')
      : prov.contractorAgreedAt
        ? chalk.yellow('onboarding started')
        : chalk.gray('payouts not started');
    const crewCount = prov.crews.length;
    const memberCount = prov.crews.reduce(
      (sum, c) => sum + c.members.length,
      0,
    );

    success(
      `${chalk.white.bold(prov.businessName)} [${verified}, ${payout}] — ${chalk.yellow(prov.serviceNames.length)} services, ${chalk.cyan(crewCount)} crews (${memberCount} members)`,
    );
  }

  count('providers', providerData.length);
  count(
    'payout-ready providers',
    providerData.filter((p) => p.stripeTransfersEnabled).length,
  );
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
  // SUBSCRIPTION PLANS
  // ═══════════════════════════════════════════════════════════════════════════

  header('Subscription Plans');

  const biWeeklyMowingId = serviceMap.get('Bi-Weekly Lawn Mowing')!;
  const weeklyMowingId = serviceMap.get('Weekly Lawn Mowing')!;
  const weedControlId = serviceMap.get('Weed Control Treatment')!;
  const gutterCleanId = serviceMap.get('Gutter Clean & Flush')!;
  const pressureWashId = serviceMap.get('Driveway Pressure Wash')!;
  const windowCleanId = serviceMap.get('Exterior Only Window Cleaning')!;

  const basicPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Basic Lawn Care',
      description:
        'Essential lawn care with bi-weekly mowing and monthly weed control. Perfect for maintaining a tidy yard.',
      monthlyPrice: 99.0,
      quarterlyPrice: 269.0,
      annualPrice: 990.0,
      active: true,
      services: {
        create: [
          { serviceId: biWeeklyMowingId, frequency: 'BIWEEKLY' },
          { serviceId: weedControlId, frequency: 'MONTHLY' },
        ],
      },
    },
  });
  success(`${basicPlan.name} — $${basicPlan.monthlyPrice}/mo`);

  const standardPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Standard Exterior',
      description:
        'Comprehensive exterior maintenance with weekly mowing, weed control, and quarterly gutter cleaning.',
      monthlyPrice: 179.0,
      quarterlyPrice: 479.0,
      annualPrice: 1790.0,
      active: true,
      services: {
        create: [
          { serviceId: weeklyMowingId, frequency: 'WEEKLY' },
          { serviceId: weedControlId, frequency: 'MONTHLY' },
          { serviceId: gutterCleanId, frequency: 'QUARTERLY' },
        ],
      },
    },
  });
  success(`${standardPlan.name} — $${standardPlan.monthlyPrice}/mo`);

  const premiumPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Premium Exterior',
      description:
        'The full package: weekly mowing, bi-weekly weed control, quarterly gutter cleaning, bi-annual pressure washing, and quarterly window cleaning.',
      monthlyPrice: 299.0,
      quarterlyPrice: 799.0,
      annualPrice: 2990.0,
      active: true,
      services: {
        create: [
          { serviceId: weeklyMowingId, frequency: 'WEEKLY' },
          { serviceId: weedControlId, frequency: 'BIWEEKLY' },
          { serviceId: gutterCleanId, frequency: 'QUARTERLY' },
          { serviceId: pressureWashId, frequency: 'BIANNUALLY' },
          { serviceId: windowCleanId, frequency: 'QUARTERLY' },
        ],
      },
    },
  });
  success(`${premiumPlan.name} — $${premiumPlan.monthlyPrice}/mo`);

  count('subscription plans', 3);

  // ═══════════════════════════════════════════════════════════════════════════
  // SAMPLE JOBS & BIDS
  // ═══════════════════════════════════════════════════════════════════════════

  header('Sample Jobs & Bids');

  // Fetch created data to wire up jobs
  const allCustomerProfiles = await prisma.customerProfile.findMany({
    include: { properties: true, user: true },
  });
  const allProviderProfiles = await prisma.providerProfile.findMany({
    include: { services: { include: { service: true } } },
  });

  let jobsCreated = 0;
  let bidsCreated = 0;
  let paymentsCreated = 0;
  let transfersCreated = 0;

  const jobScenarios: {
    customerPhone: string;
    propertyIndex?: number;
    serviceName: string;
    customerNotes?: string;
    status:
      | 'OPEN'
      | 'PENDING'
      | 'SCHEDULED'
      | 'IN_PROGRESS'
      | 'COMPLETED'
      | 'CANCELLED';
    bids: {
      providerBusiness: string;
      price: number;
      notes?: string;
      status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';
    }[];
    scheduledOffsetDays?: number;
    scheduledTime?: string;
    pendingTransfer?: boolean;
  }[] = [
    // OPEN — no bids (Available board)
    {
      customerPhone: '+15551003003',
      propertyIndex: 0,
      serviceName: 'Interior & Exterior Window Cleaning',
      customerNotes: '24 windows total on lake house. Some are hard to reach.',
      status: 'OPEN',
      bids: [],
    },
    {
      customerPhone: '+15551005005',
      propertyIndex: 0,
      serviceName: 'Holiday Light Installation',
      customerNotes:
        'Front roofline, two trees, and porch columns. Warm white LEDs.',
      status: 'OPEN',
      bids: [],
    },
    {
      customerPhone: '+15551002002',
      propertyIndex: 0,
      serviceName: 'Garage Floor Epoxy Coating',
      customerNotes: 'Two-car garage, oil stains near the door.',
      status: 'OPEN',
      bids: [],
    },
    // OPEN — pending bids (customer needs review)
    {
      customerPhone: '+15551002002',
      propertyIndex: 0,
      serviceName: 'Exterior House Painting',
      customerNotes:
        'Two-story colonial, approx 2500 sqft exterior. Prefer warm gray.',
      status: 'OPEN',
      bids: [
        {
          providerBusiness: 'Texas Exterior Painters',
          price: 7200,
          notes:
            'Includes Sherwin-Williams Duration paint, 2 coats. Scaffolding needed for second story.',
          status: 'PENDING',
        },
      ],
    },
    {
      customerPhone: '+15551004004',
      propertyIndex: 0,
      serviceName: 'House Siding Wash',
      customerNotes: 'Vinyl siding, two-story.',
      status: 'OPEN',
      bids: [
        {
          providerBusiness: 'DFW Power Wash Pros',
          price: 285,
          notes: 'Soft wash recommended for vinyl.',
          status: 'PENDING',
        },
        {
          providerBusiness: 'Lone Star Roof & Exterior',
          price: 260,
          notes: 'We specialize in soft wash for vinyl siding.',
          status: 'PENDING',
        },
      ],
    },
    {
      customerPhone: '+15551004004',
      propertyIndex: 0,
      serviceName: 'Fence Repair',
      customerNotes:
        'Storm damage on back fence, about 3 sections need replacing.',
      status: 'OPEN',
      bids: [
        {
          providerBusiness: 'Handy Fence & Deck Co.',
          price: 450,
          notes: 'Will replace 3 sections with matching cedar pickets.',
          status: 'PENDING',
        },
      ],
    },
    {
      customerPhone: '+15551002002',
      propertyIndex: 0,
      serviceName: 'Mulch Installation',
      customerNotes:
        'About 400 sqft of garden beds. Dark brown mulch preferred.',
      status: 'OPEN',
      bids: [
        {
          providerBusiness: 'GreenScape Lawn & Garden',
          price: 1500,
          notes: 'Includes mulch delivery, weed barrier, and installation.',
          status: 'PENDING',
        },
      ],
    },
    {
      customerPhone: '+15551001001',
      propertyIndex: 1,
      serviceName: 'Deck / Patio Wash',
      customerNotes: 'Composite deck off the kitchen. Rental — tenant on site.',
      status: 'OPEN',
      bids: [
        {
          providerBusiness: 'DFW Power Wash Pros',
          price: 190,
          notes: 'Can complete in one afternoon.',
          status: 'PENDING',
        },
        {
          providerBusiness: 'Sparkle Soft Wash Co.',
          price: 175,
          notes: 'Withdrew — crew is booked through next week.',
          status: 'WITHDRAWN',
        },
        {
          providerBusiness: 'Lone Star Roof & Exterior',
          price: 210,
          notes: 'Includes patio furniture rinse.',
          status: 'DECLINED',
        },
      ],
    },
    // PENDING — won, needs schedule (payout-ready winners)
    {
      customerPhone: '+15551003003',
      propertyIndex: 0,
      serviceName: 'House Siding Wash',
      customerNotes: 'Lakefront vinyl. Avoid spraying toward the dock.',
      status: 'PENDING',
      bids: [
        {
          providerBusiness: 'DFW Power Wash Pros',
          price: 310,
          notes: 'Soft wash, two-story. Includes rinse of patio doors.',
          status: 'ACCEPTED',
        },
      ],
    },
    {
      customerPhone: '+15551001001',
      propertyIndex: 0,
      serviceName: 'Trim & Shutters Painting',
      customerNotes: 'Match existing white trim. 14 shutters.',
      status: 'PENDING',
      bids: [
        {
          providerBusiness: 'Texas Exterior Painters',
          price: 540,
          status: 'ACCEPTED',
        },
      ],
    },
    {
      customerPhone: '+15551004004',
      propertyIndex: 0,
      serviceName: 'Gutter Clean & Flush',
      customerNotes: 'Corner lot, lots of oak debris.',
      status: 'PENDING',
      bids: [
        {
          providerBusiness: 'Crystal Clear Windows & Gutters',
          price: 175,
          status: 'ACCEPTED',
        },
      ],
    },
    // SCHEDULED — next 3–14 days
    {
      customerPhone: '+15551001001',
      propertyIndex: 0,
      serviceName: 'Driveway Pressure Wash',
      customerNotes: 'Driveway has oil stains near the garage.',
      status: 'SCHEDULED',
      scheduledOffsetDays: 5,
      scheduledTime: '09:00',
      bids: [
        {
          providerBusiness: 'DFW Power Wash Pros',
          price: 175,
          notes: 'Oil stain treatment included at no extra charge.',
          status: 'ACCEPTED',
        },
        {
          providerBusiness: 'Lone Star Roof & Exterior',
          price: 195,
          notes: 'Can do it this weekend.',
          status: 'DECLINED',
        },
      ],
    },
    {
      customerPhone: '+15551005005',
      propertyIndex: 0,
      serviceName: 'Hedge Trimming',
      customerNotes: 'HOA requires 48-hour notice. 12 large boxwood hedges.',
      status: 'SCHEDULED',
      scheduledOffsetDays: 8,
      scheduledTime: '07:30',
      bids: [
        {
          providerBusiness: 'GreenScape Lawn & Garden',
          price: 180,
          notes: '3 hours estimated. Will dispose of all clippings.',
          status: 'ACCEPTED',
        },
      ],
    },
    {
      customerPhone: '+15551002002',
      propertyIndex: 0,
      serviceName: 'Exterior Only Window Cleaning',
      customerNotes: 'Two-story, 18 windows. Water-fed pole is fine.',
      status: 'SCHEDULED',
      scheduledOffsetDays: 3,
      scheduledTime: '10:00',
      bids: [
        {
          providerBusiness: 'Crystal Clear Windows & Gutters',
          price: 145,
          status: 'ACCEPTED',
        },
      ],
    },
    {
      customerPhone: '+15551003003',
      propertyIndex: 2,
      serviceName: 'Holiday Light Installation',
      customerNotes: 'New construction — no existing clips. Warm white LEDs.',
      status: 'SCHEDULED',
      scheduledOffsetDays: 12,
      scheduledTime: '14:00',
      bids: [
        {
          providerBusiness: 'Metroplex Irrigation & Lighting',
          price: 620,
          notes: 'Includes clips, timers, and takedown credit.',
          status: 'ACCEPTED',
        },
      ],
    },
    // IN_PROGRESS
    {
      customerPhone: '+15551003003',
      propertyIndex: 0,
      serviceName: 'Landscape Design Consultation',
      status: 'IN_PROGRESS',
      scheduledOffsetDays: -1,
      scheduledTime: '10:00',
      pendingTransfer: true,
      bids: [
        {
          providerBusiness: 'GreenScape Lawn & Garden',
          price: 350,
          notes: 'Includes 3D render of proposed design.',
          status: 'ACCEPTED',
        },
      ],
    },
    {
      customerPhone: '+15551004004',
      propertyIndex: 0,
      serviceName: 'Driveway Pressure Wash',
      customerNotes: 'Oil spots near the street.',
      status: 'IN_PROGRESS',
      scheduledOffsetDays: 0,
      scheduledTime: '08:00',
      bids: [
        {
          providerBusiness: 'DFW Power Wash Pros',
          price: 160,
          status: 'ACCEPTED',
        },
      ],
    },
    {
      customerPhone: '+15551001001',
      propertyIndex: 1,
      serviceName: 'Fence / Deck Staining',
      customerNotes: 'Back cedar fence at the Plano rental.',
      status: 'IN_PROGRESS',
      scheduledOffsetDays: -1,
      scheduledTime: '09:30',
      bids: [
        {
          providerBusiness: 'Texas Exterior Painters',
          price: 880,
          status: 'ACCEPTED',
        },
      ],
    },
    // COMPLETED
    {
      customerPhone: '+15551001001',
      propertyIndex: 0,
      serviceName: 'Weekly Lawn Mowing',
      customerNotes: 'Front and back yard. Avoid flower beds near porch.',
      status: 'COMPLETED',
      scheduledOffsetDays: -12,
      scheduledTime: '08:00',
      bids: [
        {
          providerBusiness: 'GreenScape Lawn & Garden',
          price: 50,
          status: 'ACCEPTED',
        },
      ],
    },
    {
      customerPhone: '+15551001001',
      propertyIndex: 1,
      serviceName: 'Gutter Clean & Flush',
      status: 'COMPLETED',
      scheduledOffsetDays: -20,
      scheduledTime: '14:00',
      bids: [
        {
          providerBusiness: 'Crystal Clear Windows & Gutters',
          price: 165,
          status: 'ACCEPTED',
        },
      ],
    },
    {
      customerPhone: '+15551002002',
      propertyIndex: 0,
      serviceName: 'Sidewalk & Walkway Wash',
      status: 'COMPLETED',
      scheduledOffsetDays: -8,
      scheduledTime: '11:00',
      bids: [
        {
          providerBusiness: 'DFW Power Wash Pros',
          price: 120,
          status: 'ACCEPTED',
        },
      ],
    },
    {
      customerPhone: '+15551005005',
      propertyIndex: 0,
      serviceName: 'Weed Control Treatment',
      customerNotes: 'Front beds and lawn. HOA-approved products only.',
      status: 'COMPLETED',
      scheduledOffsetDays: -15,
      scheduledTime: '07:00',
      bids: [
        {
          providerBusiness: 'GreenScape Lawn & Garden',
          price: 85,
          status: 'ACCEPTED',
        },
      ],
    },
    {
      customerPhone: '+15551003003',
      propertyIndex: 1,
      serviceName: 'Screen Cleaning & Repair',
      customerNotes: 'Commercial storefront — after hours.',
      status: 'COMPLETED',
      scheduledOffsetDays: -6,
      scheduledTime: '18:00',
      bids: [
        {
          providerBusiness: 'Crystal Clear Windows & Gutters',
          price: 95,
          status: 'ACCEPTED',
        },
      ],
    },
    // CANCELLED
    {
      customerPhone: '+15551005005',
      propertyIndex: 1,
      serviceName: 'Leaf Removal',
      customerNotes: 'Apartment parking-lot beds only. Tenant cancelled.',
      status: 'CANCELLED',
      bids: [
        {
          providerBusiness: 'GreenScape Lawn & Garden',
          price: 130,
          status: 'PENDING',
        },
      ],
    },
    {
      customerPhone: '+15551002002',
      propertyIndex: 0,
      serviceName: 'Tree Planting',
      customerNotes: 'Customer postponed landscaping until fall.',
      status: 'CANCELLED',
      scheduledOffsetDays: -3,
      scheduledTime: '09:00',
      bids: [
        {
          providerBusiness: 'GreenScape Lawn & Garden',
          price: 240,
          status: 'ACCEPTED',
        },
      ],
    },
  ];

  for (const scenario of jobScenarios) {
    const custProfile = allCustomerProfiles.find(
      (cp) => cp.user.phone === scenario.customerPhone,
    );
    if (!custProfile || custProfile.properties.length === 0) continue;

    const wantedAddress = customerData.find(
      (cd) => cd.phone === scenario.customerPhone,
    )?.properties[scenario.propertyIndex ?? 0]?.address;
    const property =
      custProfile.properties.find((p) => p.address === wantedAddress) ??
      custProfile.properties[0];

    const svcId = serviceMap.get(scenario.serviceName);
    if (!svcId) continue;

    const acceptedBidData = scenario.bids.find((b) => b.status === 'ACCEPTED');
    const scheduledDate =
      scenario.scheduledOffsetDays !== undefined
        ? daysFromNow(scenario.scheduledOffsetDays)
        : null;

    const job = await prisma.job.create({
      data: {
        propertyId: property.id,
        serviceId: svcId,
        type: 'ONE_TIME',
        status: scenario.status,
        customerNotes: scenario.customerNotes,
        scheduledDate,
        scheduledTime: scenario.scheduledTime || null,
        completedAt: scenario.status === 'COMPLETED' ? scheduledDate : null,
      },
    });
    jobsCreated++;

    let acceptedBidId: string | null = null;
    let acceptedProviderId: string | null = null;
    for (const bidData of scenario.bids) {
      const provProfile = allProviderProfiles.find(
        (pp) => pp.businessName === bidData.providerBusiness,
      );
      if (!provProfile) continue;

      const bid = await prisma.jobBid.create({
        data: {
          jobId: job.id,
          providerId: provProfile.id,
          price: bidData.price,
          notes: bidData.notes,
          status: bidData.status,
        },
      });
      bidsCreated++;

      if (bidData.status === 'ACCEPTED') {
        acceptedBidId = bid.id;
        acceptedProviderId = provProfile.id;
      }
    }

    if (acceptedBidId) {
      await prisma.job.update({
        where: { id: job.id },
        data: { acceptedBidId },
      });
    }

    if (
      acceptedBidData &&
      scenario.status !== 'OPEN' &&
      scenario.status !== 'PENDING' &&
      scenario.status !== 'CANCELLED'
    ) {
      const provProfile = allProviderProfiles.find(
        (pp) => pp.businessName === acceptedBidData.providerBusiness,
      );
      if (provProfile) {
        const crew = await prisma.crew.findFirst({
          where: { providerId: provProfile.id },
        });
        if (crew) {
          await prisma.jobAssignment.create({
            data: { jobId: job.id, crewId: crew.id },
          });
        }
      }
    }

    if (
      acceptedBidData &&
      acceptedProviderId &&
      PAID_OUT_STATUSES.has(scenario.status)
    ) {
      const amountCents = toCents(acceptedBidData.price);
      const split = splitCharge(amountCents);
      const payment = await prisma.payment.create({
        data: {
          kind: 'JOB',
          status: 'SUCCEEDED',
          amountCents,
          platformFeeCents: split.platformFeeCents,
          stripeFeeCents: split.stripeFeeCents,
          transferAmountCents: split.transferAmountCents,
          customerId: custProfile.id,
          jobId: job.id,
          stripeCheckoutSessionId: `cs_seed_${job.id}`,
          stripePaymentIntentId: `pi_seed_${job.id}`,
        },
      });
      paymentsCreated++;

      if (scenario.status === 'COMPLETED') {
        await prisma.transfer.create({
          data: {
            paymentId: payment.id,
            providerId: acceptedProviderId,
            amountCents: split.transferAmountCents,
            status: 'PAID',
            stripeTransferId: `tr_seed_${job.id}`,
          },
        });
        transfersCreated++;
      } else if (scenario.pendingTransfer) {
        await prisma.transfer.create({
          data: {
            paymentId: payment.id,
            providerId: acceptedProviderId,
            amountCents: split.transferAmountCents,
            status: 'PENDING',
          },
        });
        transfersCreated++;
      }
    }

    const statusColor =
      scenario.status === 'COMPLETED'
        ? chalk.green
        : scenario.status === 'IN_PROGRESS'
          ? chalk.yellow
          : scenario.status === 'SCHEDULED'
            ? chalk.blue
            : scenario.status === 'OPEN'
              ? chalk.cyan
              : scenario.status === 'CANCELLED'
                ? chalk.red
                : chalk.gray;

    const bidInfo =
      scenario.bids.length > 0
        ? `${scenario.bids.length} bid${scenario.bids.length > 1 ? 's' : ''}`
        : 'no bids yet';

    info(
      `${chalk.dim('Job')} ${scenario.serviceName} — ${statusColor(scenario.status)} (${bidInfo})`,
    );
  }

  count('jobs', jobsCreated);
  count('bids', bidsCreated);
  count('payments', paymentsCreated);
  count('transfers', transfersCreated);

  // ═══════════════════════════════════════════════════════════════════════════
  // SAMPLE SUBSCRIPTION
  // ═══════════════════════════════════════════════════════════════════════════

  header('Sample Subscriptions');

  // Give Sarah Johnson a Basic Lawn Care subscription
  const sarahProfile = allCustomerProfiles.find(
    (cp) => cp.firstName === 'Sarah',
  );
  const greenscapeProfile = allProviderProfiles.find(
    (pp) => pp.businessName === 'GreenScape Lawn & Garden',
  );

  if (sarahProfile && greenscapeProfile && sarahProfile.properties.length > 0) {
    const sub = await prisma.customerSubscription.create({
      data: {
        customerId: sarahProfile.id,
        planId: basicPlan.id,
        propertyId: sarahProfile.properties[0].id,
        status: 'ACTIVE',
        billingFrequency: 'MONTHLY',
        currentPeriodStart: daysFromNow(-15),
        currentPeriodEnd: daysFromNow(15),
        assignedProviderId: greenscapeProfile.id,
      },
    });
    success(
      `Sarah Johnson → ${basicPlan.name} (${chalk.green('ACTIVE')}, provider: GreenScape)`,
    );

    const mowingId = serviceMap.get('Weekly Lawn Mowing');
    if (mowingId) {
      const subJob = await prisma.job.create({
        data: {
          propertyId: sarahProfile.properties[0].id,
          serviceId: mowingId,
          type: 'SUBSCRIPTION',
          status: 'SCHEDULED',
          subscriptionId: sub.id,
          customerNotes: 'Recurring visit from Basic Lawn Care plan.',
          scheduledDate: daysFromNow(4),
          scheduledTime: '08:00',
        },
      });
      const subBid = await prisma.jobBid.create({
        data: {
          jobId: subJob.id,
          providerId: greenscapeProfile.id,
          price: 45,
          notes: 'Included in monthly plan.',
          status: 'ACCEPTED',
        },
      });
      await prisma.job.update({
        where: { id: subJob.id },
        data: { acceptedBidId: subBid.id },
      });
      const crew = await prisma.crew.findFirst({
        where: { providerId: greenscapeProfile.id },
      });
      if (crew) {
        await prisma.jobAssignment.create({
          data: { jobId: subJob.id, crewId: crew.id },
        });
      }
      success(
        `Subscription job — Weekly Lawn Mowing (${chalk.blue('SCHEDULED')} in 4 days)`,
      );
    }

    count('subscriptions', 1);
  }

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
          type: 'BID_RECEIVED',
          title: 'New Bid Received',
          body: 'DFW Power Wash Pros submitted a bid for your Driveway Pressure Wash job.',
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
          type: 'NEW_JOB_AVAILABLE',
          title: 'New Job Available',
          body: 'New Window Cleaning job at 1200 Lakeview Circle, Arlington. Submit your bid!',
          read: false,
        },
        {
          userId: user.id,
          type: 'BID_ACCEPTED',
          title: 'Bid Accepted',
          body: 'Sarah Johnson accepted your bid for Weekly Lawn Mowing!',
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
  const totalJobs = await prisma.job.count();
  const totalBids = await prisma.jobBid.count();
  const totalPlans = await prisma.subscriptionPlan.count();
  const totalSubs = await prisma.customerSubscription.count();
  const totalNotifs = await prisma.notification.count();
  const totalPayments = await prisma.payment.count();
  const totalTransfers = await prisma.transfer.count();
  const payoutReady = await prisma.providerProfile.count({
    where: { stripeTransfersEnabled: true },
  });
  const jobsByStatus = await prisma.job.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  console.log(chalk.bold('  Database totals:'));
  console.log(`    Users ............. ${chalk.cyan(totalUsers)}`);
  console.log(`    Properties ........ ${chalk.cyan(totalProperties)}`);
  console.log(`    Service Categories  ${chalk.cyan(categories.length)}`);
  console.log(`    Services .......... ${chalk.cyan(totalServices)}`);
  console.log(`    Crews ............. ${chalk.cyan(totalCrews)}`);
  console.log(`    Crew Members ...... ${chalk.cyan(totalMembers)}`);
  console.log(`    Jobs .............. ${chalk.cyan(totalJobs)}`);
  for (const row of jobsByStatus) {
    console.log(
      `      └ ${row.status.padEnd(12)} ${chalk.cyan(row._count._all)}`,
    );
  }
  console.log(`    Bids .............. ${chalk.cyan(totalBids)}`);
  console.log(`    Payments .......... ${chalk.cyan(totalPayments)}`);
  console.log(`    Transfers ......... ${chalk.cyan(totalTransfers)}`);
  console.log(`    Sub Plans ......... ${chalk.cyan(totalPlans)}`);
  console.log(`    Subscriptions ..... ${chalk.cyan(totalSubs)}`);
  console.log(`    Notifications ..... ${chalk.cyan(totalNotifs)}`);
  console.log(`    Payout-ready ...... ${chalk.cyan(payoutReady)} providers`);
  console.log();

  console.log(chalk.dim('  Test login phones:'));
  console.log(chalk.dim('    Admin:    +10000000000'));
  console.log(chalk.dim('    Customer: +15551001001 through +15551005005'));
  console.log(chalk.dim('    Provider: +15552001001 through +15552010010'));
  console.log(
    chalk.dim(
      '    Payout-ready: DFW Power Wash, GreenScape, Texas Painters, Crystal Clear, Metroplex Lights',
    ),
  );
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
