
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserLocation, getNearbyHospitals, groupHospitalsByRange, Hospital } from '@/services/location';
import { Loader2, MapPin, Navigation, Building2 } from 'lucide-react';

export function HospitalFinder() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{latitude: number; longitude: number; city: string; region: string} | null>(null);
  const [hospitals, setHospitals] = useState<{nearby: Hospital[], medium: Hospital[], far: Hospital[]} | null>(null);
  const [expandedSection, setExpandedSection] = useState<'nearby' | 'medium' | 'far' | null>(null);
  
  const fetchHospitals = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userLocation = await getUserLocation();
      if (!userLocation) {
        throw new Error('Could not determine your location');
      }
      
      setLocation(userLocation);
      
      const hospitalData = await getNearbyHospitals(userLocation.latitude, userLocation.longitude);
      setHospitals(groupHospitalsByRange(hospitalData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Don't auto-fetch to avoid unnecessary API calls
  }, []);
  
  const openDirections = (hospital: Hospital) => {
    if (!location) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${hospital.latitude},${hospital.longitude}&travelmode=driving`,
      '_blank'
    );
  };
  
  const toggleSection = (section: 'nearby' | 'medium' | 'far') => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  const renderHospitalList = (list: Hospital[], section: 'nearby' | 'medium' | 'far') => {
    const isExpanded = expandedSection === section;
    const displayCount = isExpanded ? 10 : 3;
    const hasMore = list.length > displayCount;
    
    return (
      <>
        <div className="space-y-3">
          {list.slice(0, displayCount).map((hospital) => (
            <Card key={hospital.id} className="bg-card hover:bg-accent/50 transition-colors">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-primary" />
                  {hospital.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 pb-2 text-sm text-muted-foreground">
                <p className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {hospital.address}</p>
                <p>{hospital.distance.toFixed(1)} km away</p>
              </CardContent>
              <CardFooter className="p-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center gap-1"
                  onClick={() => openDirections(hospital)}
                >
                  <Navigation className="h-3 w-3" />
                  <span>Directions</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {hasMore && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 w-full text-muted-foreground"
            onClick={() => toggleSection(section)}
          >
            {isExpanded ? 'Show less' : `Show ${list.length - displayCount} more`}
          </Button>
        )}
      </>
    );
  };
  
  const renderHospitalSection = (title: string, list: Hospital[] = [], section: 'nearby' | 'medium' | 'far') => {
    if (!list.length) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          No hospitals found in this range
        </div>
      );
    }
    
    return renderHospitalList(list, section);
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Nearby Hospitals
          </CardTitle>
          <CardDescription>
            Find hospitals near your location
            {location && (
              <div className="mt-1">
                Current location: {location.city}, {location.region}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {!hospitals && !isLoading ? (
            <Button onClick={fetchHospitals} className="w-full">
              Find Nearby Hospitals
            </Button>
          ) : isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : hospitals && (
            <Tabs defaultValue="nearby">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="nearby">
                  &lt;5km ({hospitals.nearby.length})
                </TabsTrigger>
                <TabsTrigger value="medium">
                  5-20km ({hospitals.medium.length})
                </TabsTrigger>
                <TabsTrigger value="far">
                  &gt;20km ({hospitals.far.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="nearby" className="mt-0">
                {renderHospitalSection('Hospitals within 5km', hospitals.nearby, 'nearby')}
              </TabsContent>
              
              <TabsContent value="medium" className="mt-0">
                {renderHospitalSection('Hospitals between 5-20km', hospitals.medium, 'medium')}
              </TabsContent>
              
              <TabsContent value="far" className="mt-0">
                {renderHospitalSection('Hospitals beyond 20km', hospitals.far, 'far')}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
