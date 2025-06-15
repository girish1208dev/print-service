import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Clock, ChevronDown, ChevronUp, Zap } from "lucide-react";

interface OrderDetailsProps {
  order: any;
  expanded?: boolean;
  onToggleExpand?: (orderId: string) => void;
}

export default function OrderDetails({
  order,
  expanded = false,
  onToggleExpand,
}: OrderDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const toggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand(order.id);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  // Determine if we're using the admin view (database) or user view (localStorage)
  const isAdminView = "customer_name" in order;

  // Extract the appropriate fields based on the view
  const name = isAdminView
    ? order.customer_name
    : order.userInfo?.name || "Unknown";
  const phone = isAdminView
    ? order.customer_phone
    : order.userInfo?.phone || "Unknown";
  const location = isAdminView
    ? order.customer_location
    : order.userInfo?.location || "Unknown";
  const isExpress = isAdminView
    ? order.is_express
    : order.deliveryOption?.isExpress || false;
  const deliveryPrice = isAdminView
    ? order.delivery_price
    : order.deliveryOption?.price || 0;
  const totalCost = isAdminView
    ? order.total_cost
    : order.totalCost || order.totalPrice || 0;
  const orderDate = isAdminView
    ? order.order_date
    : order.orderDate || new Date().toISOString();
  const photoCount = isAdminView
    ? order.photo_count
    : order.photos?.length || 0;

  // Get photos array - handle different data structures
  let photos = [];
  if (isAdminView) {
    // Try to get photos from order_details first
    photos = order.order_details?.photos || [];

    // If no photos in order_details, try to get from order_details.order_details
    if (photos.length === 0 && order.order_details?.order_details?.photos) {
      photos = order.order_details.order_details.photos;
    }

    // If still no photos, check if there's a nested structure
    if (photos.length === 0 && typeof order.order_details === "string") {
      try {
        const parsedDetails = JSON.parse(order.order_details);
        photos = parsedDetails.photos || [];
      } catch (e) {
        console.error("Failed to parse order details:", e);
      }
    }
  } else {
    photos = order.photos || [];
  }

  return (
    <Card className="p-4 overflow-hidden bg-white">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleExpand}
      >
        <div>
          <h3 className="font-semibold">Order from {name}</h3>
          <p className="text-sm text-gray-600">
            <Clock className="inline-block mr-1 h-4 w-4" />
            {new Date(orderDate).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center">
          <span className="mr-4 font-medium">Rs.{totalCost}</span>
          {isExpress && (
            <span className="mr-4 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center">
              <Zap className="h-3 w-3 mr-1" /> Express
            </span>
          )}
          {(expanded !== undefined ? expanded : isExpanded) ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </div>

      {(expanded !== undefined ? expanded : isExpanded) && (
        <div className="mt-4 space-y-4">
          <Separator />

          {/* Customer Info */}
          <div className="text-sm">
            <h4 className="font-semibold mb-1">Customer Information</h4>
            <p>
              <span className="font-medium">Name:</span> {name}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {phone}
            </p>
            <p>
              <span className="font-medium">Location:</span> {location}
            </p>
          </div>

          <Separator />

          {/* Order Details */}
          <div className="text-sm">
            <h4 className="font-semibold mb-1">Order Details</h4>
            <p>
              <span className="font-medium">Photos:</span> {photoCount} (Rs.
              {photoCount * 60})
            </p>
            <p>
              <span className="font-medium">Delivery:</span>{" "}
              {isExpress ? "Express (10 minutes)" : "Standard (Next Day)"}
            </p>
            <p>
              <span className="font-medium">Delivery Cost:</span>{" "}
              {isExpress ? `Rs.${deliveryPrice}` : "Free"}
            </p>
            <p className="font-semibold mt-2">Total Cost: Rs.{totalCost}</p>
          </div>

          {/* Photos Preview if available */}
          {photos && photos.length > 0 && (
            <>
              <Separator />
              <div className="text-sm">
                <h4 className="font-semibold mb-1">Photos</h4>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-2">
                  {photos.map((photo: any, index: number) => (
                    <div
                      key={index}
                      className="h-16 w-16 rounded overflow-hidden bg-gray-100 border"
                    >
                      <img
                        src={photo.preview}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Set a fallback image if the preview fails to load
                          const seed = photo.id || `photo-${index}`;
                          (e.target as HTMLImageElement).src =
                            `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&q=80&seed=${seed}`;
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
