import React, { useEffect } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePropertyLinkStore } from '../../lib/store/propertyLinkStore';
import { useComparisonStore } from '../../lib/store/comparisonStore';
import { ComparisonCard } from './_components/ComparisonCard';

export default function CompareScreen() {
  const router = useRouter();
  const { propertyLinks } = usePropertyLinkStore();
  const {
    selectedPropertyIds,
    comparisonData,
    generateComparison,
    enableAutoSave,
    disableAutoSave,
  } = useComparisonStore();

  useEffect(() => {
    enableAutoSave();
    return () => disableAutoSave();
  }, []);

  useEffect(() => {
    if (selectedPropertyIds.length > 0) {
      const selectedProperties = propertyLinks.filter((p) =>
        selectedPropertyIds.includes(p.id)
      );
      generateComparison(selectedProperties);
    }
  }, [selectedPropertyIds, propertyLinks]);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-gray-600">← Back</Text>
        </Pressable>
        <Text className="text-2xl font-bold text-gray-900">Property Comparison</Text>
        <Text className="text-sm text-gray-600 mt-1">Compare properties side by side</Text>
      </View>

      {/* Content */}
      {comparisonData.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-6xl mb-4">🏠</Text>
          <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
            No Properties Selected
          </Text>
          <Text className="text-gray-600 text-center">
            Go back and select properties to compare
          </Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
          <View className="flex-row gap-4 p-6">
            {comparisonData.map((comparison) => (
              <ComparisonCard
                key={comparison.property.id}
                comparison={comparison}
                highlightBest={true}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
