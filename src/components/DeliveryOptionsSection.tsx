import React, { useState } from "react";
import DeliveryOptions from "./DeliveryOptions";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface DeliveryOption {
  isExpress: boolean;
  price: number;
}

interface DeliveryOptionsSectionProps {
  onDeliveryChange?: (option: DeliveryOption) => void;
  className?: string;
}

const DeliveryOptionsSection = ({
  onDeliveryChange,
  className = "",
}: DeliveryOptionsSectionProps) => {
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>({
    isExpress: false,
    price: 0,
  });

  const handleDeliveryChange = (option: DeliveryOption) => {
    setDeliveryOption(option);
    if (onDeliveryChange) {
      onDeliveryChange(option);
    }
  };

  return (
    <section className={`w-full max-w-[1200px] mx-auto my-6 ${className}`}>
      <Card className="bg-white shadow-md">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Delivery Options
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600 mb-4">
            Choose your preferred delivery method below:
          </p>
          <DeliveryOptions onDeliveryChange={handleDeliveryChange} />

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800">Delivery Summary</h3>
            <p className="text-sm text-blue-700 mt-1">
              {deliveryOption.isExpress
                ? "Express delivery: Your photos will arrive within 10 minutes"
                : "Standard delivery: Your photos will arrive the next day"}
            </p>
            <p className="mt-2 font-semibold text-blue-900">
              Delivery Fee: {deliveryOption.isExpress ? "Rs.30" : "Free"}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default DeliveryOptionsSection;
