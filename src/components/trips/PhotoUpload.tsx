import React, { useState } from 'react';
import { Image, X } from 'lucide-react';
import { supabase } from '../../services/supabase/client';

interface PhotoUploadProps {
  onPhotosChange: (photos: File[]) => void;
}

export function PhotoUpload({ onPhotosChange }: PhotoUploadProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    );

    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setPhotos(prev => [...prev, ...validFiles]);
    onPhotosChange([...photos, ...validFiles]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    const newPhotos = photos.filter((_, i) => i !== index);
    setPreviewUrls(newPreviewUrls);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Photos
      </label>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {previewUrls.map((url, index) => (
          <div key={url} className="relative">
            <img
              src={url}
              alt={`Preview ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <Image className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label htmlFor="photo-upload" className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
              <span>Upload photos</span>
              <input
                id="photo-upload"
                name="photo-upload"
                type="file"
                className="sr-only"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      </div>
    </div>
  );
}