import { useState, useEffect } from "react";
import OrderDetails from "./OrderDetails";

interface Photo {
  id: string;
  preview: string;
}

interface OrderDetails {
  photos: Photo[];
  userInfo: {
    name: string;
    phone: string;
    location: string;
  };
  deliveryOption: {
    isExpress: boolean;
    price: number;
  };
  totalPrice: number;
  orderDate: string;
  orderId: string;
}

export default function PastOrders() {
  const [pastOrders, setPastOrders] = useState<OrderDetails[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    // Load past orders from localStorage
    const loadPastOrders = () => {
      const savedOrders = localStorage.getItem("pastPhotoOrders");
      if (savedOrders) {
        try {
          const parsedOrders = JSON.parse(savedOrders);
          // Ensure the photos have valid preview URLs
          const validatedOrders = parsedOrders.map((order: OrderDetails) => {
            // Make sure we're using the actual photos from the order
            return {
              ...order,
              // Ensure each photo has a valid preview URL
              photos: order.photos.map((photo) => {
                // Just use the preview as is - it should be a data URL now
                return {
                  ...photo,
                  preview:
                    photo.preview ||
                    `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&q=80&seed=${photo.id || Math.random()}`,
                };
              }),
            };
          });
          setPastOrders(validatedOrders);
        } catch (error) {
          console.error("Error parsing past orders:", error);
          setPastOrders([]);
        }
      }
    };

    loadPastOrders();
  }, []);

  const toggleOrderExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  if (pastOrders.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <h2 className="text-xl font-bold mb-4">Past Orders</h2>
        <p className="text-gray-600">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Past Orders</h2>
      <div className="space-y-4">
        {pastOrders.map((order, index) => (
          <OrderDetails
            key={order.orderId || index}
            order={order}
            expanded={expandedOrder === (order.orderId || order.orderDate)}
            onToggleExpand={() =>
              toggleOrderExpand(order.orderId || order.orderDate)
            }
          />
        ))}
      </div>
    </div>
  );
}
