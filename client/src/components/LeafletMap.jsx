import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LeafletMap = ({ 
  center = [28.6139, 77.2090], // Default to Delhi
  zoom = 13,
  issues = [],
  onLocationSelect,
  selectedLocation,
  height = '400px',
  showIssueMarkers = true,
  clickable = false,
  className = ''
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance
    mapInstanceRef.current = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapInstanceRef.current);

    setIsMapReady(true);

    // Add click handler for location selection
    if (clickable && onLocationSelect) {
      mapInstanceRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        onLocationSelect({ lat, lng });
      });
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Handle selected location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;

    // Clear existing selected location marker
    markersRef.current.forEach(marker => {
      if (marker.options.isSelected) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });

    // Add new selected location marker
    const selectedIcon = L.divIcon({
      html: `
        <div style="
          background-color: #ef4444;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      className: 'custom-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
      icon: selectedIcon,
      isSelected: true,
    }).addTo(mapInstanceRef.current);

    markersRef.current.push(marker);

    // Center map on selected location
    mapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lng], Math.max(zoom, 15));
  }, [selectedLocation, zoom]);

  // Handle issue markers
  useEffect(() => {
    if (!mapInstanceRef.current || !showIssueMarkers) return;

    // Clear existing issue markers
    markersRef.current.forEach(marker => {
      if (!marker.options.isSelected) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    markersRef.current = markersRef.current.filter(marker => marker.options.isSelected);

    // Add issue markers
    issues.forEach(issue => {
      if (!issue.latitude || !issue.longitude) return;

      const statusColors = {
        'REPORTED': '#fbbf24',
        'UNDER_REVIEW': '#3b82f6',
        'IN_PROGRESS': '#f97316',
        'RESOLVED': '#10b981',
        'CLOSED': '#6b7280',
      };

      const color = statusColors[issue.status] || '#6b7280';

      const issueIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${color};
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
        `,
        className: 'issue-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([issue.latitude, issue.longitude], {
        icon: issueIcon,
        title: issue.title,
      }).addTo(mapInstanceRef.current);

      // Add popup with issue details
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${issue.title}</h3>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${issue.description.substring(0, 100)}...</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <span style="
              background-color: ${color};
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: bold;
            ">${issue.status.replace('_', ' ')}</span>
            <a href="/issue/${issue.id}" style="
              color: #3b82f6;
              text-decoration: none;
              font-size: 12px;
              font-weight: bold;
            ">View Details</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Fit map to show all markers if there are issues
    if (issues.length > 0) {
      const group = new L.featureGroup(markersRef.current.filter(m => !m.options.isSelected));
      if (group.getLayers().length > 0) {
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [issues, showIssueMarkers]);

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
          
          if (onLocationSelect) {
            onLocationSelect(location);
          }
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please select a location on the map.');
      }
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-300 z-0"
      />
      
      {/* Location Controls */}
      {clickable && (
        <div className="absolute top-3 right-3 z-10 space-y-2">
          <button
            onClick={getCurrentLocation}
            className="bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-2 shadow-sm transition-colors"
            title="Get Current Location"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      )}

      {/* Map Legend */}
      {showIssueMarkers && issues.length > 0 && (
        <div className="absolute bottom-3 left-3 z-10 bg-white border border-gray-300 rounded-lg p-3 shadow-sm">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Issue Status</h4>
          <div className="space-y-1">
            {[
              { status: 'REPORTED', color: '#fbbf24', label: 'Reported' },
              { status: 'UNDER_REVIEW', color: '#3b82f6', label: 'Under Review' },
              { status: 'IN_PROGRESS', color: '#f97316', label: 'In Progress' },
              { status: 'RESOLVED', color: '#10b981', label: 'Resolved' },
              { status: 'CLOSED', color: '#6b7280', label: 'Closed' },
            ].map(({ status, color, label }) => (
              <div key={status} className="flex items-center text-xs">
                <div 
                  className="w-3 h-3 rounded-full border border-white mr-2"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Click instruction */}
      {clickable && (
        <div className="absolute top-3 left-3 z-10 bg-blue-50 border border-blue-200 rounded-lg p-2">
          <p className="text-xs text-blue-700">Click on the map to select a location</p>
        </div>
      )}
    </div>
  );
};

export default LeafletMap;