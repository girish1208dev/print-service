import { useState, useEffect } from "react";
import PhotoUpload from "./PhotoUpload";
import { Card } from "./ui/card";

interface Photo {
  id: string;
  file: File;
  preview: string;
}

interface PhotoUploadSectionProps {
  onPhotosChange?: (photos: Photo[]) => void;
  onPriceChange?: (price: number) => void;
}

export default function PhotoUploadSection({
  onPhotosChange = () => {},
  onPriceChange = () => {},
}: PhotoUploadSectionProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    // Calculate price whenever photos change
    const price = photos.length * 60;
    setTotalPrice(price);
    onPriceChange(price);
  }, [photos, onPriceChange]);

  const handlePhotosChange = (updatedPhotos: Photo[]) => {
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);
  };

  return (
    <Card className="w-full max-w-[1200px] mx-auto bg-gray-50 p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Upload Your Photos</h2>
        <p className="text-gray-600">
          Select the photos you want to print (Rs.60 per photo)
        </p>
      </div>

      <div className="mb-6">
        <PhotoUpload onPhotosChange={handlePhotosChange} />
      </div>

      {photos.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-800">Order Summary</h3>
              <p className="text-sm text-gray-600">
                {photos.length} photo{photos.length !== 1 ? "s" : ""} selected
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Price per photo: Rs.60</p>
              <p className="font-bold text-lg">Total: Rs.{totalPrice}</p>
            </div>
          </div>
        </div>
      )}

      {photos.length === 0 && (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-500">
            No photos selected yet. Upload photos to see your order summary.
          </p>
        </div>
      )}
    </Card>
  );
}
