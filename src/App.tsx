
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import StoreDetails from "./pages/StoreDetails";
import AddStore from "./pages/AddStore";
import EditStore from "./pages/EditStore";
import AddMedicine from "./pages/AddMedicine";
import EditMedicine from "./pages/EditMedicine";
import SearchMedicine from "./pages/SearchMedicine";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/store/:storeId" element={<StoreDetails />} />
          <Route path="/add-store" element={<AddStore />} />
          <Route path="/edit-store/:storeId" element={<EditStore />} />
          <Route path="/add-medicine/:storeId" element={<AddMedicine />} />
          <Route path="/edit-medicine/:storeId/:medicineId" element={<EditMedicine />} />
          <Route path="/search" element={<SearchMedicine />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
