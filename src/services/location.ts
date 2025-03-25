
import { supabase } from "@/integrations/supabase/client";

// Get user location from IP address
export const getUserLocation = async (): Promise<{
  latitude: number;
  longitude: number;
  city: string;
  region: string;
} | null> => {
  try {
    // Using ipapi.co for IP-based geolocation with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
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
    
    // Fallback to a default location (New York City as example)
    // In a production app, you would want to ask for permission instead
    return {
      latitude: 40.7128,
      longitude: -74.0060,
      city: "New York",
      region: "NY"
    };
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

// Get nearby hospitals using OpenStreetMap Overpass API
export const getNearbyHospitals = async (
  latitude: number, 
  longitude: number
): Promise<Hospital[]> => {
  try {
    // Reduce search radius to improve performance
    const searchRadius = 15000; // 15km radius instead of 20km
    
    // Use a more focused query to improve performance
    const query = `
      [out:json][timeout:8];
      (
        node["amenity"="hospital"](around:${searchRadius},${latitude},${longitude});
        way["amenity"="hospital"](around:${searchRadius},${latitude},${longitude});
        relation["amenity"="hospital"](around:${searchRadius},${latitude},${longitude});
      );
      out body;
      >;
      out skel qt;
    `;
    
    // Set up a controller for the timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Error fetching hospitals: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the results
    const hospitals: Hospital[] = [];
    const processedIds = new Set();
    
    data.elements.forEach((element: any) => {
      if (element.tags && element.tags.name && !processedIds.has(element.id)) {
        processedIds.add(element.id);
        
        const lat = element.lat || 0;
        const lon = element.lon || 0;
        
        // Skip elements without valid coordinates
        if (lat === 0 && lon === 0) return;
        
        const distance = calculateDistance(latitude, longitude, lat, lon);
        
        // Extract additional metadata if available
        const phoneNumber = element.tags.phone || 
                            element.tags['contact:phone'] || 
                            null;
                            
        const openingHours = element.tags.opening_hours || 
                             null;
        
        // Create address from available fields
        let address = element.tags['addr:full'];
        if (!address) {
          const street = element.tags['addr:street'];
          const housenumber = element.tags['addr:housenumber'];
          const city = element.tags['addr:city'];
          
          if (street || housenumber || city) {
            address = [
              housenumber, 
              street, 
              city
            ].filter(Boolean).join(' ');
          } else {
            address = null;
          }
        }
        
        hospitals.push({
          id: element.id.toString(),
          name: element.tags.name,
          latitude: lat,
          longitude: lon,
          distance: distance,
          address: address,
          phoneNumber: phoneNumber,
          openingHours: openingHours,
          website: element.tags.website || null,
          emergencyService: element.tags.emergency === 'yes'
        });
      }
    });
    
    // Sort by distance
    hospitals.sort((a, b) => a.distance - b.distance);
    
    return hospitals;
  } catch (error) {
    console.error('Error fetching nearby hospitals:', error);
    // Return empty array instead of throwing, so the UI can handle the empty state
    return [];
  }
};

export interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number; // in kilometers
  address: string | null;
  phoneNumber?: string | null;
  openingHours?: string | null;
  website?: string | null;
  emergencyService?: boolean;
}

// Group hospitals by distance range
export const groupHospitalsByRange = (hospitals: Hospital[]) => {
  return {
    nearby: hospitals.filter(h => h.distance < 5),
    medium: hospitals.filter(h => h.distance >= 5 && h.distance <= 20),
    far: hospitals.filter(h => h.distance > 20)
  };
};
