import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PhotoUpload from "./PhotoUpload";
import UserInfoForm from "./UserInfoForm";
import DeliveryOptions from "./DeliveryOptions";
import OrderSummary from "./OrderSummary";
import PastOrders from "./PastOrders";
import { Button } from "./ui/button";
import { Clock, Zap } from "lucide-react";
import { sendEmail, formatOrderEmail } from "./EmailService";
import { supabase, safeJsonStringify } from "../lib/supabase";

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

interface OrderDetails {
  photos: {
    id: string;
    preview: string;
  }[];
  userInfo: UserInfo;
  deliveryOption: DeliveryOption;
  totalCost: number;
  orderDate: string;
}

export default function PhotoOrderingSystem() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo>(() => {
    const savedInfo = localStorage.getItem("photoOrderUserInfo");
    return savedInfo
      ? JSON.parse(savedInfo)
      : { name: "", phone: "", location: "" };
  });
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>({
    isExpress: false,
    price: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPastOrders, setShowPastOrders] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's a completed order in localStorage and add it to past orders
    const checkForCompletedOrder = () => {
      const orderDetails = localStorage.getItem("photoOrderDetails");
      if (orderDetails) {
        const order = JSON.parse(orderDetails) as OrderDetails;
        const pastOrders = localStorage.getItem("pastPhotoOrders");
        let updatedPastOrders = [];

        if (pastOrders) {
          updatedPastOrders = JSON.parse(pastOrders);
          // Check if this order is already in past orders by comparing date
          const orderExists = updatedPastOrders.some(
            (pastOrder: OrderDetails) =>
              pastOrder.orderDate === order.orderDate,
          );

          if (!orderExists) {
            updatedPastOrders.unshift(order);
          }
        } else {
          updatedPastOrders = [order];
        }

        localStorage.setItem(
          "pastPhotoOrders",
          JSON.stringify(updatedPastOrders),
        );
      }
    };

    checkForCompletedOrder();
  }, []);

  const handleSubmitOrder = async () => {
    if (
      photos.length === 0 ||
      !userInfo.name ||
      !userInfo.phone ||
      !userInfo.location
    ) {
      setErrorMessage(
        "Please fill in all required fields and upload at least one photo.",
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Generate a unique order ID
      const orderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
      const orderDate = new Date().toISOString();
      const totalCost = photos.length * 60 + deliveryOption.price;

      // Prepare order details
      const orderDetails = {
        orderId,
        photos: photos.map((photo) => ({
          id: photo.id,
          preview: photo.preview,
        })),
        userInfo,
        deliveryOption,
        totalCost,
        orderDate,
      };

      console.log("Creating new order:", orderDetails);

      // Format and send email with order details
      const emailData = formatOrderEmail({
        photos,
        userInfo,
        deliveryOption,
        totalCost,
      });

      // Send the email
      const emailSent = await sendEmail(emailData);

      if (!emailSent) {
        console.warn("Failed to send order email");
      }

      // Store order details in localStorage for the confirmation page
      localStorage.setItem("photoOrderDetails", JSON.stringify(orderDetails));

      // Add to past orders
      const pastOrders = localStorage.getItem("pastPhotoOrders");
      let updatedPastOrders = [];

      if (pastOrders) {
        updatedPastOrders = JSON.parse(pastOrders);
        updatedPastOrders.unshift(orderDetails);
      } else {
        updatedPastOrders = [orderDetails];
      }

      localStorage.setItem(
        "pastPhotoOrders",
        JSON.stringify(updatedPastOrders),
      );

      // Submit to Supabase
      console.log("Submitting to Supabase...");

      // Create a clean version of the order details without File objects
      // Convert blob URLs to data URLs for permanent storage
      const cleanOrderDetails = await Promise.all(
        photos.map(async (photo) => {
          // Check if the preview is a blob URL (starts with blob:)
          const isTemporaryUrl = photo.preview.startsWith("blob:");

          if (isTemporaryUrl && photo.file) {
            // Convert the file to a data URL for permanent storage
            try {
              const dataUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(photo.file);
              });

              return {
                id: photo.id,
                preview: dataUrl as string,
                fileName: photo.file.name || `photo-${photo.id}.jpg`,
              };
            } catch (err) {
              console.error("Error converting blob to data URL:", err);
              // Fallback to unsplash image
              return {
                id: photo.id,
                preview: `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&q=80&seed=${photo.id}`,
                fileName: photo.file.name || `photo-${photo.id}.jpg`,
              };
            }
          } else {
            // Use the existing preview URL
            return {
              id: photo.id,
              preview: photo.preview,
              fileName: photo.file?.name || `photo-${photo.id}.jpg`,
            };
          }
        }),
      );

      const { error } = await supabase.from("orders").insert({
        id: orderId,
        customer_name: userInfo.name,
        customer_phone: userInfo.phone,
        customer_location: userInfo.location,
        photo_count: photos.length,
        is_express: deliveryOption.isExpress,
        delivery_price: deliveryOption.price,
        total_cost: totalCost,
        order_date: orderDate,
        order_details: {
          orderId,
          photos: cleanOrderDetails,
          userInfo,
          deliveryOption,
          totalCost,
          orderDate,
        },
      });

      if (error) {
        console.error("Supabase insert error:", error);
      } else {
        console.log("Order submitted successfully to Supabase");
      }

      // Navigate to confirmation page
      navigate("/confirmation");
    } catch (error) {
      console.error("Error submitting order:", error);
      setErrorMessage(
        "There was an error submitting your order. Please try again.",
      );

      // For development purposes, let's still save the order and navigate
      // In production, you would want to remove this code
      const orderDetails = {
        orderId: `ORD-${Math.floor(Math.random() * 1000000)}`,
        photos: photos.map((photo) => ({
          id: photo.id,
          preview: photo.preview,
        })),
        userInfo,
        deliveryOption,
        totalCost: photos.length * 60 + deliveryOption.price,
        orderDate: new Date().toISOString(),
      };

      localStorage.setItem("photoOrderDetails", JSON.stringify(orderDetails));
      navigate("/confirmation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-center">
          Photo to Wall - Print Service
        </h1>
        <img
          src="/images/tempo-image-20250320T113359327Z.png"
          alt="Photo to Wall Logo"
          className="mt-4 h-20 w-auto object-contain"
        />
        <div className="mt-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center">
          <Zap className="h-4 w-4 mr-1" />
          <span className="font-semibold">
            Instant Photos Delivery Available!
          </span>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button
          variant={showPastOrders ? "default" : "outline"}
          onClick={() => setShowPastOrders(!showPastOrders)}
          className="flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          {showPastOrders ? "Hide Past Orders" : "View Past Orders"}
        </Button>
      </div>

      {showPastOrders && (
        <div className="mb-6">
          <PastOrders />
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <PhotoUpload onPhotosChange={setPhotos} />
          <UserInfoForm onUserInfoChange={setUserInfo} />
          <DeliveryOptions onDeliveryChange={setDeliveryOption} />
        </div>

        <div className="md:sticky md:top-4 self-start">
          <OrderSummary
            photos={photos}
            userInfo={userInfo}
            deliveryOption={deliveryOption}
            onSubmit={handleSubmitOrder}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
