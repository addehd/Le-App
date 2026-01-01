import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { PropertyLink } from '../../../lib/store/propertyLinkStore';

interface PropertySelectorProps {
  properties: PropertyLink[];
  selectedIds: string[];
  onToggleProperty: (propertyId: string) => void;
  maxSelection?: number;
}

export function PropertySelector({
  properties,
  selectedIds,
  onToggleProperty,
  maxSelection = 4,
}: PropertySelectorProps) {
  const isSelected = (id: string) => selectedIds.includes(id);
  const canAddMore = selectedIds.length < maxSelection;

  return (
    <View className="bg-white rounded-lg shadow p-4">
      <Text className="text-lg font-bold text-gray-900 mb-3">
        Select Properties to Compare ({selectedIds.length}/{maxSelection})
      </Text>

      <ScrollView className="max-h-96">
        {properties.map((property) => {
          const selected = isSelected(property.id);
          const disabled = !selected && !canAddMore;

          return (
            <Pressable
              key={property.id}
              onPress={() => !disabled && onToggleProperty(property.id)}
              disabled={disabled}
              className={`flex-row mb-3 p-3 rounded-lg border ${
                selected
                  ? 'bg-blue-50 border-blue-500'
                  : disabled
                  ? 'bg-gray-100 border-gray-200 opacity-50'
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* Checkbox */}
              <View
                className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                  selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                }`}
              >
                {selected && <Text className="text-white text-xs">✓</Text>}
              </View>

              {/* Thumbnail */}
              {property.image && (
                <Image
                  source={{ uri: property.image }}
                  className="w-16 h-16 rounded mr-3"
                  resizeMode="cover"
                />
              )}

              {/* Details */}
              <View className="flex-1">
                <Text
                  className={`text-sm font-semibold ${
                    disabled ? 'text-gray-400' : 'text-gray-900'
                  }`}
                  numberOfLines={1}
                >
                  {property.title || 'Property'}
                </Text>
                {property.propertyData?.address && (
                  <Text className="text-xs text-gray-600" numberOfLines={1}>
                    {property.propertyData.address}
                  </Text>
                )}
                {property.propertyData?.price && (
                  <Text className="text-xs text-gray-700 mt-1">
                    {property.propertyData.price.toLocaleString()}{' '}
                    {property.propertyData.currency || 'SEK'}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
