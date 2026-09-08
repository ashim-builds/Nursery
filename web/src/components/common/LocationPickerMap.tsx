import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerMapProps {
  latitude?: number;
  longitude?: number;
  onChange: (coords: { latitude: number; longitude: number }) => void;
  onAddressFound?: (address: { street: string; city: string; formatted: string }) => void;
  label?: string;
  readOnly?: boolean;
}

const POKHARA_LANDMARKS = [
  { name: 'Arghau Chowk', city: 'Pokhara', lat: 28.2365, lng: 84.0036 },
  { name: 'Lakeside Baidam Area', city: 'Pokhara', lat: 28.2096, lng: 83.9595 },
  { name: 'Mahendrapul', city: 'Pokhara', lat: 28.2185, lng: 83.9884 },
  { name: 'Bagar', city: 'Pokhara', lat: 28.237, lng: 83.986 },
];

function getClosestLandmark(lat: number, lng: number) {
  let closest = POKHARA_LANDMARKS[POKHARA_LANDMARKS.length - 1];
  let minDistance = Infinity;

  for (const lm of POKHARA_LANDMARKS) {
    const dLat = lat - lm.lat;
    const dLng = lng - lm.lng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < minDistance) {
      minDistance = dist;
      closest = lm;
    }
  }

  return closest;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude = 28.2365,
  longitude = 84.0036,
  onChange,
  onAddressFound,
  label = 'Pin Delivery Location on Map * (Required)',
  readOnly = false,
}) => {
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: latitude || 28.2365,
    lng: longitude || 84.0036,
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);

  // Reverse geocode via BigDataCloud & OpenStreetMap Nominatim with local landmark fallback
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!onAddressFound) return;
    setIsGeocoding(true);

    let resolvedStreet = '';
    let resolvedCity = 'Pokhara';
    let resolvedFormatted = '';

    try {
      // 1. First Tier: BigDataCloud Reverse Geocode (Fast & zero CORS issue)
      const bdcRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      if (bdcRes.ok) {
        const bdcData = await bdcRes.json();
        if (bdcData.locality || bdcData.city) {
          resolvedCity =
            bdcData.city ||
            (bdcData.locality && bdcData.locality.includes('Lalitpur') ? 'Lalitpur' : 'Pokhara');
          resolvedStreet = bdcData.locality || bdcData.principalSubdivision || '';
          resolvedFormatted = `${resolvedStreet}, ${resolvedCity}`;
        }
      }
    } catch {
      // Continue to next tier
    }

    // 2. Second Tier: OpenStreetMap Nominatim
    if (!resolvedStreet) {
      try {
        const osmRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        if (osmRes.ok) {
          const osmData = await osmRes.json();
          const addr = osmData.address || {};
          resolvedStreet =
            addr.road ||
            addr.suburb ||
            addr.neighbourhood ||
            addr.quarter ||
            addr.residential ||
            addr.hamlet ||
            osmData.display_name?.split(',')[0] ||
            '';

          resolvedCity =
            addr.city ||
            addr.town ||
            addr.municipality ||
            addr.county ||
            addr.state_district ||
            resolvedCity;

          resolvedFormatted = osmData.display_name || `${resolvedStreet}, ${resolvedCity}`;
        }
      } catch {
        // Fallback to local landmark
      }
    }

    // 3. Avoid duplicating the city as the street address.
    if (resolvedStreet.trim().toLowerCase() === resolvedCity.trim().toLowerCase()) {
      resolvedStreet = '';
    }

    // 4. Guaranteed Pokhara landmark matcher
    if (!resolvedStreet) {
      const fallbackLandmark = getClosestLandmark(lat, lng);
      resolvedStreet = fallbackLandmark.name;
      resolvedCity = fallbackLandmark.city;
      resolvedFormatted = `${resolvedStreet}, ${resolvedCity}`;
    }

    onAddressFound({
      street: resolvedStreet,
      city: resolvedCity,
      formatted: resolvedFormatted || `${resolvedStreet}, ${resolvedCity}`,
    });

    setIsGeocoding(false);
  };

  useEffect(() => {
    if (latitude && longitude) {
      setCurrentCoords({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const map = L.map(mapElementRef.current, {
      center: [currentCoords.lat, currentCoords.lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: !readOnly,
      touchZoom: !readOnly,
      doubleClickZoom: !readOnly,
      boxZoom: !readOnly,
      keyboard: !readOnly,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.circleMarker([currentCoords.lat, currentCoords.lng], {
      radius: 10,
      color: '#be123c',
      weight: 3,
      fillColor: '#f43f5e',
      fillOpacity: 0.9,
    }).addTo(map);

    if (!readOnly) {
      map.on('click', (event: L.LeafletMouseEvent) => {
        const newCoords = {
          lat: Number(event.latlng.lat.toFixed(6)),
          lng: Number(event.latlng.lng.toFixed(6)),
        };
        setCurrentCoords(newCoords);
        marker.setLatLng([newCoords.lat, newCoords.lng]);
        onChange({ latitude: newCoords.lat, longitude: newCoords.lng });
        reverseGeocode(newCoords.lat, newCoords.lng);
      });
    }

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [readOnly]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    const nextLatLng: L.LatLngExpression = [currentCoords.lat, currentCoords.lng];
    marker.setLatLng(nextLatLng);
    map.setView(nextLatLng, map.getZoom(), { animate: true });
  }, [currentCoords.lat, currentCoords.lng]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('GPS is not supported by this browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        };
        setCurrentCoords(newCoords);
        onChange({ latitude: newCoords.lat, longitude: newCoords.lng });
        mapRef.current?.setView([newCoords.lat, newCoords.lng], 17, { animate: true });
        markerRef.current?.setLatLng([newCoords.lat, newCoords.lng]);
        reverseGeocode(newCoords.lat, newCoords.lng);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied. Please allow GPS access or select the map manually.'
            : 'Unable to find your location. Please select the map manually.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <MapPin size={14} className="text-emerald-700" />
          <span>{label}</span>
        </label>
        {!readOnly && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800 bg-forest-100 hover:bg-forest-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            {isLocating ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
            <span>{isLocating ? 'Finding location...' : 'Use my location'}</span>
          </button>
        )}
      </div>

      {locationError && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
          {locationError}
        </p>
      )}

      {isGeocoding && (
        <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse">
          <Loader2 size={12} className="animate-spin" />
          <span>Auto-filling address from pinned map location...</span>
        </p>
      )}

      {/* Interactive Map Box */}
      <div
        ref={mapElementRef}
        className="relative z-0 w-full h-56 sm:h-64 rounded-2xl overflow-hidden border-2 border-emerald-700/30 bg-slate-100 shadow-inner"
        aria-label="Interactive delivery location map"
      />

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
        <span>Lat: {currentCoords.lat.toFixed(5)}</span>
        <span>Lng: {currentCoords.lng.toFixed(5)}</span>
      </div>
    </div>
  );
};
