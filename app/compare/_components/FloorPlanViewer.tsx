import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, Modal } from 'react-native';
import { FloorPlan } from '../../../lib/types/property';

interface FloorPlanViewerProps {
  floorPlans: FloorPlan[];
}

export function FloorPlanViewer({ floorPlans }: FloorPlanViewerProps) {
  const [selectedPlan, setSelectedPlan] = useState<FloorPlan | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  if (!floorPlans || floorPlans.length === 0) {
    return (
      <View className="bg-gray-50 rounded-lg p-4">
        <Text className="text-sm text-gray-500 text-center">No floor plans available</Text>
      </View>
    );
  }

  const openFullscreen = (plan: FloorPlan) => {
    setSelectedPlan(plan);
    setModalVisible(true);
  };

  return (
    <View>
      <Text className="text-sm font-semibold text-gray-900 mb-2">Floor Plans</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {floorPlans.map((plan) => (
          <Pressable key={plan.id} onPress={() => openFullscreen(plan)} className="mr-3">
            <View className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <Image source={{ uri: plan.url }} className="w-32 h-32" resizeMode="cover" />
              {plan.title && (
                <Text className="text-xs text-gray-700 p-2 text-center">{plan.title}</Text>
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Fullscreen Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center">
          <Pressable
            className="absolute top-12 right-6 z-10"
            onPress={() => setModalVisible(false)}
          >
            <Text className="text-white text-3xl">×</Text>
          </Pressable>

          {selectedPlan && (
            <Image
              source={{ uri: selectedPlan.url }}
              className="w-full h-full"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
