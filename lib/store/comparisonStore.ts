import { create } from 'zustand';
import { PropertyLink } from './propertyLinkStore';
import { PropertyComparison, ComparisonMetrics, ProsCons } from '../types/property';

interface ComparisonState {
  selectedPropertyIds: string[];
  comparisonData: PropertyComparison[];
  autoSaveEnabled: boolean;
  
  // Actions
  selectProperty: (propertyId: string) => void;
  deselectProperty: (propertyId: string) => void;
  clearSelection: () => void;
  generateComparison: (properties: PropertyLink[]) => void;
  enableAutoSave: () => void;
  disableAutoSave: () => void;
}

// Helper function to calculate metrics for comparison
const calculateMetrics = (
  property: PropertyLink,
  allProperties: PropertyLink[]
): ComparisonMetrics => {
  const pricePerSqm = property.propertyData?.price && property.propertyData?.area
    ? property.propertyData.price / property.propertyData.area
    : null;

  // Calculate ranks (1 = best/cheapest)
  const sortedByPrice = [...allProperties].sort(
    (a, b) => (a.propertyData?.price || Infinity) - (b.propertyData?.price || Infinity)
  );
  const sortedByArea = [...allProperties].sort(
    (a, b) => (b.propertyData?.area || 0) - (a.propertyData?.area || 0)
  );
  const sortedByBedrooms = [...allProperties].sort(
    (a, b) => (b.propertyData?.bedrooms || 0) - (a.propertyData?.bedrooms || 0)
  );
  const sortedByPricePerSqm = [...allProperties]
    .filter(p => p.propertyData?.price && p.propertyData?.area)
    .sort((a, b) => {
      const aPrice = (a.propertyData!.price! / a.propertyData!.area!);
      const bPrice = (b.propertyData!.price! / b.propertyData!.area!);
      return aPrice - bPrice;
    });

  return {
    pricePerSqm,
    priceRank: sortedByPrice.findIndex(p => p.id === property.id) + 1,
    areaRank: sortedByArea.findIndex(p => p.id === property.id) + 1,
    bedroomRank: sortedByBedrooms.findIndex(p => p.id === property.id) + 1,
    pricePerSqmRank: pricePerSqm 
      ? sortedByPricePerSqm.findIndex(p => p.id === property.id) + 1
      : allProperties.length + 1,
  };
};

// Helper function to generate pros and cons
const generateProsCons = (
  property: PropertyLink,
  metrics: ComparisonMetrics,
  allProperties: PropertyLink[]
): ProsCons => {
  const pros: string[] = [];
  const cons: string[] = [];

  // Price ranking
  if (metrics.priceRank === 1) {
    pros.push('Lowest price among compared properties');
  } else if (metrics.priceRank === allProperties.length) {
    cons.push('Highest price among compared properties');
  }

  // Price per sqm ranking
  if (metrics.pricePerSqmRank === 1 && metrics.pricePerSqm) {
    pros.push('Best value per square meter');
  } else if (metrics.pricePerSqmRank === allProperties.length && metrics.pricePerSqm) {
    cons.push('Highest price per square meter');
  }

  // Area ranking
  if (metrics.areaRank === 1) {
    pros.push('Largest living area');
  } else if (metrics.areaRank === allProperties.length) {
    cons.push('Smallest living area');
  }

  // Bedroom ranking
  if (metrics.bedroomRank === 1 && property.propertyData?.bedrooms) {
    pros.push('Most bedrooms');
  }

  // Energy class
  if (property.propertyData?.energyClass) {
    const energyClass = property.propertyData.energyClass.toUpperCase();
    if (['A', 'A+', 'A++'].includes(energyClass)) {
      pros.push(`Excellent energy efficiency (${energyClass})`);
    } else if (['E', 'F', 'G'].includes(energyClass)) {
      cons.push(`Low energy efficiency (${energyClass})`);
    }
  }

  // Built year
  if (property.propertyData?.buildYear) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - property.propertyData.buildYear;
    if (age < 5) {
      pros.push('Recently built property');
    } else if (age > 50) {
      cons.push('Older property, may need renovations');
    }
  }

  // Monthly fee
  if (property.propertyData?.monthlyFee) {
    const avgFee = allProperties
      .filter(p => p.propertyData?.monthlyFee)
      .reduce((sum, p) => sum + (p.propertyData?.monthlyFee || 0), 0) / 
      allProperties.filter(p => p.propertyData?.monthlyFee).length;

    if (property.propertyData.monthlyFee < avgFee * 0.8) {
      pros.push('Low monthly fee');
    } else if (property.propertyData.monthlyFee > avgFee * 1.2) {
      cons.push('High monthly fee');
    }
  }

  // Features
  if (property.propertyData?.elevator) {
    pros.push('Has elevator');
  }
  if (property.propertyData?.balcony) {
    pros.push('Has balcony');
  }
  if (property.propertyData?.parking) {
    pros.push('Parking available');
  }

  return { pros, cons };
};

// Simple localStorage helpers
const saveSelectedIds = (ids: string[]) => {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    window.localStorage.setItem('comparison-selected-ids', JSON.stringify(ids));
  }
};

const loadSelectedIds = (): string[] => {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    const item = window.localStorage.getItem('comparison-selected-ids');
    return item ? JSON.parse(item) : [];
  }
  return [];
};

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  selectedPropertyIds: loadSelectedIds(),
  comparisonData: [],
  autoSaveEnabled: false,

  selectProperty: (propertyId) => {
    const newIds = [...get().selectedPropertyIds, propertyId];
    set({ selectedPropertyIds: newIds });
    if (get().autoSaveEnabled) {
      saveSelectedIds(newIds);
    }
  },

  deselectProperty: (propertyId) => {
    const newIds = get().selectedPropertyIds.filter(id => id !== propertyId);
    set({ selectedPropertyIds: newIds });
    if (get().autoSaveEnabled) {
      saveSelectedIds(newIds);
    }
  },

  clearSelection: () => {
    set({ selectedPropertyIds: [], comparisonData: [] });
    if (get().autoSaveEnabled) {
      saveSelectedIds([]);
    }
  },

  generateComparison: (properties) => {
    if (properties.length === 0) {
      set({ comparisonData: [] });
      return;
    }

    const comparisonData: PropertyComparison[] = properties.map(property => {
      const metrics = calculateMetrics(property, properties);
      const prosCons = generateProsCons(property, metrics, properties);

      return {
        property,
        metrics,
        prosCons,
      };
    });

    set({ comparisonData });
  },

  enableAutoSave: () => {
    set({ autoSaveEnabled: true });
    // Save current state immediately
    saveSelectedIds(get().selectedPropertyIds);
  },

  disableAutoSave: () => {
    set({ autoSaveEnabled: false });
  },
}));
