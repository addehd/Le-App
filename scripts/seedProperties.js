// Simple JavaScript seed script - can run with: node scripts/seedProperties.js
const { createClient } = require('@supabase/supabase-js');

// Read from environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be set in your environment');
  console.log('\nPlease set these variables or run with:');
  console.log('EXPO_PUBLIC_SUPABASE_URL=your_url EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key node scripts/seedProperties.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const sampleProperties = [
  {
    id: 'prop-001',
    url: 'https://example.com/property/1',
    title: 'Modern 3-Room Apartment in Södermalm',
    description: 'Spacious apartment with balcony and excellent public transport connections',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    shared_by: 'demo@example.com',
    shared_at: new Date().toISOString(),
    latitude: 59.3141,
    longitude: 18.0812,
    short_description: 'Bright apartment with modern kitchen and great location',
    property_data: {
      price: 4500000,
      currency: 'SEK',
      bedrooms: 2,
      bathrooms: 1,
      area: 72,
      areaUnit: 'm²',
      propertyType: 'Apartment',
      address: 'Götgatan 45',
      city: 'Stockholm',
      energyClass: 'B',
      builtYear: 2015,
      floor: '3',
      monthlyFee: 4200,
    },
    sun_orientation: {
      direction: 'south',
      balconyDirection: ['south'],
      windowDirections: ['south', 'east'],
      sunHours: 6,
    },
    floor_plans: [
      {
        id: 'fp-001-1',
        url: 'https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=600',
        title: 'Main Floor Plan',
        type: 'floor_plan',
      },
    ],
    image_gallery: [
      {
        id: 'img-001-1',
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        isPrimary: true,
        order: 1,
      },
    ],
  },
  {
    id: 'prop-002',
    url: 'https://example.com/property/2',
    title: 'Spacious 4-Room with Balcony in Vasastan',
    description: 'Large family apartment in quiet neighborhood with parks nearby',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    shared_by: 'demo@example.com',
    shared_at: new Date().toISOString(),
    latitude: 59.3428,
    longitude: 18.0463,
    short_description: 'Family-friendly apartment with high ceilings and original features',
    property_data: {
      price: 5200000,
      currency: 'SEK',
      bedrooms: 3,
      bathrooms: 1,
      area: 95,
      areaUnit: 'm²',
      propertyType: 'Apartment',
      address: 'Dalagatan 12',
      city: 'Stockholm',
      energyClass: 'C',
      builtYear: 1972,
      floor: '2',
      monthlyFee: 5800,
    },
    sun_orientation: {
      direction: 'west',
      balconyDirection: ['west'],
      windowDirections: ['west', 'north'],
      sunHours: 4,
    },
    floor_plans: [
      {
        id: 'fp-002-1',
        url: 'https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=600',
        title: 'Floor Plan',
        type: 'floor_plan',
      },
    ],
    image_gallery: [],
  },
  {
    id: 'prop-003',
    url: 'https://example.com/property/3',
    title: 'Compact 2-Room in Östermalm',
    description: 'Perfect starter apartment in prestigious area',
    image: 'https://images.unsplash.com/photo-1502672260066-6bc0f2f0c9f0?w=800',
    shared_by: 'demo@example.com',
    shared_at: new Date().toISOString(),
    latitude: 59.3398,
    longitude: 18.0843,
    short_description: 'New construction with top energy rating and modern amenities',
    property_data: {
      price: 3800000,
      currency: 'SEK',
      bedrooms: 1,
      bathrooms: 1,
      area: 52,
      areaUnit: 'm²',
      propertyType: 'Apartment',
      address: 'Karlavägen 88',
      city: 'Stockholm',
      energyClass: 'A',
      builtYear: 2020,
      floor: '5',
      monthlyFee: 3200,
    },
    sun_orientation: {
      direction: 'east',
      windowDirections: ['east'],
      sunHours: 5,
    },
    floor_plans: [
      {
        id: 'fp-003-1',
        url: 'https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=600',
        title: 'Floor Plan',
        type: 'floor_plan',
      },
    ],
    image_gallery: [],
  },
  {
    id: 'prop-004',
    url: 'https://example.com/property/4',
    title: 'Luxury 5-Room Penthouse with Terrace',
    description: 'Exclusive top-floor apartment with panoramic views',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    shared_by: 'demo@example.com',
    shared_at: new Date().toISOString(),
    latitude: 59.3293,
    longitude: 18.0686,
    short_description: 'Luxurious living with terrace and waterfront views',
    property_data: {
      price: 8500000,
      currency: 'SEK',
      bedrooms: 4,
      bathrooms: 2,
      area: 145,
      areaUnit: 'm²',
      propertyType: 'Penthouse',
      address: 'Strandvägen 22',
      city: 'Stockholm',
      energyClass: 'B',
      builtYear: 2018,
      floor: '7',
      monthlyFee: 8500,
    },
    sun_orientation: {
      direction: 'southwest',
      balconyDirection: ['south', 'west'],
      windowDirections: ['south', 'west', 'north'],
      sunHours: 8,
    },
    floor_plans: [
      {
        id: 'fp-004-1',
        url: 'https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=600',
        title: 'Main Floor',
        type: 'floor_plan',
      },
      {
        id: 'fp-004-2',
        url: 'https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=600',
        title: 'Terrace Layout',
        type: 'layout',
      },
    ],
    image_gallery: [],
  },
];

async function seedProperties() {
  console.log('🌱 Starting property seeding...\n');

  for (const property of sampleProperties) {
    try {
      const { error } = await supabase.from('property_links').upsert({
        id: property.id,
        url: property.url,
        title: property.title,
        description: property.description,
        image: property.image,
        shared_by: property.shared_by,
        shared_at: property.shared_at,
        latitude: property.latitude,
        longitude: property.longitude,
        property_data: property.property_data,
        floor_plans: property.floor_plans,
        sun_orientation: property.sun_orientation,
        image_gallery: property.image_gallery,
        short_description: property.short_description,
      });

      if (error) {
        console.error(`❌ Failed to insert ${property.title}:`, error.message);
      } else {
        console.log(`✅ Inserted: ${property.title}`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${property.title}:`, err.message);
    }
  }

  console.log('\n✨ Seeding complete!');
}

// Run the seed function
seedProperties()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('💥 Seeding failed:', err);
    process.exit(1);
  });
