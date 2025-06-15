import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import OrderDetails from "./OrderDetails";
import { Printer, RefreshCw } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_location: string;
  photo_count: number;
  is_express: boolean;
  delivery_price: number;
  total_cost: number;
  order_date: string;
  order_details: any;
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();

    // Set up a subscription for real-time updates
    const subscription = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          console.log("Real-time update received:", payload);
          setOrders((prevOrders) => [payload.new as Order, ...prevOrders]);
        },
      )
      .subscribe();

    // Also check localStorage for any orders that might have been placed
    checkLocalStorageForOrders();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkLocalStorageForOrders = () => {
    try {
      // Check if there's a recent order in localStorage
      const orderDetails = localStorage.getItem("photoOrderDetails");
      if (orderDetails) {
        const parsedOrder = JSON.parse(orderDetails);
        console.log("Found order in localStorage:", parsedOrder);

        // Submit this order to Supabase
        submitOrderToSupabase(parsedOrder);
      }

      // Also check past orders
      const pastOrders = localStorage.getItem("pastPhotoOrders");
      if (pastOrders) {
        const parsedOrders = JSON.parse(pastOrders);
        console.log("Found past orders in localStorage:", parsedOrders);

        // Submit each past order to Supabase
        parsedOrders.forEach((order: any) => {
          submitOrderToSupabase(order);
        });
      }
    } catch (err) {
      console.error("Error processing localStorage order:", err);
    }
  };

  const submitOrderToSupabase = async (orderData: any) => {
    try {
      if (!orderData) {
        console.error("No order data provided");
        return;
      }

      console.log("Submitting order to Supabase:", orderData);

      // Generate an order ID if not present
      const orderId =
        orderData.orderId || `ORD-${Math.floor(Math.random() * 1000000)}`;

      // Check if this order already exists in the database
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("id", orderId)
        .maybeSingle();

      // If order already exists, don't insert it again
      if (existingOrder) {
        console.log("Order already exists in database:", existingOrder);
        return;
      }

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
      const totalPrice = orderData.totalPrice || orderData.totalCost || 0;
      const orderDate = orderData.orderDate || new Date().toISOString();

      // Clean up photo objects to ensure they're serializable
      // We'll keep the original preview URLs when possible
      const cleanPhotos = photos.map((photo: any) => {
        // Check if the preview is a blob URL (starts with blob:)
        const isTemporaryUrl = photo.preview?.startsWith("blob:");
        return {
          id: photo.id || `photo-${Math.random().toString(36).substring(2, 9)}`,
          preview: isTemporaryUrl
            ? // Use a real photo placeholder instead of avatar
              `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&q=80&seed=${photo.id || Math.random()}`
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
          totalPrice ||
          photos.length * 60 +
            (deliveryOption.isExpress ? deliveryOption.price : 0),
        orderDate,
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
          totalPrice ||
          photos.length * 60 +
            (deliveryOption.isExpress ? deliveryOption.price : 0),
        order_date: orderDate,
        order_details: cleanOrderDetails,
      };

      console.log("Inserting order:", orderToInsert);
      const { error } = await supabase.from("orders").insert(orderToInsert);

      if (error) {
        console.error("Error inserting order:", error);
        throw error;
      }

      console.log("Order submitted successfully");
      // Refresh orders after submission
      fetchOrders();
    } catch (err) {
      console.error("Error submitting order to Supabase:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("Fetching orders from Supabase...");
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("order_date", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Orders fetched:", data);
      setOrders(data || []);

      // If no orders from database, check localStorage
      if (!data || data.length === 0) {
        checkLocalStorageForOrders();
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const printOrderDetails = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const photos = order.order_details?.photos || [];
    const photoHtml = photos
      .map(
        (photo: any, index: number) => `
      <div style="display: inline-block; margin: 5px; width: 100px; height: 100px; overflow: hidden; border: 1px solid #ddd; border-radius: 4px;">
        <img src="${photo.preview}" alt="Photo ${index + 1}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&q=80&seed=${photo.id || `photo-${index}`}'" />
      </div>
    `,
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Order Details - ${order.customer_name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; }
            .photos-container { margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Order Details</h1>
          
          <div class="section">
            <h2>Customer Information</h2>
            <p><span class="label">Name:</span> ${order.customer_name}</p>
            <p><span class="label">Phone:</span> ${order.customer_phone}</p>
            <p><span class="label">Location:</span> ${order.customer_location}</p>
          </div>
          
          <div class="section">
            <h2>Order Details</h2>
            <p><span class="label">Order Date:</span> ${new Date(order.order_date).toLocaleString()}</p>
            <p><span class="label">Photos:</span> ${order.photo_count} (Rs.${order.photo_count * 60})</p>
            <p><span class="label">Delivery:</span> ${order.is_express ? "Express (10 minutes)" : "Standard (Next Day)"}</p>
            <p><span class="label">Delivery Cost:</span> ${order.is_express ? `Rs.${order.delivery_price}` : "Free"}</p>
            <p><span class="label">Total Cost:</span> Rs.${order.total_cost}</p>
          </div>
          
          <div class="section">
            <h2>Photos (${photos.length})</h2>
            <div class="photos-container">
              ${photoHtml}
            </div>
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <h2 className="text-xl font-bold mb-4">Orders</h2>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <h2 className="text-xl font-bold mb-4">Orders</h2>
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchOrders} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <h2 className="text-xl font-bold mb-4">Orders</h2>
        <p className="text-gray-600">No orders found.</p>
        <Button onClick={checkLocalStorageForOrders} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Check for New Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Orders ({orders.length})</h2>
        <Button onClick={fetchOrders} size="sm" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="relative">
            <OrderDetails
              order={order}
              expanded={expandedOrder === order.id}
              onToggleExpand={() => toggleOrderExpand(order.id)}
            />
            {expandedOrder === order.id && (
              <Button
                onClick={() => printOrderDetails(order)}
                className="absolute top-4 right-16 z-10"
                size="sm"
                variant="outline"
              >
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
