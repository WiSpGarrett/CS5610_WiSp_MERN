import React, { useEffect, useMemo, useState } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { useLocation, Link } from 'react-router-dom';

// Container size for the map canvas
const containerStyle = { width: '100%', height: '70vh' };

function Map() {
  // App state with fetched photos, UI flags, selected marker, and current user.
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const location = useLocation();

  // Google Maps API key injection.
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Load the Maps JS script.
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || ''
  });

  // Recover current user and fetch all photos to render as markers.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('login');
      const user = saved ? JSON.parse(saved) : null;
      setCurrentUserId(user?.dbId || null);
    } catch {
      setCurrentUserId(null);
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch every photo, the map shows all.
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/photos`);
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

  // Transform photos into marker data, skip any with invalid coordinates.
  const markers = useMemo(() => {
    return photos
      .map((p) => {
        const lat = parseFloat(p?.location?.latitude);
        const lng = parseFloat(p?.location?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const ownerId = typeof p.userId === 'object' && p.userId?._id ? p.userId._id : p.userId;
        return { id: p._id, lat, lng, title: p.title, url: p.gcsUrl, isMine: currentUserId && ownerId ? String(ownerId) === String(currentUserId) : false };
      })
      .filter(Boolean);
  }, [photos, currentUserId]);

  // Determine initial map center, default to first pin if no lat/long in URL.
  const mapCenter = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const qLat = parseFloat(params.get('lat'));
    const qLng = parseFloat(params.get('lng'));
    if (Number.isFinite(qLat) && Number.isFinite(qLng)) {
      return { lat: qLat, lng: qLng };
    }
    if (markers.length > 0) {
      return { lat: markers[0].lat, lng: markers[0].lng };
    }
    return { lat: 39.5, lng: -98.35 };
  }, [markers, location.search]);

  // Initial zoom is tighter when linked, otherwise it is further.
  const defaultZoom = useMemo(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('lat') && params.get('lng')) return 14;
    return markers.length > 0 ? 6 : 4;
  }, [markers, location.search]);

  // Resolve the selected pin's full data for the info card.
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
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={defaultZoom}
          // Dark theme from Google Maps documentation.
          options={{
            styles: [
              { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
              {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#263c3f" }],
              },
              {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6b9a76" }],
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }],
              },
              {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }],
              },
              {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#746855" }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f2835" }],
              },
              {
                featureType: "road.highway",
                elementType: "labels.text.fill",
                stylers: [{ color: "#f3d19c" }],
              },
              {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#2f3948" }],
              },
              {
                featureType: "transit.station",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
              },
              {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }],
              },
              {
                featureType: "water",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#17263c" }],
              },
            ],
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          }}
        >
          {markers.map((m) => (
            <Marker key={m.id} position={{ lat: m.lat, lng: m.lng }} onClick={() => setSelectedId(m.id)} />
          ))}

          {selected && (
            <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelectedId(null)}>
              <div className="map-info">
                <div className="map-info-header">
                  <div className="map-info-title" title={selected.title}>{selected.title}</div>
                  {/* Deep link back to the homepage carousel at this photo */}
                  <Link to={`/?photoId=${selected.id}`} className="btn btn-primary btn-sm">View Photo</Link>
                </div>
                <div className="map-info-image-wrap">
                  <img className="map-info-image" src={selected.url} alt={selected.title} />
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </Container>
  );
}

export default Map; 