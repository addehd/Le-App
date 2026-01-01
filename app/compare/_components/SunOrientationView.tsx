import React from 'react';
import { View, Text } from 'react-native';
import { SunOrientation } from '../../../lib/types/property';

interface SunOrientationViewProps {
  orientation: SunOrientation;
}

export function SunOrientationView({ orientation }: SunOrientationViewProps) {
  const getRotation = (direction: string) => {
    const rotations: { [key: string]: number } = {
      north: 0,
      northeast: 45,
      east: 90,
      southeast: 135,
      south: 180,
      southwest: 225,
      west: 270,
      northwest: 315,
    };
    return rotations[direction.toLowerCase()] || 0;
  };

  const rotation = getRotation(orientation.direction);

  return (
    <View className="bg-white rounded-lg p-4 items-center shadow">
      <Text className="text-sm font-semibold text-gray-900 mb-3">Sun Orientation</Text>

      {/* Compass visualization */}
      <View className="relative w-32 h-32 bg-gray-100 rounded-full items-center justify-center">
        {/* N, E, S, W markers */}
        <View className="absolute top-2">
          <Text className="text-xs font-bold text-gray-600">N</Text>
        </View>
        <View className="absolute bottom-2">
          <Text className="text-xs font-bold text-gray-600">S</Text>
        </View>
        <View className="absolute right-2">
          <Text className="text-xs font-bold text-gray-600">E</Text>
        </View>
        <View className="absolute left-2">
          <Text className="text-xs font-bold text-gray-600">W</Text>
        </View>

        {/* Direction indicator - note: rotation in React Native uses transform */}
        <View
          className="absolute w-2 h-12 bg-yellow-500 rounded-full"
          style={{
            transform: [{ rotate: `${rotation}deg` }],
          }}
        />

        {/* Sun icon */}
        <Text className="text-2xl">☀️</Text>
      </View>

      <Text className="text-xs text-gray-600 mt-2 capitalize">{orientation.direction}</Text>

      {orientation.sunHours && (
        <Text className="text-xs text-gray-600">~{orientation.sunHours}h daily sun exposure</Text>
      )}

      {orientation.balconyDirection && orientation.balconyDirection.length > 0 && (
        <View className="mt-2">
          <Text className="text-xs text-gray-700">
            <Text className="font-semibold">Balcony: </Text>
            {orientation.balconyDirection.join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
}
