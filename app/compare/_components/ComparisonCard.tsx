import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { PropertyComparison } from '../../../lib/types/property';

interface ComparisonCardProps {
  comparison: PropertyComparison;
  highlightBest?: boolean;
  onImageSelect?: (imageId: string) => void;
  selectedImageId?: string;
}

export function ComparisonCard({
  comparison,
  highlightBest = true,
  onImageSelect,
  selectedImageId,
}: ComparisonCardProps) {
  const { property, metrics, prosCons } = comparison;
  const data = property.propertyData;

  return (
    <View className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 min-w-[300px] max-w-[400px]">
      {/* Image Section */}
      {property.image && (
        <View className="relative">
          <Image
            source={{ uri: property.image }}
            className="w-full h-48"
            resizeMode="cover"
          />
          {metrics.priceRank === 1 && highlightBest && (
            <View className="absolute top-2 right-2 bg-green-500 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">Best Value</Text>
            </View>
          )}
        </View>
      )}

      {/* Header */}
      <View className="p-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900" numberOfLines={2}>
          {property.title || 'Property'}
        </Text>
        {data?.address && (
          <Text className="text-sm text-gray-600 mt-1">{data.address}</Text>
        )}
        {(data as any)?.shortDescription && (
          <Text className="text-sm text-gray-700 mt-2" numberOfLines={2}>
            {(data as any).shortDescription}
          </Text>
        )}
      </View>

      {/* Key Metrics */}
      <View className="p-4 bg-gray-50 border-b border-gray-200">
        <View className="flex-row justify-between mb-2">
          <View>
            <Text className="text-xs text-gray-600">Price</Text>
            <Text className="text-lg font-bold text-gray-900">
              {data?.price?.toLocaleString() || 'N/A'} {data?.currency || 'SEK'}
            </Text>
          </View>
          {metrics.pricePerSqm && (
            <View>
              <Text className="text-xs text-gray-600">Per m²</Text>
              <Text className="text-lg font-bold text-blue-600">
                {Math.round(metrics.pricePerSqm).toLocaleString()}{' '}
                {data?.currency || 'SEK'}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row gap-2 mt-3">
          {data?.bedrooms && (
            <View className="flex-1 bg-white rounded-lg p-2">
              <Text className="text-xs text-gray-600">Bedrooms</Text>
              <Text className="text-base font-semibold">{data.bedrooms}</Text>
            </View>
          )}
          {data?.bathrooms && (
            <View className="flex-1 bg-white rounded-lg p-2">
              <Text className="text-xs text-gray-600">Bathrooms</Text>
              <Text className="text-base font-semibold">{data.bathrooms}</Text>
            </View>
          )}
          {data?.area && (
            <View className="flex-1 bg-white rounded-lg p-2">
              <Text className="text-xs text-gray-600">Area</Text>
              <Text className="text-base font-semibold">
                {data.area} {data.areaUnit || 'm²'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Pros & Cons */}
      <View className="p-4">
        <Text className="text-sm font-semibold text-gray-900 mb-2">Pros</Text>
        {prosCons.pros.length > 0 ? (
          prosCons.pros.map((pro, index) => (
            <View key={index} className="flex-row items-start mb-1">
              <Text className="text-green-600 mr-2">✓</Text>
              <Text className="text-xs text-gray-700 flex-1">{pro}</Text>
            </View>
          ))
        ) : (
          <Text className="text-xs text-gray-400 italic">No notable advantages</Text>
        )}

        <Text className="text-sm font-semibold text-gray-900 mt-3 mb-2">Cons</Text>
        {prosCons.cons.length > 0 ? (
          prosCons.cons.map((con, index) => (
            <View key={index} className="flex-row items-start mb-1">
              <Text className="text-red-600 mr-2">✗</Text>
              <Text className="text-xs text-gray-700 flex-1">{con}</Text>
            </View>
          ))
        ) : (
          <Text className="text-xs text-gray-400 italic">No notable disadvantages</Text>
        )}
      </View>

      {/* Additional Details */}
      <View className="p-4 bg-gray-50 border-t border-gray-200">
        <View className="flex-row flex-wrap gap-2">
          {data?.energyClass && (
            <View className="bg-white px-2 py-1 rounded">
              <Text className="text-xs">
                <Text className="font-semibold">Energy: </Text>
                {data.energyClass}
              </Text>
            </View>
          )}
          {data?.builtYear && (
            <View className="bg-white px-2 py-1 rounded">
              <Text className="text-xs">
                <Text className="font-semibold">Built: </Text>
                {data.builtYear}
              </Text>
            </View>
          )}
          {data?.floor && (
            <View className="bg-white px-2 py-1 rounded">
              <Text className="text-xs">
                <Text className="font-semibold">Floor: </Text>
                {data.floor}
              </Text>
            </View>
          )}
          {data?.monthlyFee && (
            <View className="bg-white px-2 py-1 rounded">
              <Text className="text-xs">
                <Text className="font-semibold">Fee: </Text>
                {data.monthlyFee.toLocaleString()}/mo
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
