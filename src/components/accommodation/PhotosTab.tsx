
import React from 'react';
import { SearchResult } from '@/types';

interface PhotosTabProps {
  result: SearchResult;
}

const PhotosTab: React.FC<PhotosTabProps> = ({ result }) => {
  const accommodation = result.accommodation;
  
  // Prepare images array from accommodation
  const images = accommodation?.images && accommodation.images.length > 0 
    ? accommodation.images 
    : accommodation ? [accommodation.imageUrl] : [];

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div key={index} className="aspect-video bg-muted rounded-md overflow-hidden">
            <img 
              src={image} 
              alt={`${accommodation?.name || 'Acomodação'} - Imagem ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotosTab;
