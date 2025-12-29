import { useState, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import { useAuthStore } from '../../lib/store/simpleAuthStore';
import { useLinkStore } from '../../lib/store/simpleLinkStore';
import 'maplibre-gl/dist/maplibre-gl.css';

// Valle Sagrado, Peru coordinates (Cusco region)
const INITIAL_VIEW_STATE = {
  longitude: -71.9589,
  latitude: -13.3048,
  zoom: 12
};

export default function MapScreen() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'property' | 'links'>('property');

  const { user, initialize } = useAuthStore();
  const { sharedLinks, addLink, removeLink, isLoading } = useLinkStore();

  useEffect(() => {
    initialize();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !user) return;

    try {
      // Both tabs now use the same addLink function with real OG fetching
      await addLink(url, user.email!, Math.random() * 180 - 90, Math.random() * 360 - 180);
      setUrl('');
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'relative' }}>
      {/* MapLibre Map */}
      <Map
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      >
        {/* Markers for shared links */}
        {sharedLinks.map((link) => (
          <Marker
            key={link.id}
            longitude={link.longitude}
            latitude={link.latitude}
            anchor="bottom"
          >
            <div
              style={{
                backgroundColor: '#10b981',
                borderRadius: '50% 50% 50% 0',
                width: '30px',
                height: '30px',
                transform: 'rotate(-45deg)',
                border: '3px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                cursor: 'pointer',
              }}
              title={link.title || link.url}
            />
          </Marker>
        ))}
      </Map>

      {/* Add Property Button */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
        }}
      >
        {isPanelOpen ? '✕ Close' : '+ Add Property'}
      </button>

      {/* Bottom Panel */}
      {isPanelOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)',
            padding: '24px',
            maxHeight: '70vh',
            overflowY: 'auto',
            zIndex: 999,
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <button
              onClick={() => setActiveTab('property')}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: activeTab === 'property' ? '#3b82f6' : 'transparent',
                color: activeTab === 'property' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Add Property
            </button>
            <button
              onClick={() => setActiveTab('links')}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: activeTab === 'links' ? '#3b82f6' : 'transparent',
                color: activeTab === 'links' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Share Links
            </button>
          </div>

          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
            Add Property Link
          </h2>

          {/* URL Input Form */}
          <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://property-site.com"
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !url.trim() || !user}
                style={{
                  backgroundColor: isLoading || !url.trim() || !user ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isLoading || !url.trim() || !user ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? 'Loading...' : 'Add'}
              </button>
            </div>
          </form>

          {/* Authentication Warning */}
          {!user && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px'
            }}>
              <p style={{ margin: 0, color: '#dc2626', fontSize: '14px' }}>
                Please sign in to add links. <a href="/auth" style={{ textDecoration: 'underline' }}>Go to Auth</a>
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  border: '4px solid #e5e7eb',
                  borderTop: '4px solid #3b82f6',
                  borderRadius: '50%',
                  margin: '0 auto',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <p style={{ marginTop: '16px', color: '#6b7280' }}>
                Fetching link data...
              </p>
              <style>
                {`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}
              </style>
            </div>
          )}

          {/* Property Links Display */}
          {!isLoading && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                Property Links ({sharedLinks.length})
              </h3>
              
              {sharedLinks.length === 0 ? (
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '40px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, color: '#6b7280' }}>No property links added yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sharedLinks.map((link) => (
                    <div key={link.id} style={{
                      backgroundColor: '#f9fafb',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                        {link.image && (
                          <img
                            src={link.image}
                            alt={link.title || 'Property image'}
                            style={{
                              width: '120px',
                              height: '80px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              flexShrink: 0
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                              {link.title || 'Property Link'}
                            </h4>
                            <button
                              onClick={() => removeLink(link.id)}
                              style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                marginLeft: '12px',
                                flexShrink: 0
                              }}
                            >
                              Remove
                            </button>
                          </div>
                          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>
                            {link.description}
                          </p>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '12px',
                              color: '#3b82f6',
                              textDecoration: 'none',
                              wordBreak: 'break-all'
                            }}
                          >
                            {link.url}
                          </a>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#9ca3af' }}>
                        <span>Shared by: {link.sharedBy}</span>
                        <span>{new Date(link.sharedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
