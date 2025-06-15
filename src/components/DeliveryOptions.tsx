import { useState } from "react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Zap } from "lucide-react";

interface DeliveryOption {
  isExpress: boolean;
  price: number;
}

export default function DeliveryOptions({
  onDeliveryChange,
}: {
  onDeliveryChange?: (option: DeliveryOption) => void;
}) {
  const [isExpress, setIsExpress] = useState(false);

  const handleToggle = (checked: boolean) => {
    setIsExpress(checked);
    if (onDeliveryChange) {
      onDeliveryChange({
        isExpress: checked,
        price: checked ? 30 : 0,
      });
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-2xl font-bold">Delivery Options</h2>
        <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
          <Zap className="inline-block h-4 w-4 mr-1" />
          Instant Photos Delivery Available!
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4">
        {/* Express Delivery Option */}
        <div
          className={`p-4 border-2 rounded-lg ${isExpress ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
          onClick={() => handleToggle(true)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-lg flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Express Delivery
              </h3>
              <p className="text-gray-700 mt-1">
                Get your photos in 10 minutes (+Rs.30)
              </p>
            </div>

            <Switch
              id="express-mode"
              checked={isExpress}
              onCheckedChange={handleToggle}
              className="scale-125"
            />
          </div>
        </div>

        {/* Standard Delivery Option */}
        <div
          className={`p-4 border-2 rounded-lg ${!isExpress ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
          onClick={() => handleToggle(false)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-lg">Standard Delivery</h3>
              <p className="text-gray-700 mt-1">Free next-day delivery</p>
            </div>

            <Switch
              id="standard-mode"
              checked={!isExpress}
              onCheckedChange={(checked) => handleToggle(!checked)}
              className="scale-125"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="font-semibold text-lg">
          {isExpress
            ? "Express Delivery Selected"
            : "Standard Delivery Selected"}
        </p>
        <p className="mt-2 text-gray-700">
          {isExpress
            ? "Your photos will be delivered within 10 minutes of order confirmation."
            : "Your photos will be delivered the next day at no extra cost."}
        </p>
        <p className="mt-2 font-bold text-lg">
          Delivery Fee: {isExpress ? "Rs.30" : "Free"}
        </p>
      </div>
    </div>
  );
}
