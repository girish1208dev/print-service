import { useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { CheckCircle, Clock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OrderDetails {
  photos: {
    id: string;
    preview: string;
  }[];
  userInfo: {
    name: string;
    phone: string;
    location: string;
  };
  deliveryOption: {
    isExpress: boolean;
    price: number;
  };
  totalCost: number;
  orderDate: string;
}

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const orderDetails: OrderDetails | null = JSON.parse(
    localStorage.getItem("photoOrderDetails") || "null",
  );

  useEffect(() => {
    if (!orderDetails) {
      navigate("/");
    }
  }, [orderDetails, navigate]);

  if (!orderDetails) return null;

  const photosCost = orderDetails.photos.length * 60;

  const handleNewOrder = () => {
    navigate("/");
  };

  const handleViewPastOrders = () => {
    navigate("/");
    // Set a flag in sessionStorage to show past orders when redirected
    sessionStorage.setItem("showPastOrders", "true");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="text-center mb-8">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold">Order Confirmed!</h1>
        <p className="text-gray-600 mt-2">
          Your photos will be delivered soon.
        </p>
        {orderDetails.deliveryOption.isExpress && (
          <div className="mt-3 inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
            <Zap className="h-4 w-4 mr-1" />
            <span className="font-semibold">Instant Delivery in Progress!</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Order Summary</h2>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <Clock className="h-4 w-4 mr-1" />
              Order Date: {new Date(orderDetails.orderDate).toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
            Order Saved
          </div>
        </div>

        <Separator />

        {/* Photos Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Photos ({orderDetails.photos.length})
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {orderDetails.photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden h-16 w-16">
                <img
                  src={photo.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </Card>
            ))}
          </div>
          <p className="mt-2 text-right">Photos Cost: Rs.{photosCost}</p>
        </div>

        <Separator />

        {/* User Info */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Delivery Information</h3>
          <p>
            <span className="font-medium">Name:</span>{" "}
            {orderDetails.userInfo.name}
          </p>
          <p>
            <span className="font-medium">Phone:</span>{" "}
            {orderDetails.userInfo.phone}
          </p>
          <p>
            <span className="font-medium">Location:</span>{" "}
            {orderDetails.userInfo.location}
          </p>
        </div>

        <Separator />

        {/* Delivery Option */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Delivery Option</h3>
          <div
            className={`p-3 rounded-lg ${orderDetails.deliveryOption.isExpress ? "bg-yellow-50 border border-yellow-200" : "bg-blue-50 border border-blue-200"}`}
          >
            <p className="font-medium">
              {orderDetails.deliveryOption.isExpress ? (
                <>
                  <Zap className="inline-block h-4 w-4 mr-1 text-yellow-500" />
                  Express Delivery (10 minutes)
                </>
              ) : (
                "Standard Delivery (Next Day)"
              )}
            </p>
            <p className="mt-1">
              Delivery Cost:{" "}
              <span className="font-semibold">
                {orderDetails.deliveryOption.isExpress
                  ? `Rs.${orderDetails.deliveryOption.price}`
                  : "Free"}
              </span>
            </p>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Cost:</span>
            <span>Rs.{orderDetails.totalCost}</span>
          </div>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-medium">
              Expected Delivery:{" "}
              <span className="text-green-600 font-semibold">
                {orderDetails.deliveryOption.isExpress
                  ? "Within 10 minutes from order time"
                  : "Next day delivery"}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button onClick={handleNewOrder} className="w-full">
            Place Another Order
          </Button>
          <Button
            onClick={handleViewPastOrders}
            variant="outline"
            className="w-full"
          >
            View Past Orders
          </Button>
        </div>
      </div>
    </div>
  );
}
