import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PhotoUploadSection from "../components/PhotoUploadSection";
import UserInformationSection from "../components/UserInformationSection";
import DeliveryOptionsSection from "../components/DeliveryOptionsSection";
import OrderReviewSection from "../components/OrderReviewSection";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { ArrowRight, Send } from "lucide-react";
import { supabase } from "../lib/supabase";

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

const PhotoOrderingSystem: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoPrice, setPhotoPrice] = useState<number>(0);
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    // Calculate total price whenever photos or delivery option changes
    const total =
      photoPrice + (deliveryOption.isExpress ? deliveryOption.price : 0);
    setTotalPrice(total);
  }, [photoPrice, deliveryOption]);

  const handlePhotosChange = (updatedPhotos: Photo[]) => {
    setPhotos(updatedPhotos);
  };

  const handlePhotosPriceChange = (price: number) => {
    setPhotoPrice(price);
  };

  const handleUserInfoChange = (info: UserInfo) => {
    setUserInfo(info);
    localStorage.setItem("photoOrderUserInfo", JSON.stringify(info));
  };

  const handleDeliveryChange = (option: DeliveryOption) => {
    setDeliveryOption(option);
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);

    try {
      // Create order details
      const orderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
      const orderDate = new Date().toISOString();

      const orderDetails = {
        photos,
        userInfo,
        deliveryOption,
        totalPrice,
        orderDate,
        orderId,
      };

      // Store order details in localStorage for order confirmation page
      localStorage.setItem("photoOrderDetails", JSON.stringify(orderDetails));

      // Add to past orders in localStorage
      const pastOrders = localStorage.getItem("pastPhotoOrders");
      const pastOrdersArray = pastOrders ? JSON.parse(pastOrders) : [];
      pastOrdersArray.unshift(orderDetails);
      localStorage.setItem("pastPhotoOrders", JSON.stringify(pastOrdersArray));

      // Submit to Supabase
      const { error } = await supabase.from("orders").insert({
        id: orderId,
        customer_name: userInfo.name,
        customer_phone: userInfo.phone,
        customer_location: userInfo.location,
        photo_count: photos.length,
        is_express: deliveryOption.isExpress,
        delivery_price: deliveryOption.price,
        total_cost: totalPrice,
        order_date: orderDate,
        order_details: orderDetails,
      });

      if (error) throw error;

      // Navigate to order confirmation page
      navigate("/order-confirmation");
    } catch (error) {
      console.error("Error submitting order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1: // Photo Upload
        return photos.length > 0;
      case 2: // User Information
        return userInfo.name && userInfo.phone && userInfo.location;
      case 3: // Delivery Options
        return true; // Always complete as we have default option
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-6">
            Photo Ordering System
          </h1>

          <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex flex-col items-center ${currentStep === step ? "text-blue-600" : "text-gray-500"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep === step ? "bg-blue-600 text-white" : isStepComplete(step) ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                  {step}
                </div>
                <span className="text-sm font-medium">
                  {step === 1 && "Upload Photos"}
                  {step === 2 && "Your Details"}
                  {step === 3 && "Delivery Options"}
                  {step === 4 && "Review & Submit"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {currentStep === 1 && (
          <div className="space-y-6">
            <PhotoUploadSection
              onPhotosChange={handlePhotosChange}
              onPriceChange={handlePhotosPriceChange}
            />

            <div className="flex justify-end mt-8">
              <Button
                onClick={goToNextStep}
                disabled={!isStepComplete(1)}
                className="px-6"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <UserInformationSection onUserInfoChange={handleUserInfoChange} />

            <div className="flex justify-end mt-8">
              <Button
                onClick={goToNextStep}
                disabled={!isStepComplete(2)}
                className="px-6"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <DeliveryOptionsSection onDeliveryChange={handleDeliveryChange} />

            <div className="flex justify-end mt-8">
              <Button onClick={goToNextStep} className="px-6">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <OrderReviewSection
              photos={photos}
              userInfo={userInfo}
              deliveryOption={deliveryOption}
              onSubmitOrder={handleSubmitOrder}
              onEditPhotos={() => goToStep(1)}
              onEditUserInfo={() => goToStep(2)}
              onEditDelivery={() => goToStep(3)}
              isSubmitting={isSubmitting}
            />

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Photos ({photos.length} × Rs.60):</span>
                  <span>Rs.{photoPrice}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>
                    {deliveryOption.isExpress
                      ? `Rs.${deliveryOption.price}`
                      : "Free"}
                  </span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>Rs.{totalPrice}</span>
                </div>
              </div>

              <Button
                className="w-full mt-6"
                size="lg"
                onClick={handleSubmitOrder}
                disabled={
                  isSubmitting || !isStepComplete(1) || !isStepComplete(2)
                }
              >
                {isSubmitting ? "Processing..." : "Submit Order"}
                <Send className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-sm text-gray-500 mt-4 text-center">
                By submitting your order, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© 2023 Photo to Wall. All rights reserved.</p>
          <p className="text-sm text-slate-400 mt-2">
            A service for printing and delivering your precious memories.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PhotoOrderingSystem;
