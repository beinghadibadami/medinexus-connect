
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Search,
  Building2, 
  MapPin, 
  Phone, (store) => 
  Navigation,
  Package
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { z } from "zod";

const API_URL = "http://localhost:8000";

interface Medicine {
  medicineId: string;
  name: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  price: number;
  stock: number;
}

interface Store {
  storeId: string;
  name: string;
  address: string;
  contactNumber: string;
  latitude: number;
  longitude: number;
  medicines: Medicine[];
  distance: number;
}

// Validation schema
const searchSchema = z.object({
  medicine_name: z.string().min(1, "Medicine name is required"),
  latitude: z.number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z.number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  max_distance: z.number()
    .positive("Distance must be greater than zero")
});

type SearchParams = z.infer<typeof searchSchema>;

const SearchMedicine = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    medicine_name: "",
    latitude: 0,
    longitude: 0,
    max_distance: 5000 // 5km default
  });
  
  const [results, setResults] = useState<Store[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let parsedValue: string | number = value;
    if (name === 'latitude' || name === 'longitude' || name === 'max_distance') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setSearchParams(prev => ({
      ...prev,
      [name]: parsedValue
    }));
    
    // Clear the error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    try {
      searchSchema.parse(searchParams);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSearching(true);
    setHasSearched(true);
    
    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: searchParams
      });
      
      setResults(response.data);
      
      if (response.data.length === 0) {
        toast({
          title: "No results found",
          description: "We couldn't find any stores with the specified medicine.",
        });
      }
    } catch (error: any) {
      console.error("Error searching for medicine:", error);
      
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to search for medicine. Please try again.",
        variant: "destructive",
      });
      
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSearchParams(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          
          toast({
            title: "Location detected",
            description: "Your current location has been set.",
          });
        },
        (error) => {
          toast({
            title: "Error",
            description: "Could not get your current location. Please enter coordinates manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser. Please enter coordinates manually.",
        variant: "destructive",
      });
    }
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-12 max-w-7xl"
    >
      <div className="flex items-center mb-8">
        <Button variant="ghost" className="mr-4 p-2" onClick={() => navigate("/")}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Find Medicine Near You</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="medicine_name" className="text-gray-700">
                    Medicine Name
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      id="medicine_name"
                      name="medicine_name"
                      className={`pl-10 ${errors.medicine_name ? 'border-red-300' : 'border-gray-200'}`}
                      placeholder="Enter medicine name"
                      value={searchParams.medicine_name}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.medicine_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.medicine_name}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700">Your Location</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-sm text-gray-500 hover:text-black"
                      onClick={useCurrentLocation}
                    >
                      <Navigation size={14} className="mr-1" />
                      Use current location
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className="text-gray-700 text-sm">
                        Latitude
                      </Label>
                      <Input
                        id="latitude"
                        name="latitude"
                        type="number"
                        step="any"
                        className={`${errors.latitude ? 'border-red-300' : 'border-gray-200'}`}
                        placeholder="-90 to 90"
                        value={searchParams.latitude}
                        onChange={handleChange}
                      />
                      {errors.latitude && (
                        <p className="text-xs text-red-500 mt-1">{errors.latitude}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude" className="text-gray-700 text-sm">
                        Longitude
                      </Label>
                      <Input
                        id="longitude"
                        name="longitude"
                        type="number"
                        step="any"
                        className={`${errors.longitude ? 'border-red-300' : 'border-gray-200'}`}
                        placeholder="-180 to 180"
                        value={searchParams.longitude}
                        onChange={handleChange}
                      />
                      {errors.longitude && (
                        <p className="text-xs text-red-500 mt-1">{errors.longitude}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_distance" className="text-gray-700">
                    Maximum Distance (meters)
                  </Label>
                  <Input
                    id="max_distance"
                    name="max_distance"
                    type="number"
                    min="100"
                    step="100"
                    className={`${errors.max_distance ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="Distance in meters"
                    value={searchParams.max_distance}
                    onChange={handleChange}
                  />
                  {errors.max_distance && (
                    <p className="text-sm text-red-500 mt-1">{errors.max_distance}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-black hover:bg-gray-800 text-white"
                  disabled={searching}
                >
                  {searching ? "Searching..." : "Search Nearby Stores"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {hasSearched && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                Search Results {results.length > 0 && `(${results.length})`}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Showing stores that have "{searchParams.medicine_name}" in stock
              </p>
            </div>
          )}
          
          {searching ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : hasSearched && results.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 gap-4"
            >
              {results.map((store) => (
                <motion.div
                  key={store.storeId}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="flex-1">
                          <div className="flex items-start mb-1">
                            <Building2 className="text-gray-400 mr-3 mt-1" size={18} />
                            <div>
                              <h3 className="font-semibold text-xl text-gray-900 mb-1">{store.name}</h3>
                              <div className="flex items-center text-gray-500 text-sm mb-1">
                                <MapPin size={14} className="mr-1" />
                                <span>{store.address}</span>
                              </div>
                              <div className="flex items-center text-gray-500 text-sm">
                                <Phone size={14} className="mr-1" />
                                <span>{store.contactNumber}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-700 mb-2">Available Medicines:</h4>
                            <div className="flex flex-wrap gap-2">
                              {store.medicines.map(medicine => (
                                <Badge 
                                  key={medicine.medicineId}
                                  variant="outline" 
                                  className="text-sm py-1 border-gray-200 bg-gray-50"
                                >
                                  <Package size={12} className="mr-1 text-gray-500" />
                                  {medicine.name} ({medicine.stock} in stock)
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end mt-4 md:mt-0 md:ml-4">
                          <Badge className="mb-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border-none">
                            {formatDistance(store.distance)} away
                          </Badge>
                          <Button
                            variant="outline" 
                            className="mt-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-black hover:border-gray-300 transition-all"
                            onClick={() => navigate(`/store/${store.storeId}`)}
                          >
                            View Store
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : hasSearched ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
              <Search className="text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No stores found</h3>
              <p className="text-gray-500 text-center max-w-md mb-4">
                We couldn't find any stores with "{searchParams.medicine_name}" in stock within {formatDistance(searchParams.max_distance)} of your location.
              </p>
              <Button
                variant="outline"
                className="border-gray-200"
                onClick={() => {
                  setSearchParams(prev => ({
                    ...prev,
                    max_distance: prev.max_distance + 5000
                  }));
                }}
              >
                Try searching in a larger area
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
              <Search className="text-gray-300 mb-4" size={64} />
              <h3 className="text-lg font-medium text-gray-700 mb-1">Search for medicines</h3>
              <p className="text-gray-500 text-center max-w-md">
                Enter a medicine name and your location to find stores nearby that have it in stock.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchMedicine;
