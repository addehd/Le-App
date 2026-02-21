import { useState } from 'react';
import { Platform, View, Text, Pressable, ScrollView, TextInput, Image, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react-native';
import { PropertyLink } from '@/lib/store/propertyLinkStore';
import { useProperties } from '@/lib/query/useProperties';
import { usePropertyRealtimeSubscription } from '@/lib/query/useRealtimeSubscriptions';
import { useAuth } from '@/lib/query/useAuth';
import { fetchPropertyMetadata, insertPropertyWithMetadata } from '@/lib/api/properties';
import { fetchGeocodeData } from './api';

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function PropertyCard({ property, onRemove }: { property: PropertyLink; onRemove: () => void }) {
  const router = useRouter();
  const isTemp = property.id.startsWith('temp-');
  const hasMeta = !!property.title;

  const handlePress = () => {
    if (isTemp) return;
    router.push(`/home/properties/${property.id}`);
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return null;
    return `${price.toLocaleString('sv-SE')} ${currency || 'kr'}`;
  };

  if (Platform.OS === 'web') {
    return (
      <div
        className={`bg-white rounded-xl shadow-md overflow-hidden transition-shadow ${isTemp ? 'cursor-default' : 'hover:shadow-lg cursor-pointer'}`}
        onClick={handlePress}
      >
        <div className="flex">
          {/* Image */}
          <div className="w-40 h-32 flex-shrink-0 bg-gray-100 flex items-center justify-center relative">
            {property.image ? (
              <img
                src={property.image}
                alt={property.title || 'Property'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                {isTemp && !hasMeta ? (
                  <div className="animate-spin">
                    <Loader2 size={28} color="#d1d5db" />
                  </div>
                ) : (
                  <span className="text-4xl">🏠</span>
                )}
              </div>
            )}
            {isTemp && hasMeta && (
              <div className="absolute top-1.5 right-1.5 bg-white/80 backdrop-blur rounded-full p-1 shadow-sm">
                <div className="animate-spin">
                  <Loader2 size={10} color="#9ca3af" />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
            <div>
              {hasMeta ? (
                <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                  {property.title}
                </h3>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="animate-spin flex-shrink-0">
                    <Loader2 size={13} color="#9ca3af" />
                  </div>
                  <span className="text-gray-500 text-sm font-medium truncate">
                    {extractDomain(property.url)}
                  </span>
                </div>
              )}
              {property.description && (
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {property.description}
                </p>
              )}
              {!hasMeta && (
                <p className="text-gray-400 text-xs mt-1 truncate">{property.url}</p>
              )}
              {property.propertyData?.address && (
                <p className="text-gray-500 text-xs mt-1">
                  📍 {property.propertyData.address}
                  {property.propertyData.city && `, ${property.propertyData.city}`}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              {property.propertyData?.price && (
                <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {formatPrice(property.propertyData.price, property.propertyData.currency)}
                </span>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {property.propertyData?.area && (
                  <span>{property.propertyData.area} {property.propertyData.areaUnit || 'm²'}</span>
                )}
                {property.propertyData?.bedrooms && (
                  <span>{property.propertyData.bedrooms} rum</span>
                )}
              </div>
            </div>
          </div>

          {/* Remove button — hidden while saving */}
          {!isTemp && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-2 text-gray-400 hover:text-red-500 self-start m-2 flex-shrink-0"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }

  // Native version
  return (
    <Pressable
      onPress={handlePress}
      disabled={isTemp}
      className="bg-white rounded-xl shadow-md overflow-hidden mb-3"
    >
      <View className="flex-row">
        {/* Image */}
        <View className="w-32 h-28 bg-gray-100 items-center justify-center relative">
          {property.image ? (
            <Image
              source={{ uri: property.image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              {isTemp && !hasMeta ? (
                <ActivityIndicator size="small" color="#d1d5db" />
              ) : (
                <Text className="text-4xl">🏠</Text>
              )}
            </View>
          )}
          {isTemp && hasMeta && (
            <View className="absolute top-1 right-1 bg-white rounded-full p-1">
              <ActivityIndicator size="small" color="#9ca3af" />
            </View>
          )}
        </View>

        {/* Content */}
        <View className="flex-1 p-3 justify-between">
          <View>
            {hasMeta ? (
              <Text className="font-semibold text-gray-900 text-base" numberOfLines={1}>
                {property.title}
              </Text>
            ) : (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#9ca3af" />
                <Text className="text-gray-500 text-sm font-medium" numberOfLines={1}>
                  {extractDomain(property.url)}
                </Text>
              </View>
            )}
            {property.description ? (
              <Text className="text-gray-600 text-sm mt-1" numberOfLines={2}>
                {property.description}
              </Text>
            ) : !hasMeta ? (
              <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
                {property.url}
              </Text>
            ) : null}
          </View>

          <View className="flex-row items-center justify-between mt-2">
            {property.propertyData?.price && (
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-800 text-xs font-semibold">
                  {formatPrice(property.propertyData.price, property.propertyData.currency)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Remove button — hidden while saving */}
        {!isTemp && (
          <Pressable onPress={onRemove} className="p-2 self-start">
            <Text className="text-gray-400 text-lg">✕</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

function LoadingCard() {
  if (Platform.OS === 'web') {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
        <div className="flex">
          <div className="w-40 h-32 bg-gray-300" />
          <div className="flex-1 p-4 space-y-3">
            <div className="h-5 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <View className="bg-white rounded-xl shadow-md overflow-hidden mb-3">
      <View className="flex-row">
        <View className="w-32 h-28 bg-gray-300" />
        <View className="flex-1 p-3 gap-2">
          <View className="h-4 bg-gray-300 rounded w-3/4" />
          <View className="h-3 bg-gray-200 rounded w-full" />
          <View className="h-3 bg-gray-200 rounded w-1/2" />
        </View>
      </View>
    </View>
  );
}

export default function PropertiesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const {
    properties,
    isLoading: isLoadingProperties,
    deleteProperty,
  } = useProperties();

  usePropertyRealtimeSubscription();

  const handleAddProperty = async () => {
    if (!url.trim()) return;
    setError(null);

    const trimmedUrl = url.trim();
    setUrl('');

    const tempId = `temp-${Date.now()}`;
    const sharedBy = user?.email || 'anon';

    // 1. Show card immediately in the list
    queryClient.setQueryData<PropertyLink[]>(['properties'], (old) => [
      {
        id: tempId,
        url: trimmedUrl,
        title: undefined,
        sharedBy,
        sharedAt: new Date().toISOString(),
      },
      ...(old || []),
    ]);

    // 2. Start geocode in parallel
    const geocodePromise = fetchGeocodeData(trimmedUrl).catch(() => null);

    try {
      // 3. Fetch OG metadata — card populates when this resolves
      const metadata = await fetchPropertyMetadata(trimmedUrl);

      // 4. Update card with OG data
      queryClient.setQueryData<PropertyLink[]>(['properties'], (old) =>
        (old || []).map((p) =>
          p.id === tempId
            ? {
                ...p,
                title: metadata.title,
                description: metadata.description,
                image: metadata.image,
                images: metadata.images,
                propertyData: metadata.propertyData,
              }
            : p
        )
      );

      // 5. Wait for geocode
      const geocodeData = await geocodePromise;

      // 6. Save to DB with pre-fetched metadata
      const saved = await insertPropertyWithMetadata({
        url: trimmedUrl,
        sharedBy,
        latitude: geocodeData?.latitude,
        longitude: geocodeData?.longitude,
        title: metadata.title,
        description: metadata.description,
        image: metadata.image,
        images: metadata.images,
        propertyData: metadata.propertyData,
      });

      // 7. Replace temp entry with real DB entry
      queryClient.setQueryData<PropertyLink[]>(['properties'], (old) =>
        (old || []).map((p) => (p.id === tempId ? saved : p))
      );
    } catch (err: any) {
      console.error('Error adding property:', err);
      queryClient.setQueryData<PropertyLink[]>(['properties'], (old) =>
        (old || []).filter((p) => p.id !== tempId)
      );
      setError(err.message || 'Failed to add property');
    }
  };

  const handlePaste = async () => {
    if (Platform.OS === 'web') {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.startsWith('http')) {
          setUrl(text);
        }
      } catch (err) {
        console.error('Failed to read clipboard:', err);
      }
    }
  };

  if (Platform.OS === 'web') {
    return (
      <div className="h-screen bg-gray-100 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 mb-2"
            >
              ← Tillbaka
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Bostadslista</h1>
            <p className="text-sm text-gray-600 mt-1">
              Klistra in länkar till bostäder ni är intresserade av
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-6 py-6">
          {/* URL Input */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lägg till bostad
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddProperty()}
                placeholder="https://www.hemnet.se/bostad/..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handlePaste}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Klistra in
              </button>
              <button
                onClick={handleAddProperty}
                disabled={!url.trim()}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  !url.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Lägg till
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Loading state */}
          {isLoadingProperties && properties.length === 0 && <LoadingCard />}

          {/* Property List */}
          <div className="space-y-4">
            {properties.length === 0 && !isLoadingProperties ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🏠</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Inga bostäder än
                </h2>
                <p className="text-gray-600">
                  Klistra in en länk från Hemnet, Booli eller annan bostadssajt för att komma igång
                </p>
              </div>
            ) : (
              properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onRemove={() => deleteProperty(property.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Native version
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-6 py-4">
          <Pressable onPress={() => router.back()} className="mb-2">
            <Text className="text-gray-600">← Tillbaka</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900">Bostadslista</Text>
          <Text className="text-sm text-gray-600 mt-1">
            Klistra in länkar till bostäder ni är intresserade av
          </Text>
        </View>

        {/* Content */}
        <View className="px-6 py-4">
          {/* URL Input */}
          <View className="bg-white rounded-xl shadow-md p-4 mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Lägg till bostad
            </Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="https://www.hemnet.se/bostad/..."
              className="px-4 py-3 border border-gray-300 rounded-lg mb-3"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <Pressable
              onPress={handleAddProperty}
              disabled={!url.trim()}
              className={`py-3 rounded-lg ${
                !url.trim() ? 'bg-gray-300' : 'bg-blue-600'
              }`}
            >
              <Text className={`text-center font-semibold ${
                !url.trim() ? 'text-gray-500' : 'text-white'
              }`}>
                Lägg till
              </Text>
            </Pressable>
            {error && (
              <Text className="mt-2 text-sm text-red-600">{error}</Text>
            )}
          </View>

          {/* Loading state */}
          {isLoadingProperties && properties.length === 0 && <LoadingCard />}

          {/* Property List */}
          {properties.length === 0 && !isLoadingProperties ? (
            <View className="bg-white rounded-xl shadow-md p-8 items-center">
              <Text className="text-5xl mb-4">🏠</Text>
              <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Inga bostäder än
              </Text>
              <Text className="text-gray-600 text-center">
                Klistra in en länk från Hemnet, Booli eller annan bostadssajt
              </Text>
            </View>
          ) : (
            properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onRemove={() => deleteProperty(property.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
