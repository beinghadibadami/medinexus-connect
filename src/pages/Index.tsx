
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Plus, 
  Search, 
  Package,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

const API_URL = "http://localhost:8000";

interface Store {
  storeId: string;
  name: string;
  address: string;
  contactNumber: string;
  latitude: number;
  longitude: number;
  medicines: Medicine[];
  distance?: number;
}

interface Medicine {
  medicineId: string;
  name: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  price: number;
  stock: number;
}

const Index = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/stores`);
        setStores(response.data);
      } catch (error) {
        console.error("Error fetching stores:", error);
        toast({
          title: "Error",
          description: "Failed to load stores. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [toast]);

  const filteredStores = searchQuery.trim() === "" 
    ? stores 
    : stores.filter(store => 
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-12 max-w-7xl"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <p className="text-sm font-medium mb-2 text-gray-500 tracking-wider uppercase">Medical Inventory System</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">MediNexus Connect</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Streamline your medical inventory management with our intuitive platform
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="w-full md:w-1/2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input 
              className="pl-10 h-12 bg-white border-gray-200 shadow-sm"
              placeholder="Search stores by name or address..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            className="w-full md:w-auto h-12 bg-black hover:bg-gray-800 text-white px-6"
            onClick={() => navigate("/add-store")}
          >
            <Plus size={18} className="mr-2" />
            Add New Store
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Card key={n} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6 h-48 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-full mt-6"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredStores.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8"
          >
            {filteredStores.map((store) => (
              <motion.div
                key={store.storeId}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start mb-4">
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
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Package size={14} className="mr-1" />
                      <span>{store.medicines?.length || 0} products in inventory</span>
                    </div>

                    <Button
                      variant="outline" 
                      className="w-full mt-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-black hover:border-gray-300 transition-all"
                      onClick={() => navigate(`/store/${store.storeId}`)}
                    >
                      View Details
                      <ArrowRight size={14} className="ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No stores found matching your search criteria.</p>
            <Button
              variant="link"
              className="mt-2 text-black"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Index;
