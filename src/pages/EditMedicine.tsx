
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Pill, User, Tag, Package } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import axios from "axios";
import { z } from "zod";

const API_URL = "http://localhost:8000";

// Validation schema
const medicineSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  batchNumber: z.string().min(1, "Batch number is required"),
  expiryDate: z.date()
    .refine(date => date >= new Date(), "Expiry date cannot be in the past"),
  price: z.number()
    .positive("Price must be greater than zero"),
  stock: z.number()
    .int("Stock must be a whole number")
    .nonnegative("Stock cannot be negative"),
});

type FormData = z.infer<typeof medicineSchema>;

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
  medicines: Medicine[];
}

const EditMedicine = () => {
  const { storeId, medicineId } = useParams<{ storeId: string; medicineId: string }>();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    manufacturer: "",
    batchNumber: "",
    expiryDate: new Date(),
    price: 0,
    stock: 0,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicineDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/stores/${storeId}`);
        const store = response.data as Store;
        
        const medicine = store.medicines.find(med => med.medicineId === medicineId);
        
        if (!medicine) {
          toast({
            title: "Error",
            description: "Medicine not found",
            variant: "destructive",
          });
          navigate(`/store/${storeId}`);
          return;
        }
        
        // Parse the date string from the API
        let expiryDate: Date;
        try {
          expiryDate = new Date(medicine.expiryDate);
          // If the date is invalid, try parsing with different format
          if (isNaN(expiryDate.getTime())) {
            expiryDate = parse(medicine.expiryDate, 'yyyy-MM-dd', new Date());
          }
        } catch (e) {
          // Fallback to current date + 1 year if parsing fails
          expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }
        
        setFormData({
          name: medicine.name,
          manufacturer: medicine.manufacturer,
          batchNumber: medicine.batchNumber,
          expiryDate: expiryDate,
          price: medicine.price,
          stock: medicine.stock,
        });
      } catch (error) {
        console.error("Error fetching medicine details:", error);
        toast({
          title: "Error",
          description: "Failed to load medicine details. Please try again.",
          variant: "destructive",
        });
        navigate(`/store/${storeId}`);
      } finally {
        setLoading(false);
      }
    };

    if (storeId && medicineId) {
      fetchMedicineDetails();
    }
  }, [storeId, medicineId, toast, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let parsedValue: string | number | Date = value;
    if (name === 'price') {
      parsedValue = parseFloat(value) || 0;
    } else if (name === 'stock') {
      parsedValue = parseInt(value, 10) || 0;
    }
    
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

  const handleDateSelect = (date: Date) => {
    setFormData(prev => ({
      ...prev,
      expiryDate: date
    }));
    
    // Clear the error for this field
    if (errors.expiryDate) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.expiryDate;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    try {
      medicineSchema.parse(formData);
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
      // Format the date as YYYY-MM-DD for the API
      const formattedData = {
        ...formData,
        expiryDate: format(formData.expiryDate, 'yyyy-MM-dd')
      };
      
      const response = await axios.put(`${API_URL}/stores/${storeId}/medicines/${medicineId}`, formattedData);
      
      toast({
        title: "Success",
        description: "Medicine updated successfully!",
      });
      
      navigate(`/store/${storeId}`);
    } catch (error: any) {
      console.error("Error updating medicine:", error);
      
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update medicine. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
        <h1 className="text-2xl md:text-3xl font-bold">Edit Medicine</h1>
      </div>

      <Card className="bg-white border-none shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Medicine Name
                </Label>
                <div className="relative">
                  <Pill className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="name"
                    name="name"
                    className={`pl-10 ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="Enter medicine name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer" className="text-gray-700">
                  Manufacturer
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="manufacturer"
                    name="manufacturer"
                    className={`pl-10 ${errors.manufacturer ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="Enter manufacturer name"
                    value={formData.manufacturer}
                    onChange={handleChange}
                  />
                </div>
                {errors.manufacturer && (
                  <p className="text-sm text-red-500 mt-1">{errors.manufacturer}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber" className="text-gray-700">
                  Batch Number
                </Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="batchNumber"
                    name="batchNumber"
                    className={`pl-10 ${errors.batchNumber ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="Enter batch number"
                    value={formData.batchNumber}
                    onChange={handleChange}
                  />
                </div>
                {errors.batchNumber && (
                  <p className="text-sm text-red-500 mt-1">{errors.batchNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-gray-700">
                  Expiry Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal border-gray-200 ${errors.expiryDate ? 'border-red-300' : ''}`}
                    >
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      {formData.expiryDate ? (
                        format(formData.expiryDate, "MMMM dd, yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.expiryDate}
                      onSelect={(date) => date && handleDateSelect(date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.expiryDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.expiryDate}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-700">
                    Price (USD)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      className={`pl-8 ${errors.price ? 'border-red-300' : 'border-gray-200'}`}
                      placeholder="0.00"
                      value={formData.price || ""}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-red-500 mt-1">{errors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-gray-700">
                    Stock Quantity
                  </Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      step="1"
                      className={`pl-10 ${errors.stock ? 'border-red-300' : 'border-gray-200'}`}
                      placeholder="0"
                      value={formData.stock || ""}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.stock && (
                    <p className="text-sm text-red-500 mt-1">{errors.stock}</p>
                  )}
                </div>
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

export default EditMedicine;
