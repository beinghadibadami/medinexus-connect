
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Building2, 
  MapPin, 
  Phone, 
  Plus, 
  Calendar,
  LucideIcon,
  Pill,
  User,
  Tag,
  Package,
  Edit,
  Trash2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import axios from "axios";
import { format } from "date-fns";

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
  userId: string;
}

const StoreDetails = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/stores/${storeId}`);
        setStore(response.data);
      } catch (error) {
        console.error("Error fetching store details:", error);
        toast({
          title: "Error",
          description: "Failed to load store details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStoreDetails();
    }
  }, [storeId, toast]);

  const handleDeleteStore = async () => {
    try {
      await axios.delete(`${API_URL}/stores/${storeId}`);
      toast({
        title: "Success",
        description: "Store deleted successfully",
      });
      navigate("/");
    } catch (error) {
      console.error("Error deleting store:", error);
      toast({
        title: "Error",
        description: "Failed to delete store. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMedicine = async (medicineId: string) => {
    try {
      await axios.delete(`${API_URL}/stores/${storeId}/medicines/${medicineId}`);
      
      // Update local state to reflect deletion
      if (store) {
        setStore({
          ...store,
          medicines: store.medicines.filter(med => med.medicineId !== medicineId)
        });
      }
      
      toast({
        title: "Success",
        description: "Medicine deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting medicine:", error);
      toast({
        title: "Error",
        description: "Failed to delete medicine. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const isExpiringSoon = (dateString: string) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    
    return expiryDate <= threeMonthsFromNow && expiryDate > today;
  };

  const isExpired = (dateString: string) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    return expiryDate <= today;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex items-center mb-8">
          <Button variant="ghost" className="mr-4 p-2" onClick={() => navigate("/")}>
            <ArrowLeft size={20} />
          </Button>
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-white border-none shadow-sm animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card className="bg-white border-none shadow-sm animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                {[1, 2, 3].map((n) => (
                  <div key={n} className="mb-6">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="h-24 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl text-center">
        <p className="text-gray-500 text-lg">Store not found or has been deleted.</p>
        <Button
          variant="link"
          className="mt-2 text-black"
          onClick={() => navigate("/")}
        >
          Return to home
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-12 max-w-7xl"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-4 p-2" onClick={() => navigate("/")}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">{store.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-gray-200"
            onClick={() => navigate(`/edit-store/${storeId}`)}
          >
            <Edit size={16} className="mr-2" />
            Edit Store
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the store and all its medicines.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteStore}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Store Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Building2 className="text-gray-400 mr-3 mt-1" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Store Name</p>
                    <p className="font-medium">{store.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="text-gray-400 mr-3 mt-1" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{store.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="text-gray-400 mr-3 mt-1" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{store.contactNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <User className="text-gray-400 mr-3 mt-1" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-medium">{store.userId}</p>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <Button
                className="w-full bg-black hover:bg-gray-800 text-white"
                onClick={() => navigate(`/add-medicine/${storeId}`)}
              >
                <Plus size={16} className="mr-2" />
                Add Medicine
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Inventory ({store.medicines?.length || 0} items)</h2>
              
              {store.medicines && store.medicines.length > 0 ? (
                <div className="space-y-6">
                  {store.medicines.map((medicine) => (
                    <motion.div
                      key={medicine.medicineId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-gray-50 border-none overflow-hidden">
                        <CardContent className="p-5">
                          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h3 className="font-semibold text-lg">{medicine.name}</h3>
                                {medicine.stock < 10 && (
                                  <Badge variant="outline" className="ml-2 text-amber-500 border-amber-200 bg-amber-50">Low Stock</Badge>
                                )}
                                {isExpiringSoon(medicine.expiryDate) && (
                                  <Badge variant="outline" className="ml-2 text-amber-500 border-amber-200 bg-amber-50">Expiring Soon</Badge>
                                )}
                                {isExpired(medicine.expiryDate) && (
                                  <Badge variant="outline" className="ml-2 text-red-500 border-red-200 bg-red-50">Expired</Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                <div className="flex items-center">
                                  <User size={14} className="text-gray-400 mr-2" />
                                  <span className="text-gray-600">Manufacturer: <span className="font-medium text-gray-900">{medicine.manufacturer}</span></span>
                                </div>
                                
                                <div className="flex items-center">
                                  <Tag size={14} className="text-gray-400 mr-2" />
                                  <span className="text-gray-600">Batch: <span className="font-medium text-gray-900">{medicine.batchNumber}</span></span>
                                </div>
                                
                                <div className="flex items-center">
                                  <Calendar size={14} className="text-gray-400 mr-2" />
                                  <span className="text-gray-600">Expires: <span className="font-medium text-gray-900">{formatDate(medicine.expiryDate)}</span></span>
                                </div>
                                
                                <div className="flex items-center">
                                  <Package size={14} className="text-gray-400 mr-2" />
                                  <span className="text-gray-600">Stock: <span className="font-medium text-gray-900">{medicine.stock} units</span></span>
                                </div>
                              </div>
                              
                              <div className="mt-3 flex items-center">
                                <span className="font-bold text-lg">${medicine.price.toFixed(2)}</span>
                                <span className="text-sm text-gray-500 ml-1">per unit</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 self-end md:self-center w-full md:w-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-200 flex-1 md:flex-none"
                                onClick={() => navigate(`/edit-medicine/${storeId}/${medicine.medicineId}`)}
                              >
                                <Edit size={14} className="mr-1" />
                                Edit
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex-1 md:flex-none"
                                  >
                                    <Trash2 size={14} className="mr-1" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete medicine</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {medicine.name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteMedicine(medicine.medicineId)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <AlertCircle className="mx-auto text-gray-400 mb-4" size={40} />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No medicines found</h3>
                  <p className="text-gray-500 mb-4">This store doesn't have any medicines in inventory yet.</p>
                  <Button
                    onClick={() => navigate(`/add-medicine/${storeId}`)}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    <Plus size={16} className="mr-2" />
                    Add First Medicine
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default StoreDetails;
