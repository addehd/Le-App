import { supabase } from './supabaseClient';
import { goApiClient } from './goApiClient';
import { PropertyLink, PropertyLinkData, FinancialData } from '../store/propertyLinkStore';

/**
 * Properties API - All server operations for property management
 */

// ============ PROPERTIES ============

export interface AddPropertyInput {
  url: string;
  sharedBy: string;
  latitude?: number;
  longitude?: number;
}

// Row shape returned by the `properties` table
interface PropertiesRow {
  id: number;
  url: string;
  title?: string;
  description?: string;
  image_url?: string;
  images?: string[];
  site_name?: string;
  address?: string;
  municipality?: string;
  latitude?: string | number;
  longitude?: string | number;
  price?: number;
  price_per_sqm?: number;
  property_type?: string;
  tenure_type?: string;
  rooms?: number;
  area_sqm?: number;
  floor?: number;
  total_floors?: number;
  has_elevator?: boolean;
  has_balcony?: boolean;
  year_built?: number;
  energy_class?: string;
  association_name?: string;
  monthly_fee?: number;
  visits?: number;
  agent_name?: string;
  listing_date?: string;
  enrichment_status?: Record<string, unknown>;
  shared_by?: string;
  created_at?: string;
  updated_at?: string;
}

function rowToPropertyLink(row: PropertiesRow): PropertyLink {
  const enrichment = (row.enrichment_status || {}) as Record<string, unknown>;

  const hasPropertyData =
    row.address || row.municipality || row.price || row.rooms ||
    row.area_sqm || enrichment.enrichmentStatus;

  const propertyData: PropertyLinkData | undefined = hasPropertyData
    ? {
        price: row.price,
        address: row.address,
        city: row.municipality,
        bedrooms: row.rooms,
        area: row.area_sqm,
        monthlyFee: row.monthly_fee,
        floor: row.floor,
        propertyType: row.property_type,
        buildYear: row.year_built,
        elevator: row.has_elevator,
        balcony: row.has_balcony,
        energyClass: row.energy_class,
        enrichmentStatus: enrichment.enrichmentStatus as PropertyLinkData['enrichmentStatus'],
        lastEnriched: enrichment.lastEnriched as string | undefined,
        currency: enrichment.currency as string | undefined,
      }
    : undefined;

  return {
    id: row.id.toString(),
    url: row.url,
    title: row.title,
    description: row.description,
    image: row.image_url,
    images: row.images,
    sharedBy: row.shared_by || 'anon',
    sharedAt: row.created_at || new Date().toISOString(),
    latitude: row.latitude != null ? Number(row.latitude) : undefined,
    longitude: row.longitude != null ? Number(row.longitude) : undefined,
    propertyData,
    financialData: enrichment.financialData as FinancialData | undefined,
  };
}

/**
 * Fetch all properties from Supabase
 */
export async function fetchProperties(): Promise<PropertyLink[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch properties:', error);
    throw error;
  }

  return (data || []).map((item: PropertiesRow) => rowToPropertyLink(item));
}

/**
 * Fetch property metadata from external API (OG tags)
 */
export async function fetchPropertyMetadata(url: string): Promise<{
  title?: string;
  description?: string;
  image?: string;
  images?: string[];
  propertyData?: PropertyLinkData;
}> {
  try {
    // Validate URL
    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    // Check if Go API is configured
    if (!goApiClient.isConfigured()) {
      console.warn('⚠️ Go API not configured, using fallback');
      return {
        title: urlObj.hostname.replace('www.', ''),
        description: `Property from ${urlObj.hostname.replace('www.', '')}`,
        image: '',
        propertyData: {
          enrichmentStatus: 'og_only' as const,
        }
      };
    }

    // Extract OG metadata (fast, synchronous)
    console.log('📥 Extracting OG metadata for', url);
    const ogResponse = await goApiClient.extractOGMetadata(url);

    if (ogResponse.error) {
      console.error('OG extraction error:', ogResponse.error);
      return {
        title: urlObj.hostname.replace('www.', ''),
        description: `Property from ${urlObj.hostname.replace('www.', '')}`,
        image: '',
        propertyData: {
          enrichmentStatus: 'llm_failed' as const,
        }
      };
    }

    // Convert OG response to PropertyLinkData format
    const propertyData: PropertyLinkData = {
      price: ogResponse.price,
      currency: ogResponse.currency || 'SEK',
      address: ogResponse.address,
      city: ogResponse.city,
      area: ogResponse.area,
      bedrooms: ogResponse.bedrooms,
      enrichmentStatus: 'og_only',
      lastEnriched: new Date().toISOString(),
    };

    // Extract all images
    const images: string[] = [];
    if (ogResponse.image) {
      images.push(ogResponse.image);
    }
    if (ogResponse.og?.image) {
      images.push(...ogResponse.og.image.filter(img => img && !images.includes(img)));
    }

    return {
      title: ogResponse.title || urlObj.hostname.replace('www.', ''),
      description: ogResponse.description || '',
      image: ogResponse.image || '',
      images: images.length > 0 ? images : undefined,
      propertyData: Object.keys(propertyData).length > 0 ? propertyData : undefined
    };
  } catch (error) {
    console.error('Error fetching property metadata:', error);
    try {
      const urlObj = new URL(url);
      return {
        title: urlObj.hostname.replace('www.', ''),
        description: '',
        image: '',
        propertyData: {
          enrichmentStatus: 'llm_failed' as const,
        }
      };
    } catch {
      return {
        title: 'Property Link',
        description: '',
        image: '',
        propertyData: {
          enrichmentStatus: 'llm_failed' as const,
        }
      };
    }
  }
}

