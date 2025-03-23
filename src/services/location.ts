
import { supabase } from "@/integrations/supabase/client";

// Get user location from IP address
export const getUserLocation = async (): Promise<{
  latitude: number;
  longitude: number;
  city: string;
  region: string;
} | null> => {
  try {
    // Using ipapi.co for IP-based geolocation
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.error) {
      console.error('Error fetching location:', data.reason);
      return null;
    }
    
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      region: data.region
    };
  } catch (error) {
    console.error('Error getting user location:', error);
    return null;
  }
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  return distance;
};

// Get nearby hospitals using Google Places API
export const getNearbyHospitals = async (
  latitude: number, 
  longitude: number
): Promise<Hospital[]> => {
  try {
    // Using the OpenStreetMap Overpass API for public data
    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:30000,${latitude},${longitude});
        way["amenity"="hospital"](around:30000,${latitude},${longitude});
        relation["amenity"="hospital"](around:30000,${latitude},${longitude});
      );
      out body;
      >;
      out skel qt;
    `;
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });
    
    const data = await response.json();
    
    // Process the results
    const hospitals: Hospital[] = [];
    const processedIds = new Set();
    
    data.elements.forEach((element: any) => {
      if (element.tags && element.tags.name && !processedIds.has(element.id)) {
        processedIds.add(element.id);
        
        const lat = element.lat || 0;
        const lon = element.lon || 0;
        const distance = calculateDistance(latitude, longitude, lat, lon);
        
        hospitals.push({
          id: element.id.toString(),
          name: element.tags.name,
          latitude: lat,
          longitude: lon,
          distance: distance,
          address: element.tags['addr:full'] || 
                   `${element.tags['addr:street'] || ''} ${element.tags['addr:housenumber'] || ''}`.trim() || 
                   'Address not available'
        });
      }
    });
    
    // Sort by distance
    hospitals.sort((a, b) => a.distance - b.distance);
    
    return hospitals;
  } catch (error) {
    console.error('Error fetching nearby hospitals:', error);
    return [];
  }
};

export interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number; // in kilometers
  address: string;
}

// Group hospitals by distance range
export const groupHospitalsByRange = (hospitals: Hospital[]) => {
  return {
    nearby: hospitals.filter(h => h.distance < 5),
    medium: hospitals.filter(h => h.distance >= 5 && h.distance <= 20),
    far: hospitals.filter(h => h.distance > 20)
  };
};
