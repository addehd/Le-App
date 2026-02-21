import { useEffect, useRef } from 'react';
import { useQueryClient, QueryClient } from '@tanstack/react-query';
import { supabase } from '../api/supabaseClient';
import { PropertyLink } from '../store/propertyLinkStore';
import { PropertyReaction, PropertyComment } from '../types/property';

/**
 * Low-level factory: creates a Supabase Realtime channel, runs `setup` to register
 * .on() handlers, subscribes, and cleans up on unmount or dep change.
 */
function useSupabaseChannel(
  channelName: string | null,
  setup: (channel: ReturnType<typeof supabase.channel>, queryClient: QueryClient) => void,
  deps: unknown[]
) {
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  queryClientRef.current = queryClient;

  useEffect(() => {
    if (!channelName) return;
    const channel = supabase.channel(channelName);
    setup(channel, queryClientRef.current);
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, ...deps]);
}

/**
 * Hook to subscribe to Supabase Realtime updates for properties
 * Optimistically updates React Query cache on INSERT/UPDATE/DELETE events
 */
export function usePropertyRealtimeSubscription() {
  useSupabaseChannel(
    'property_enrichment',
    (channel, queryClient) => {
      channel
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'properties' },
          (payload) => {
            const n = payload.new;
            const enrichment = (n.enrichment_status || {}) as Record<string, unknown>;
            queryClient.setQueryData<PropertyLink[]>(['properties'], (old) => {
              if (!old) return old;
              return old.map((property) => {
                if (property.id === n.id.toString()) {
                  return {
                    ...property,
                    title: n.title || property.title,
                    description: n.description || property.description,
                    image: n.image_url || property.image,
                    images: n.images || property.images,
                    latitude: n.latitude != null ? Number(n.latitude) : property.latitude,
                    longitude: n.longitude != null ? Number(n.longitude) : property.longitude,
                    propertyData: property.propertyData
                      ? {
                          ...property.propertyData,
                          price: n.price ?? property.propertyData.price,
                          address: n.address ?? property.propertyData.address,
                          city: n.municipality ?? property.propertyData.city,
                          bedrooms: n.rooms ?? property.propertyData.bedrooms,
                          area: n.area_sqm ?? property.propertyData.area,
                          monthlyFee: n.monthly_fee ?? property.propertyData.monthlyFee,
                          enrichmentStatus: (enrichment.enrichmentStatus as PropertyLink['propertyData']) ?? property.propertyData.enrichmentStatus,
                        }
                      : property.propertyData,
                    financialData: (enrichment.financialData as PropertyLink['financialData']) || property.financialData,
                  };
                }
                return property;
              });
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'properties' },
          (payload) => {
            const n = payload.new;
            const enrichment = (n.enrichment_status || {}) as Record<string, unknown>;
            queryClient.setQueryData<PropertyLink[]>(['properties'], (old) => {
              const newProperty: PropertyLink = {
                id: n.id.toString(),
                url: n.url,
                title: n.title,
                description: n.description,
                image: n.image_url,
                images: n.images,
                sharedBy: n.shared_by || 'anon',
                sharedAt: n.created_at || new Date().toISOString(),
                latitude: n.latitude != null ? Number(n.latitude) : undefined,
                longitude: n.longitude != null ? Number(n.longitude) : undefined,
                propertyData: n.address || n.price || n.rooms
                  ? {
                      price: n.price,
                      address: n.address,
                      city: n.municipality,
                      bedrooms: n.rooms,
                      area: n.area_sqm,
                      monthlyFee: n.monthly_fee,
                      enrichmentStatus: enrichment.enrichmentStatus as PropertyLink['propertyData'],
                    }
                  : undefined,
                financialData: enrichment.financialData as PropertyLink['financialData'],
              };
              if (old?.some((p) => p.id === newProperty.id)) return old;
              return [newProperty, ...(old || [])];
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'properties' },
          (payload) => {
            queryClient.setQueryData<PropertyLink[]>(['properties'], (old) => {
              if (!old) return old;
              return old.filter((property) => property.id !== payload.old.id.toString());
            });
          }
        );
    },
    []
  );
}

/**
 * Hook to subscribe to Supabase Realtime updates for reactions on a specific property
 */
export function useReactionsRealtimeSubscription(propertyId: string) {
  useSupabaseChannel(
    propertyId ? `reactions:${propertyId}` : null,
    (channel, queryClient) => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'property_reactions', filter: `property_id=eq.${propertyId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newReaction: PropertyReaction = {
              id: payload.new.id,
              propertyId: payload.new.property_id,
              userId: payload.new.user_id,
              emoji: payload.new.emoji,
              createdAt: payload.new.created_at,
            };
            queryClient.setQueryData<PropertyReaction[]>(['reactions', propertyId], (old) => {
              if (old?.some((r) => r.id === newReaction.id)) return old;
              return [...(old || []), newReaction];
            });
          } else if (payload.eventType === 'DELETE') {
            queryClient.setQueryData<PropertyReaction[]>(['reactions', propertyId], (old) => {
              if (!old) return old;
              return old.filter((r) => r.id !== payload.old.id);
            });
          }
        }
      );
    },
    [propertyId]
  );
}

/**
 * Hook to subscribe to Supabase Realtime updates for comments on a specific property
 */
export function useCommentsRealtimeSubscription(propertyId: string) {
  useSupabaseChannel(
    propertyId ? `comments:${propertyId}` : null,
    (channel, queryClient) => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'property_comments', filter: `property_id=eq.${propertyId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newComment: PropertyComment = {
              id: payload.new.id,
              propertyId: payload.new.property_id,
              parentId: payload.new.parent_id,
              userId: payload.new.user_id,
              userName: payload.new.user_name,
              content: payload.new.content,
              createdAt: payload.new.created_at,
              updatedAt: payload.new.updated_at,
            };
            queryClient.setQueryData<PropertyComment[]>(['comments', propertyId], (old) => {
              if (old?.some((c) => c.id === newComment.id)) return old;
              return [...(old || []), newComment];
            });
          } else if (payload.eventType === 'UPDATE') {
            queryClient.setQueryData<PropertyComment[]>(['comments', propertyId], (old) => {
              if (!old) return old;
              return old.map((c) =>
                c.id === payload.new.id
                  ? { ...c, content: payload.new.content, updatedAt: payload.new.updated_at }
                  : c
              );
            });
          } else if (payload.eventType === 'DELETE') {
            queryClient.setQueryData<PropertyComment[]>(['comments', propertyId], (old) => {
              if (!old) return old;
              return old.filter((c) => c.id !== payload.old.id);
            });
          }
        }
      );
    },
    [propertyId]
  );
}
