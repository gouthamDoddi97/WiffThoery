import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ImageUpload = ({ images = [], onImagesChange, maxImages = 2, bucket, label, accept = 'image/*' }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Compress image before upload
  const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Scale down if larger than maxWidth
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              // Create new file with compressed blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setError('');
    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file size (5MB max for original)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 5MB)`);
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image`);
        }

        // Compress image
        let fileToUpload = file;
        try {
          fileToUpload = await compressImage(file);
          console.log(`Compressed ${file.name}: ${(file.size / 1024).toFixed(1)}KB → ${(fileToUpload.size / 1024).toFixed(1)}KB`);
        } catch (compressionError) {
          console.warn('Compression failed, uploading original:', compressionError);
          // Continue with original file if compression fails
        }

        // Generate unique filename
        const { data: { user } } = await supabase.auth.getUser();
        const fileExt = 'jpg'; // Always use jpg after compression
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, fileToUpload, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedUrls]);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (urlToRemove, index) => {
    try {
      // Extract file path from URL
      const url = new URL(urlToRemove);
      const pathParts = url.pathname.split(`/object/public/${bucket}/`);
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        
        // Delete from storage
        await supabase.storage.from(bucket).remove([filePath]);
      }

      // Remove from state
      onImagesChange(images.filter((_, i) => i !== index));
    } catch (err) {
      console.error('Delete error:', err);
      // Still remove from UI even if delete fails
      onImagesChange(images.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="image-upload">
      <label className="image-upload__label">{label}</label>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="image-upload__error"
        >
          {error}
        </motion.div>
      )}

      <div className="image-upload__grid">
        <AnimatePresence>
          {images.map((url, index) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="image-upload__preview"
            >
              <img src={url} alt={`Upload ${index + 1}`} />
              <button
                type="button"
                onClick={() => handleRemove(url, index)}
                className="image-upload__remove"
                title="Remove image"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {images.length < maxImages && (
          <label className="image-upload__dropzone">
            <input
              type="file"
              accept={accept}
              multiple={maxImages - images.length > 1}
              onChange={handleFileSelect}
              disabled={uploading}
              className="image-upload__input"
            />
            <div className="image-upload__dropzone-content">
              {uploading ? (
                <>
                  <Loader className="image-upload__icon image-upload__icon--spin" size={32} />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="image-upload__icon" size={32} />
                  <span>Click to upload</span>
                  <span className="image-upload__hint">
                    {maxImages - images.length} remaining
                  </span>
                </>
              )}
            </div>
          </label>
        )}
      </div>

      <p className="image-upload__info">
        Max {maxImages} images · JPG, PNG, WebP · 5MB per file
      </p>

      <style jsx>{`
        .image-upload {
          margin-bottom: 1.5rem;
        }

        .image-upload__label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.75rem;
        }

        .image-upload__error {
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          margin-bottom: 0.75rem;
          color: #c00;
          font-size: 0.85rem;
        }

        .image-upload__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .image-upload__preview {
          position: relative;
          aspect-ratio: 1;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 2px solid #e0e0e0;
        }

        .image-upload__preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-upload__remove {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .image-upload__remove:hover {
          background: rgba(220, 0, 0, 0.9);
        }

        .image-upload__dropzone {
          aspect-ratio: 1;
          border: 2px dashed #ccc;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #fafafa;
        }

        .image-upload__dropzone:hover {
          border-color: #667eea;
          background: #f5f7ff;
        }

        .image-upload__input {
          display: none;
        }

        .image-upload__dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          text-align: center;
        }

        .image-upload__icon {
          color: #999;
        }

        .image-upload__icon--spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .image-upload__dropzone-content span {
          font-size: 0.85rem;
          color: #666;
        }

        .image-upload__hint {
          font-size: 0.75rem !important;
          color: #999 !important;
        }

        .image-upload__info {
          font-size: 0.8rem;
          color: #999;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;
