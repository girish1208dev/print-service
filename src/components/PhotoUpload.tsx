import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { X } from "lucide-react";

interface Photo {
  id: string;
  file: File;
  preview: string;
}

export default function PhotoUpload({
  onPhotosChange,
}: {
  onPhotosChange?: (photos: Photo[]) => void;
}) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).map((file) => {
        // Generate a consistent ID based on file properties
        const id = Math.random().toString(36).substring(2, 9);
        return {
          id,
          file,
          preview: URL.createObjectURL(file),
          // Store additional metadata that might be useful
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        };
      });

      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      if (onPhotosChange) onPhotosChange(updatedPhotos);
    }
  };

  const removePhoto = (id: string) => {
    const updatedPhotos = photos.filter((photo) => photo.id !== id);
    setPhotos(updatedPhotos);
    if (onPhotosChange) onPhotosChange(updatedPhotos);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Upload Photos</h2>
      <p className="mb-4 text-gray-600">Each photo costs Rs.60</p>

      <div className="mb-4">
        <Button onClick={triggerFileInput} className="w-full">
          Select Photos
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          multiple
        />
      </div>

      {photos.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            Selected Photos ({photos.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="relative group overflow-hidden">
                <img
                  src={photo.preview}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                />
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                >
                  <X size={16} className="text-red-500" />
                </button>
              </Card>
            ))}
          </div>
          <div className="mt-4 text-right">
            <p className="font-semibold">Total: Rs.{photos.length * 60}</p>
          </div>
        </div>
      )}
    </div>
  );
}
