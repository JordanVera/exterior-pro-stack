import { PrismaClient, PriceUnit } from '@prisma/client';
import chalk from 'chalk';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROVIDER_LOGO_FILES } from './seed-assets/logos';

const prisma = new PrismaClient();
const SEED_DIR = dirname(fileURLToPath(import.meta.url));

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

function crewLoginEmail(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');
  return `${slug}@crew.example.com`;
}

async function attachProviderLogo(userId: string, businessName: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  const filename = PROVIDER_LOGO_FILES[businessName];
  if (!filename) return;
  const filePath = resolve(SEED_DIR, 'seed-assets/logos', filename);
  if (!existsSync(filePath)) {
    warn(`Logo file missing: ${filename}`);
    return;
  }
  try {
    const { del, list, put } = await import('@vercel/blob');
    const prefix = `providers/${userId}/logo`;
    const { blobs } = await list({ prefix });
    if (blobs.length > 0) {
      await del(blobs.map((blob) => blob.url));
    }
    const blob = await put(`${prefix}.png`, readFileSync(filePath), {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'image/png',
    });
    await prisma.providerProfile.update({
      where: { userId },
      data: { logoUrl: blob.url, logoPathname: blob.pathname },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    warn(`Logo upload failed for ${businessName}: ${message}`);
  }
}

async function upsertLoginUser(data: {
  email: string;
  phone?: string;
  role: 'ADMIN' | 'CUSTOMER' | 'PROVIDER' | 'CREW';
  verified?: boolean;
}) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        ...(data.phone ? [{ phone: data.phone }] : []),
      ],
    },
  });
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        email: data.email,
        phone: data.phone ?? existing.phone,
        role: data.role,
        verified: data.verified ?? true,
      },
    });
  }
  return prisma.user.create({
    data: {
      email: data.email,
      phone: data.phone,
      role: data.role,
      verified: data.verified ?? true,
    },
  });
}

