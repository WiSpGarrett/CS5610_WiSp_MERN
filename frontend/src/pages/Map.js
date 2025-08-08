import React, { useEffect, useMemo, useState } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '70vh' };

function Map() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || ''
  });

  const getUserId = () => {
    const saved = localStorage.getItem('login');
    const user = saved ? JSON.parse(saved) : null;
    return user?.dbId || null;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = getUserId();
        if (!userId) {
          setError('You must be logged in to view the map.');
          setPhotos([]);
          return;
        }
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/photos`, {
          params: { userId }
        });
        const list = Array.isArray(res.data?.photos) ? res.data.photos : [];
        setPhotos(list);
      } catch (e) {
        setError('Failed to load photos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const markers = useMemo(() => {
    return photos
      .map((p) => {
        const lat = parseFloat(p?.location?.latitude);
        const lng = parseFloat(p?.location?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return { id: p._id, lat, lng, title: p.title, url: p.gcsUrl };
      })
      .filter(Boolean);
  }, [photos]);

  const mapCenter = useMemo(() => {
    if (markers.length > 0) {
      return { lat: markers[0].lat, lng: markers[0].lng };
    }
    // Continental US fallback
    return { lat: 39.5, lng: -98.35 };
  }, [markers]);

  const defaultZoom = markers.length > 0 ? 6 : 4;

  const selected = useMemo(() => markers.find((m) => m.id === selectedId) || null, [markers, selectedId]);

  return (
    <Container className="mt-4">
      <h1>Map View</h1>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {!apiKey && (
        <Alert variant="warning">
          REACT_APP_GOOGLE_MAPS_API_KEY is not set. Add it to your frontend environment to enable the map.
        </Alert>
      )}

      {loading || !isLoaded ? (
        <div className="d-flex align-items-center gap-2 mt-3">
          <Spinner animation="border" size="sm" />
          <span>Loading map…</span>
        </div>
      ) : (
        <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={defaultZoom}>
          {markers.map((m) => (
            <Marker key={m.id} position={{ lat: m.lat, lng: m.lng }} onClick={() => setSelectedId(m.id)} />
          ))}

          {selected && (
            <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelectedId(null)}>
              <div style={{ maxWidth: 220 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }} title={selected.title}>
                  {selected.title}
                </div>
                <img
                  src={selected.url}
                  alt={selected.title}
                  style={{ width: '100%', height: 'auto', borderRadius: 4 }}
                />
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </Container>
  );
}

export default Map; 