/**
 * Add a new property
 */
export async function addProperty(input: AddPropertyInput): Promise<PropertyLink> {
  const metadata = await fetchPropertyMetadata(input.url);
  const pd = metadata.propertyData;

  const { data, error } = await supabase
    .from('properties')
    .insert({
      url: input.url,
      title: metadata.title,
      description: metadata.description,
      image_url: metadata.image,
      images: metadata.images,
      shared_by: input.sharedBy,
      latitude: input.latitude,
      longitude: input.longitude,
      address: pd?.address,
      municipality: pd?.city,
      price: pd?.price,
      rooms: pd?.bedrooms,
      area_sqm: pd?.area,
      monthly_fee: pd?.monthlyFee,
      floor: typeof pd?.floor === 'number' ? pd.floor : undefined,
      property_type: pd?.propertyType,
      year_built: pd?.buildYear,
      has_elevator: typeof pd?.elevator === 'boolean' ? pd.elevator : undefined,
      has_balcony: typeof pd?.balcony === 'boolean' ? pd.balcony : undefined,
      energy_class: pd?.energyClass,
      enrichment_status: pd
        ? { enrichmentStatus: pd.enrichmentStatus, lastEnriched: pd.lastEnriched, currency: pd.currency }
        : {},
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to add property:', error);
    throw error;
  }

  return rowToPropertyLink(data as PropertiesRow);
}

/**
 * Update a property
 */
export async function updateProperty(
  id: string,
  updates: Partial<PropertyLink>
): Promise<PropertyLink> {
  const pd = updates.propertyData;
  const fd = updates.financialData;

  const payload: Record<string, unknown> = {};

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.image !== undefined) payload.image_url = updates.image;
  if (updates.images !== undefined) payload.images = updates.images;
  if (updates.latitude !== undefined) payload.latitude = updates.latitude;
  if (updates.longitude !== undefined) payload.longitude = updates.longitude;

  if (pd) {
    if (pd.address !== undefined) payload.address = pd.address;
    if (pd.city !== undefined) payload.municipality = pd.city;
    if (pd.price !== undefined) payload.price = pd.price;
    if (pd.bedrooms !== undefined) payload.rooms = pd.bedrooms;
    if (pd.area !== undefined) payload.area_sqm = pd.area;
    if (pd.monthlyFee !== undefined) payload.monthly_fee = pd.monthlyFee;
    if (typeof pd.floor === 'number') payload.floor = pd.floor;
    if (pd.propertyType !== undefined) payload.property_type = pd.propertyType;
    if (pd.buildYear !== undefined) payload.year_built = pd.buildYear;
    if (typeof pd.elevator === 'boolean') payload.has_elevator = pd.elevator;
    if (typeof pd.balcony === 'boolean') payload.has_balcony = pd.balcony;
    if (pd.energyClass !== undefined) payload.energy_class = pd.energyClass;
    payload.enrichment_status = {
      enrichmentStatus: pd.enrichmentStatus,
      lastEnriched: pd.lastEnriched,
      currency: pd.currency,
      ...(fd ? { financialData: fd } : {}),
    };
  }

  const { data, error } = await supabase
    .from('properties')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update property:', error);
    throw error;
  }

  return rowToPropertyLink(data as PropertiesRow);
}

/**
 * Delete a property
 */
export async function deleteProperty(id: string): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete property:', error);
    throw error;
  }
}

/**
 * Update financial data for a property — stored inside enrichment_status jsonb
 */
export async function updateFinancialData(
  id: string,
  financialData: FinancialData
): Promise<void> {
  const { data: existing } = await supabase
    .from('properties')
    .select('enrichment_status')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('properties')
    .update({
      enrichment_status: {
        ...(existing?.enrichment_status || {}),
        financialData,
      },
    })
    .eq('id', id);

  if (error) {
    console.error('Failed to update financial data:', error);
    throw error;
  }
}