/** Local copy of platform fee split (10% + 2.9% + 30¢). Do not import from @repo/api. */
function splitCharge(amountCents: number) {
  const stripeFeeCents = Math.round(amountCents * 0.029) + 30;
  const platformFeeCents = Math.round((amountCents * 1000) / 10_000);
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

  header('Admin Users');

  const adminUser = await upsertLoginUser({
    email: 'admin@example.com',
    phone: '+10000000000',
    role: 'ADMIN',
  });

  const platformAdmin = await upsertLoginUser({
    email: 'verawebdev@protonmail.com',
    role: 'ADMIN',
    verified: true,
  });

  success(
    `Admin — ${chalk.white(adminUser.email)} (${chalk.dim(adminUser.id)})`,
  );
  success(
    `Admin — ${chalk.white(platformAdmin.email)} (${chalk.dim(platformAdmin.id)})`,
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST CUSTOMERS
  // ═══════════════════════════════════════════════════════════════════════════

  header('Test Customers');

  const customerData = [
    {
      phone: '+18325428743',
      firstName: 'jordan',
      lastName: 'vera',
      email: 'jordan.vera96@gmail.com',
      properties: [
        {
          address: '742 W 22nd St',
          city: 'Houston',
          state: 'TX',
          zip: '77008',
          notes: 'Main residence, large front yard. Gate code: 4521',
          latitude: 29.8024,
          longitude: -95.4092,
        },
        {
          address: '8800 S Fry Rd',
          city: 'Katy',
          state: 'TX',
          zip: '77494',
          notes: 'Rental property, contact tenant before arrival',
          latitude: 29.7405,
          longitude: -95.782,
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
          address: '315 N Forest Park St',
          city: 'The Woodlands',
          state: 'TX',
          zip: '77381',
          notes: 'Two-story, back gate is unlocked',
          latitude: 30.1658,
          longitude: -95.4705,
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
          address: '1200 Marina Bay Dr',
          city: 'League City',
          state: 'TX',
          zip: '77573',
          notes: 'Lakefront property, be careful near the dock',
          latitude: 29.5075,
          longitude: -95.0949,
        },
        {
          address: '509 Main St',
          city: 'Houston',
          state: 'TX',
          zip: '77002',
          notes: 'Commercial storefront, after-hours access only',
          latitude: 29.7601,
          longitude: -95.3615,
        },
        {
          address: '2211 Business Center Dr',
          city: 'Pearland',
          state: 'TX',
          zip: '77584',
          notes: 'New construction, no landscaping yet',
          latitude: 29.5466,
          longitude: -95.3894,
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
          address: '4401 Willowick Rd',
          city: 'Houston',
          state: 'TX',
          zip: '77019',
          notes: 'Corner lot with large trees',
          latitude: 29.7513,
          longitude: -95.4302,
        },
      ],
    },
    {
      phone: '+15551005005',
      firstName: 'Lisa',
      lastName: 'Park',
      email: 'lisa.park@example.com',
      properties: [
        {
          address: '777 Commonwealth Blvd',
          city: 'Sugar Land',
          state: 'TX',
          zip: '77479',
          notes: 'HOA requires 48hr notice for exterior work',
          latitude: 29.5994,
          longitude: -95.6149,
        },
        {
          address: '900 Waugh Dr Apt 12B',
          city: 'Houston',
          state: 'TX',
          zip: '77019',
          notes: 'Apartment — parking lot cleaning only',
          latitude: 29.7606,
          longitude: -95.3978,
        },
      ],
    },
  ];

  for (const cust of customerData) {
    const user = await upsertLoginUser({
      email: cust.email,
      phone: cust.phone,
      role: 'CUSTOMER',
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
      await prisma.property.create({
        data: {
          customerId: profile.id,
          ...prop,
        },
      });
    }

    const propCount = cust.properties.length;
    success(
      `${cust.firstName} ${cust.lastName} ${chalk.gray(`(${cust.email})`)} — ${chalk.yellow(propCount)} ${propCount === 1 ? 'property' : 'properties'}`,
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
    email: string;
    serviceArea: string;
    serviceAreaZips: string;
    verified: boolean;
    stripeAccountId?: string;
    stripeTransfersEnabled?: boolean;
    contractorAgreedAt?: Date;
    serviceNames: string[];
    crews: {
      name: string;
      members: {
        name: string;
        phone?: string;
        role?: string;
        email?: string;
      }[];
    }[];
  }[] = [
    {
      phone: '+15552001001',
      businessName: 'Houston Power Wash Pros',
      description:
        'Top-rated pressure washing company serving Greater Houston since 2018. Residential and commercial.',
      email: 'payouts@houstonpowerwash.example.com',
      serviceArea: 'Houston, Katy, Pearland, Sugar Land, The Woodlands',
      serviceAreaZips: '77008,77002,77019,77494,77584,77381,77573,77479',
      verified: true,
      stripeAccountId: 'acct_seed_houstonpowerwash',
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
            {
              name: 'Jojo Vera',
              phone: '+15559001001',
              email: 'vera.jojo96@gmail.com',
              role: 'Lead',
            },
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
      serviceArea: 'Katy, Sugar Land, Pearland, Houston, The Woodlands',
      serviceAreaZips: '77494,77479,77584,77008,77019,77002,77381,77573',
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
      serviceArea: 'Houston, River Oaks, Heights, Bellaire, West University',
      serviceAreaZips: '77008,77002,77019,77401,77005,77006',
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
        'Professional window cleaning and gutter services. Streak-free guaranteed. Serving Greater Houston for 10+ years.',
      email: 'payouts@crystalclear.example.com',
      serviceArea: 'Houston, League City, Pearland, Sugar Land, The Woodlands',
      serviceAreaZips: '77008,77002,77019,77573,77584,77479,77381',
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
      email: 'office@lonestar.example.com',
      serviceArea: 'Greater Houston — 50-mile radius from downtown',
      serviceAreaZips: '77008,77002,77019,77494,77479,77381,77573,77584',
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
      serviceArea: 'Katy, Sugar Land, Houston Heights',
      serviceAreaZips: '77494,77479,77008',
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
      businessName: 'Bayou City Irrigation & Lighting',
      description:
        'Holiday lighting design plus seasonal exterior lighting. Fully insured crews serving Greater Houston.',
      email: 'payouts@bayoucitylights.example.com',
      serviceArea: 'Houston, The Woodlands, Katy, Sugar Land',
      serviceAreaZips: '77008,77002,77019,77381,77494,77479',
      verified: true,
      stripeAccountId: 'acct_seed_bayoucitylights',
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
      businessName: 'All-Seasons Gutters Houston',
      description:
        'Gutter cleaning, flushing, and guard installation. Same-week residential appointments.',
      email: 'hello@allseasonsgutters.example.com',
      serviceArea: 'Houston, Pearland, League City, The Woodlands',
      serviceAreaZips: '77008,77002,77019,77584,77573,77381',
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
        'New lawn-care outfit covering Cypress and Spring. Awaiting admin verification.',
      email: 'jordan@prairieview.example.com',
      serviceArea: 'Cypress, Spring, Tomball',
      serviceAreaZips: '77433,77379',
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
        'Residential soft wash for siding, driveways, and roofs. Family-owned in Pearland.',
      email: 'hello@sparklesoftwash.example.com',
      serviceArea: 'Pearland, League City, Houston',
      serviceAreaZips: '77584,77573,77002,77008',
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
    const user = await upsertLoginUser({
      email: prov.email,
      phone: prov.phone,
      role: 'PROVIDER',
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

    await attachProviderLogo(user.id, prov.businessName);

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
        let userId: string | undefined;
        const email =
          member.email ??
          (member.phone ? crewLoginEmail(member.name) : undefined);
        if (email) {
          const crewUser = await upsertLoginUser({
            email,
            phone: member.phone,
            role: 'CREW',
          });
          userId = crewUser.id;
        }

        await prisma.crewMember.create({
          data: {
            crewId: crew.id,
            name: member.name,
            email: email || null,
            phone: member.phone || null,
            role: member.role || null,
            userId,
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
  let reviewsCreated = 0;
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
    crewName?: string;
    review?: { rating: number; comment: string };
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
          providerBusiness: 'Houston Power Wash Pros',
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
      customerPhone: '+18325428743',
      propertyIndex: 1,
      serviceName: 'Deck / Patio Wash',
      customerNotes: 'Composite deck off the kitchen. Rental — tenant on site.',
      status: 'OPEN',
      bids: [
        {
          providerBusiness: 'Houston Power Wash Pros',
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
          providerBusiness: 'Houston Power Wash Pros',
          price: 310,
          notes: 'Soft wash, two-story. Includes rinse of patio doors.',
          status: 'ACCEPTED',
        },
      ],
    },
    {
      customerPhone: '+18325428743',
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
      customerPhone: '+18325428743',
      propertyIndex: 0,
      serviceName: 'Driveway Pressure Wash',
      customerNotes: 'Driveway has oil stains near the garage.',
      status: 'SCHEDULED',
      scheduledOffsetDays: 5,
      scheduledTime: '09:00',
      bids: [
        {
          providerBusiness: 'Houston Power Wash Pros',
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
          providerBusiness: 'Bayou City Irrigation & Lighting',
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
      crewName: 'Bravo Team',
      bids: [
        {
          providerBusiness: 'Houston Power Wash Pros',
          price: 160,
          status: 'ACCEPTED',
        },
      ],
    },
    // Alpha Team (Jojo Vera) — 4 jobs on the current calendar day, 8am onward
    {
      customerPhone: '+15551005005',
      propertyIndex: 0,
      serviceName: 'Driveway Pressure Wash',
      customerNotes:
        'Stamped concrete driveway. Soft wash near the garage door.',
      status: 'SCHEDULED',
      scheduledOffsetDays: 0,
      scheduledTime: '08:00',
      crewName: 'Alpha Team',
      bids: [
        {
          providerBusiness: 'Houston Power Wash Pros',
          price: 185,
          notes: 'Oil-stain pretreatment included.',
          status: 'ACCEPTED',
        },
      ],
    },
    {
      customerPhone: '+15551002002',
      propertyIndex: 0,
      serviceName: 'House Siding Wash',
      customerNotes:
        'Two-story vinyl. Dog in backyard — please close the gate.',
      status: 'SCHEDULED',
      scheduledOffsetDays: 0,
      scheduledTime: '10:00',
      crewName: 'Alpha Team',
      bids: [
        {
          providerBusiness: 'Houston Power Wash Pros',
          price: 275,
          notes: 'Soft wash, includes patio doors.',
          status: 'ACCEPTED',
        },
      ],
    },
    {
      customerPhone: '+15551003003',
      propertyIndex: 0,
      serviceName: 'Deck / Patio Wash',
      customerNotes:
        'Composite deck off the kitchen. Rinse furniture in place.',
      status: 'SCHEDULED',
      scheduledOffsetDays: 0,
      scheduledTime: '12:00',
      crewName: 'Alpha Team',
      bids: [
        {
          providerBusiness: 'Houston Power Wash Pros',
          price: 190,
          status: 'ACCEPTED',
        },
      ],
    },
    {
      customerPhone: '+18325428743',
      propertyIndex: 1,
      serviceName: 'Sidewalk & Walkway Wash',
      customerNotes:
        'Front walk and side path at the Katy rental. Tenant on site.',
      status: 'SCHEDULED',
      scheduledOffsetDays: 0,
      scheduledTime: '14:00',
      crewName: 'Alpha Team',
      bids: [
        {
          providerBusiness: 'Houston Power Wash Pros',
          price: 110,
          status: 'ACCEPTED',
        },
      ],
    },
    {
      customerPhone: '+18325428743',
      propertyIndex: 1,
      serviceName: 'Fence / Deck Staining',
      customerNotes: 'Back cedar fence at the Katy rental.',
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
      customerPhone: '+18325428743',
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
      customerPhone: '+18325428743',
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
          providerBusiness: 'Houston Power Wash Pros',
          price: 120,
          status: 'ACCEPTED',
        },
      ],
      review: {
        rating: 5,
        comment: 'Showed up on time and the walkway looks brand new.',
      },
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
      review: {
        rating: 4,
        comment: 'Thorough treatment. Beds look cleaner already.',
      },
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
      review: {
        rating: 5,
        comment: 'Came after hours as requested. Screens look great.',
      },
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
      scenario.status === 'COMPLETED' &&
      scenario.review &&
      acceptedProviderId
    ) {
      await prisma.jobReview.create({
        data: {
          jobId: job.id,
          providerId: acceptedProviderId,
          customerId: custProfile.id,
          rating: scenario.review.rating,
          comment: scenario.review.comment,
        },
      });
      reviewsCreated++;
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
          where: {
            providerId: provProfile.id,
            ...(scenario.crewName ? { name: scenario.crewName } : {}),
          },
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
  count('reviews', reviewsCreated);
  count('payments', paymentsCreated);
  count('transfers', transfersCreated);

  // ═══════════════════════════════════════════════════════════════════════════
  // SAMPLE SUBSCRIPTION
  // ═══════════════════════════════════════════════════════════════════════════

  header('Sample Subscriptions');

  // Give Jordan Vera a Basic Lawn Care subscription
  const jordanProfile = allCustomerProfiles.find(
    (cp) => cp.user.email === 'jordan.vera96@gmail.com',
  );
  const greenscapeProfile = allProviderProfiles.find(
    (pp) => pp.businessName === 'GreenScape Lawn & Garden',
  );

  if (
    jordanProfile &&
    greenscapeProfile &&
    jordanProfile.properties.length > 0
  ) {
    const sub = await prisma.customerSubscription.create({
      data: {
        customerId: jordanProfile.id,
        planId: basicPlan.id,
        propertyId: jordanProfile.properties[0].id,
        status: 'ACTIVE',
        billingFrequency: 'MONTHLY',
        currentPeriodStart: daysFromNow(-15),
        currentPeriodEnd: daysFromNow(15),
        assignedProviderId: greenscapeProfile.id,
      },
    });
    success(
      `Jordan Vera → ${basicPlan.name} (${chalk.green('ACTIVE')}, provider: GreenScape)`,
    );

    const mowingId = serviceMap.get('Weekly Lawn Mowing');
    if (mowingId) {
      const subJob = await prisma.job.create({
        data: {
          propertyId: jordanProfile.properties[0].id,
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
          body: 'Houston Power Wash Pros submitted a bid for your Driveway Pressure Wash job.',
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
          body: 'New Window Cleaning job at 1200 Marina Bay Dr, League City. Submit your bid!',
          read: false,
        },
        {
          userId: user.id,
          type: 'BID_ACCEPTED',
          title: 'Bid Accepted',
          body: 'Jordan Vera accepted your bid for Weekly Lawn Mowing!',
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
  const totalCrewUsers = await prisma.user.count({ where: { role: 'CREW' } });
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
  console.log(`    Crew users ........ ${chalk.cyan(totalCrewUsers)}`);
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

  console.log(chalk.dim('  Test login emails:'));
  console.log(chalk.dim('    Admin:    verawebdev@protonmail.com'));
  console.log(chalk.dim('    Admin:    admin@example.com'));
  console.log(chalk.dim('    Customer: jordan.vera96@gmail.com'));
  console.log(chalk.dim('    Provider: payouts@houstonpowerwash.example.com'));
  console.log(
    chalk.dim('    Crew:     vera.jojo96@gmail.com (Houston Alpha Team)'),
  );
  console.log(
    chalk.dim(
      '    Payout-ready: Houston Power Wash, GreenScape, Texas Painters, Crystal Clear, Bayou City Lights',
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
