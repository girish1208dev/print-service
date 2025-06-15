import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { X } from "lucide-react";

interface Photo {
  id: string;
  file: File;
  preview: string;
}

interface UserInfo {
  name: string;
  phone: string;
  location: string;
}

interface DeliveryOption {
  isExpress: boolean;
  price: number;
}

interface OrderSummaryProps {
  photos: Photo[];
  userInfo: UserInfo;
  deliveryOption: DeliveryOption;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function OrderSummary({
  photos,
  userInfo,
  deliveryOption,
  onSubmit,
  isSubmitting = false,
}: OrderSummaryProps) {
  const photosCost = photos.length * 60;
  const deliveryCost = deliveryOption.price;
  const totalCost = photosCost + deliveryCost;

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

      <div className="space-y-6">
        {/* Photos Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Photos ({photos.length})
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {photos.map((photo) => (
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
            <span className="font-medium">Name:</span> {userInfo.name}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {userInfo.phone}
          </p>
          <p>
            <span className="font-medium">Location:</span> {userInfo.location}
          </p>
        </div>

        <Separator />

        {/* Delivery Option */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Delivery Option</h3>
          <p>
            {deliveryOption.isExpress
              ? "Express Delivery (10 minutes)"
              : "Standard Delivery (Next Day)"}
          </p>
          <p className="text-right">
            Delivery Cost:{" "}
            {deliveryOption.isExpress ? `Rs.${deliveryOption.price}` : "Free"}
          </p>
        </div>

        <Separator />

        {/* Total */}
        <div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Cost:</span>
            <span>Rs.{totalCost}</span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>
              Expected Delivery:{" "}
              {deliveryOption.isExpress
                ? "Within 10 minutes"
                : "Next day delivery"}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          className="w-full mt-4"
          disabled={
            photos.length === 0 ||
            !userInfo.name ||
            !userInfo.phone ||
            !userInfo.location ||
            isSubmitting
          }
        >
          {isSubmitting ? "Processing..." : "Submit Order"}
        </Button>
      </div>
    </div>
  );
}
