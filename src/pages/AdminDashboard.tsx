import { useState, useEffect } from "react";
import OrdersAdmin from "../components/OrdersAdmin";
import Header from "../components/Header";
import { supabase } from "../lib/supabase";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Simple authentication check
  const checkAuth = () => {
    const adminAuth = localStorage.getItem("photo_admin_auth");
    if (adminAuth === "true") {
      setIsAuthenticated(true);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in a real app, use proper authentication
    if (password === "admin123") {
      localStorage.setItem("photo_admin_auth", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("photo_admin_auth");
    setIsAuthenticated(false);
  };

  useEffect(() => {
    checkAuth();
    // Check if there are any orders in localStorage that need to be synced
    const syncLocalStorageOrders = async () => {
      try {
        // Check for completed orders
        const orderDetails = localStorage.getItem("photoOrderDetails");
        if (orderDetails) {
          const order = JSON.parse(orderDetails);

          // Submit to Supabase if it exists
          await submitOrderToSupabase(order);
        }

        // Also check past orders
        const pastOrders = localStorage.getItem("pastPhotoOrders");
        if (pastOrders) {
          const orders = JSON.parse(pastOrders);
          for (const order of orders) {
            await submitOrderToSupabase(order);
          }
        }
      } catch (error) {
        console.error("Error syncing localStorage orders:", error);
      }
    };

    syncLocalStorageOrders();
  }, []);

  const submitOrderToSupabase = async (orderData: any) => {
    if (!orderData) return;

    try {
      // Generate an order ID if not present
      const orderId =
        orderData.orderId || `ORD-${Math.floor(Math.random() * 1000000)}`;

      // Check if this order already exists in the database
      const { data } = await supabase
        .from("orders")
        .select("id")
        .eq("id", orderId)
        .maybeSingle();

      // If order already exists, don't insert it again
      if (data) return;

      // Safely extract properties with fallbacks
      const photos = orderData.photos || [];
      const userInfo = orderData.userInfo || {
        name: "",
        phone: "",
        location: "",
      };
      const deliveryOption = orderData.deliveryOption || {
        isExpress: false,
        price: 0,
      };
      const totalCost = orderData.totalCost || orderData.totalPrice || 0;

      // Clean up photo objects to ensure they're serializable
      // Use real photo placeholders instead of avatars
      const cleanPhotos = photos.map((photo: any) => {
        // Check if the preview is a blob URL (starts with blob:)
        const isTemporaryUrl = photo.preview?.startsWith("blob:");
        return {
          id: photo.id || `photo-${Math.random().toString(36).substring(2, 9)}`,
          preview: isTemporaryUrl
            ? `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&q=80&seed=${photo.id || Math.random()}`
            : photo.preview || "",
        };
      });

      // Create a clean version of the order details
      const cleanOrderDetails = {
        orderId,
        photos: cleanPhotos,
        userInfo,
        deliveryOption,
        totalCost:
          totalCost ||
          photos.length * 60 +
            (deliveryOption.isExpress ? deliveryOption.price : 0),
        orderDate: orderData.orderDate || new Date().toISOString(),
      };

      const orderToInsert = {
        id: orderId,
        customer_name: userInfo.name,
        customer_phone: userInfo.phone,
        customer_location: userInfo.location,
        photo_count: photos.length,
        is_express: deliveryOption.isExpress,
        delivery_price: deliveryOption.price,
        total_cost:
          totalCost ||
          photos.length * 60 +
            (deliveryOption.isExpress ? deliveryOption.price : 0),
        order_date: orderData.orderDate || new Date().toISOString(),
        order_details: cleanOrderDetails,
      };

      const { error } = await supabase.from("orders").insert(orderToInsert);
      if (error) {
        console.error("Error inserting order:", error);
      } else {
        console.log("Order synced to database:", orderId);
      }
    } catch (error) {
      console.error("Error submitting order to Supabase:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Login
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-blue-600 hover:underline text-sm"
              >
                Back to Home
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 overflow-auto">
      <Header
        title="Photo to Wall - Admin"
        description="Manage orders and settings"
      />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="mt-6">
              <OrdersAdmin />
            </TabsContent>
            <TabsContent value="settings" className="mt-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4">Settings</h2>
                <p className="text-gray-600">
                  Admin settings will be available here.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="bg-slate-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© 2023 Photo to Wall. All rights reserved.</p>
          <p className="text-sm text-slate-400 mt-2">Admin Dashboard</p>
        </div>
      </footer>
    </div>
  );
}
