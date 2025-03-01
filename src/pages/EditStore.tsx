
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, MapPin, Phone, User } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { z } from "zod";

const API_URL = "http://localhost:8000";

// Validation schema
const storeSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  address: z.string().min(1, "Address is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  latitude: z.number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z.number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  userId: z.string().min(1, "User ID is required"),
});

type FormData = z.infer<typeof storeSchema>;

const EditStore = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    contactNumber: "",
    latitude: 0,
    longitude: 0,
    userId: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/stores/${storeId}`);
        const storeData = response.data;
        
        setFormData({
          name: storeData.name,
          address: storeData.address,
          contactNumber: storeData.contactNumber,
          latitude: storeData.latitude,
          longitude: storeData.longitude,
          userId: storeData.userId,
        });
      } catch (error) {
        console.error("Error fetching store details:", error);
        toast({
          title: "Error",
          description: "Failed to load store details. Please try again.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStoreDetails();
    }
  }, [storeId, toast, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === 'latitude' || name === 'longitude' 
      ? parseFloat(value) || 0 
      : value;
    
    setFormData(prev => ({
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
      storeSchema.parse(formData);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await axios.put(`${API_URL}/stores/${storeId}`, formData);
      
      toast({
        title: "Success",
        description: "Store updated successfully!",
      });
      
      navigate(`/store/${storeId}`);
    } catch (error: any) {
      console.error("Error updating store:", error);
      
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update store. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="flex items-center mb-8">
          <Button variant="ghost" className="mr-4 p-2">
            <ArrowLeft size={20} />
          </Button>
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <Card className="bg-white border-none shadow-sm animate-pulse">
          <CardContent className="p-6">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="mb-6">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="bg-gray-50 px-6 py-4">
            <div className="ml-auto flex gap-3">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-12 max-w-3xl"
    >
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          className="mr-4 p-2" 
          onClick={() => navigate(`/store/${storeId}`)}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Edit Store</h1>
      </div>

      <Card className="bg-white border-none shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Store Name
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="name"
                    name="name"
                    className={`pl-10 ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="Enter store name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-700">
                  Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="address"
                    name="address"
                    className={`pl-10 ${errors.address ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="Enter store address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber" className="text-gray-700">
                  Contact Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    className={`pl-10 ${errors.contactNumber ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="Enter contact number"
                    value={formData.contactNumber}
                    onChange={handleChange}
                  />
                </div>
                {errors.contactNumber && (
                  <p className="text-sm text-red-500 mt-1">{errors.contactNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-gray-700">
                    Latitude
                  </Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    className={`${errors.latitude ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="Latitude (-90 to 90)"
                    value={formData.latitude}
                    onChange={handleChange}
                  />
                  {errors.latitude && (
                    <p className="text-sm text-red-500 mt-1">{errors.latitude}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-gray-700">
                    Longitude
                  </Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    className={`${errors.longitude ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="Longitude (-180 to 180)"
                    value={formData.longitude}
                    onChange={handleChange}
                  />
                  {errors.longitude && (
                    <p className="text-sm text-red-500 mt-1">{errors.longitude}</p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-200"
                onClick={useCurrentLocation}
              >
                Use Current Location
              </Button>

              <div className="space-y-2">
                <Label htmlFor="userId" className="text-gray-700">
                  User ID
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="userId"
                    name="userId"
                    className={`pl-10 ${errors.userId ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="Enter user ID"
                    value={formData.userId}
                    onChange={handleChange}
                  />
                </div>
                {errors.userId && (
                  <p className="text-sm text-red-500 mt-1">{errors.userId}</p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-gray-200"
              onClick={() => navigate(`/store/${storeId}`)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-black hover:bg-gray-800 text-white"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default EditStore;
