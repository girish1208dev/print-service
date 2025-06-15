import React, { useState } from "react";
import OrderSummary from "./OrderSummary";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ArrowLeft, ArrowRight, Edit } from "lucide-react";

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

interface OrderReviewSectionProps {
  photos: Photo[];
  userInfo: UserInfo;
  deliveryOption: DeliveryOption;
  onSubmitOrder: () => void;
  onEditPhotos: () => void;
  onEditUserInfo: () => void;
  onEditDelivery: () => void;
  isSubmitting?: boolean;
}

const OrderReviewSection: React.FC<OrderReviewSectionProps> = ({
  photos = [],
  userInfo = { name: "", phone: "", location: "" },
  deliveryOption = { isExpress: false, price: 0 },
  onSubmitOrder = () => {},
  onEditPhotos = () => {},
  onEditUserInfo = () => {},
  onEditDelivery = () => {},
  isSubmitting = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="w-full bg-gray-50 p-6 rounded-lg mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Review Your Order</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ArrowLeft className="mr-2 h-4 w-4" /> Collapse
            </>
          ) : (
            <>
              <ArrowRight className="mr-2 h-4 w-4" /> Expand
            </>
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          <Card className="p-4 bg-white">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">
                Selected Photos ({photos.length})
              </h3>
              <Button variant="outline" size="sm" onClick={onEditPhotos}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="h-16 w-16 rounded overflow-hidden"
                >
                  <img
                    src={photo.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {photos.length === 0 && (
                <p className="col-span-full text-gray-500 italic">
                  No photos selected
                </p>
              )}
            </div>
          </Card>

          <Card className="p-4 bg-white">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Delivery Information</h3>
              <Button variant="outline" size="sm" onClick={onEditUserInfo}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </div>
            {userInfo.name ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{userInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{userInfo.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{userInfo.location}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No delivery information provided
              </p>
            )}
          </Card>

          <Card className="p-4 bg-white">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Delivery Option</h3>
              <Button variant="outline" size="sm" onClick={onEditDelivery}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {deliveryOption.isExpress
                    ? "Express Delivery (10 minutes)"
                    : "Standard Delivery (Next Day)"}
                </p>
                <p className="text-sm text-gray-500">
                  {deliveryOption.isExpress
                    ? "Your photos will be delivered within 10 minutes"
                    : "Your photos will be delivered next day"}
                </p>
              </div>
              <p className="font-medium">
                {deliveryOption.isExpress
                  ? `Rs.${deliveryOption.price}`
                  : "Free"}
              </p>
            </div>
          </Card>

          <OrderSummary
            photos={photos}
            userInfo={userInfo}
            deliveryOption={deliveryOption}
            onSubmit={onSubmitOrder}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
    </div>
  );
};

export default OrderReviewSection;
