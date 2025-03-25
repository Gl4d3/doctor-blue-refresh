
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserLocation, getNearbyHospitals, groupHospitalsByRange, Hospital } from '@/services/location';
import { Loader2, MapPin, Navigation, Building2, Phone, Clock, Info, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

export function HospitalFinder() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{latitude: number; longitude: number; city: string; region: string} | null>(null);
  const [hospitals, setHospitals] = useState<{nearby: Hospital[], medium: Hospital[], far: Hospital[]} | null>(null);
  const [expandedSection, setExpandedSection] = useState<'nearby' | 'medium' | 'far' | null>(null);
  const [activeTab, setActiveTab] = useState<string>("nearby");
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();
  
  const fetchHospitals = async (retryAttempt = 0) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get user location first
      const userLocation = await getUserLocation();
      if (!userLocation) {
        throw new Error('Could not determine your location');
      }
      
      setLocation(userLocation);
      
      // Reduce timeout to 10 seconds to prevent long wait times
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 10000);
      });
      
      // Attempt to get hospital data with timeout
      const hospitalData = await Promise.race([
        getNearbyHospitals(userLocation.latitude, userLocation.longitude),
        timeoutPromise
      ]);
      
      if (hospitalData.length === 0 && retryAttempt < 2) {
        // If no hospitals found and not at max retries, try again with different parameters
        setIsRetrying(true);
        throw new Error('No hospitals found. Retrying...');
      }
      
      setHospitals(groupHospitalsByRange(hospitalData));
      setIsRetrying(false);
      
      // Show success toast
      if (hospitalData.length > 0) {
        toast({
          title: "Success",
          description: `Found ${hospitalData.length} hospitals near you`,
        });
      } else {
        toast({
          title: "No results",
          description: "No hospitals found in your area",
          variant: "destructive"
        });
      }
      
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      
      if (err instanceof Error && err.message === 'No hospitals found. Retrying...' && retryAttempt < 2) {
        // Auto-retry with a reduced search radius
        setTimeout(() => {
          fetchHospitals(retryAttempt + 1);
        }, 1000);
        return;
      }
      
      setIsRetrying(false);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to load hospitals',
        variant: "destructive"
      });
    } finally {
      if (!isRetrying) {
        setIsLoading(false);
      }
    }
  };
  
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
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-primary" />
                  {hospital.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 pb-2 text-sm text-muted-foreground">
                <div className="flex flex-wrap gap-2">
                  {hospital.address && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-muted-foreground" /> 
                          <span className="truncate max-w-[200px]">{hospital.address}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">{hospital.address}</TooltipContent>
                    </Tooltip>
                  )}
                  
                  {hospital.openingHours && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 flex-shrink-0 text-muted-foreground" /> 
                          <span className="truncate max-w-[120px]">{hospital.openingHours}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">{hospital.openingHours}</TooltipContent>
                    </Tooltip>
                  )}
                  
                  {hospital.phoneNumber && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1 flex-shrink-0 text-muted-foreground" /> 
                          <span>{hospital.phoneNumber}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">{hospital.phoneNumber}</TooltipContent>
                    </Tooltip>
                  )}
                  
                  <div className="flex items-center">
                    <Info className="h-3 w-3 mr-1 flex-shrink-0 text-muted-foreground" />
                    <span>{hospital.distance.toFixed(1)} km away</span>
                  </div>
                </div>
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
            <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}
          
          {!hospitals && !isLoading ? (
            <Button onClick={() => fetchHospitals()} className="w-full">
              Find Nearby Hospitals
            </Button>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                {isRetrying ? 'Retrying search with adjusted parameters...' : 'Searching for hospitals near you...'}
              </p>
            </div>
          ) : hospitals && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
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
