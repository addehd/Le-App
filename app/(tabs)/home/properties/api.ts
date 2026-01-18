/**
 * Properties Feature API
 * 
 * This file contains all API calls specific to the properties feature.
 * Following feature-based architecture, each feature owns its network logic.
 * 
 * Environment: EXPO_PUBLIC_CRAWLER_API_URL
 * Endpoint: /go/crawler-og - Fetches OG metadata from property listing URLs
 */

const CRAWLER_BASE_URL = process.env.EXPO_PUBLIC_CRAWLER_API_URL || '';

/**
 * Raw OG metadata from the crawler
 */
export interface RawOGMetadata {
  'country-name'?: string[];
  description?: string[];
  image?: string[];
  latitude?: string[];
  longitude?: string[];
  'office-city'?: string[];
  'office-name'?: string[];
  'office-region'?: string[];
  'postal-code'?: string[];
  'site_name'?: string[];
  'street-address'?: string[];
  title?: string[];
  type?: string[];
  url?: string[];
}

/**
 * Open Graph data returned from the crawler API
 */
export interface OGData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  postalCode?: string;
  country?: string;
  officeName?: string;
  officeRegion?: string;
  siteName?: string;
  price?: number;
  currency?: string;
  area?: number;
  areaUnit?: string;
  bedrooms?: number;
  bathrooms?: number;
}

/**
 * Fetch OG metadata for a property listing URL
 * 
 * @param url - The property listing URL (e.g., from Hemnet, Booli)
 * @returns OG metadata including title, description, image, and property details
 * 
 * @example
 * const data = await fetchOGData('https://www.hemnet.se/bostad/...');
 * console.log(data.title); // "3 rum, 75 m² - Södermalm"
 */
export async function fetchOGData(url: string): Promise<OGData> {
  if (!CRAWLER_BASE_URL) {
    console.warn('EXPO_PUBLIC_CRAWLER_API_URL not configured, using fallback');
    return extractFallbackData(url);
  }

  try {
    const response = await fetch(`${CRAWLER_BASE_URL}/go/crawler-og`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const og: RawOGMetadata = data.og || {};

    console.log('OG data:', data);
    
    return {
      title: data.title,
      description: data.description,
      image: data.image,
      url: data.url,
      address: data.address,
      city: data.city,
      latitude: og.latitude?.[0] ? parseFloat(og.latitude[0]) : undefined,
      longitude: og.longitude?.[0] ? parseFloat(og.longitude[0]) : undefined,
      postalCode: og['postal-code']?.[0],
      country: og['country-name']?.[0],
      officeName: og['office-name']?.[0],
      officeRegion: og['office-region']?.[0],
      siteName: og['site_name']?.[0],
      price: data.price,
      currency: data.currency,
      area: data.area,
      areaUnit: data.areaUnit,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
    };
  } catch (error) {
    console.error('Failed to fetch OG data:', error);
    return extractFallbackData(url);
  }
}

function extractFallbackData(url: string): OGData {
  try {
    const urlObj = new URL(url);
    return {
      title: urlObj.hostname.replace('www.', ''),
      description: `Property from ${urlObj.hostname.replace('www.', '')}`,
    };
  } catch {
    return {
      title: 'Property Link',
      description: '',
    };
  }
}
