
import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadImage } from '@/integrations/supabase/storageService';

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded, className }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('O arquivo precisa ser uma imagem');
      return;
    }
    
    // Limite de 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }
    
    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        onImageUploaded(imageUrl);
        toast.success('Imagem carregada com sucesso');
      } else {
        toast.error('Erro ao fazer upload da imagem');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`relative ${className || ''}`}
      onDragEnter={handleDrag}
    >
      <label
        htmlFor="image-upload"
        className={`
          flex flex-col items-center justify-center w-full h-32
          border-2 border-dashed rounded-md cursor-pointer
          transition-colors
          ${dragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:bg-gray-50'}
        `}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <span>Enviando...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <Upload className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Clique ou arraste uma imagem</span>
            <span className="text-xs text-gray-400 mt-1">PNG, JPG ou JPEG (Max. 5MB)</span>
          </div>
        )}
        <input
          id="image-upload"
          name="image"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          disabled={isUploading}
        />
      </label>
    </div>
  );
};

export default ImageUploader;
