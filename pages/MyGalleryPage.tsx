// pages/MyGalleryPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { imageService } from '../services/imageService';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertDialog from '../components/AlertDialog';
import { GeneratedImage, AlertMessage } from '../types';

const MyGalleryPage: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<AlertMessage | null>(null);
  const [selectedImageForEnlarge, setSelectedImageForEnlarge] = useState<GeneratedImage | null>(null);

  const fetchGalleryImages = useCallback(() => {
    setLoading(true);
    try {
      const images = imageService.getGalleryImages();
      setGalleryImages(images);
    } catch (error) {
      setAlert({
        title: 'Error',
        message: `Failed to load gallery images: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
        onConfirm: () => setAlert(null),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGalleryImages();
  }, [fetchGalleryImages]);

  const handleDeleteImage = useCallback((id: string) => {
    setAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this image from your gallery? This action cannot be undone.',
      type: 'danger',
      onConfirm: () => {
        const success = imageService.deleteImageFromGallery(id);
        if (success) {
          fetchGalleryImages(); // Re-fetch to update the list
          setAlert({
            title: 'Deleted!',
            message: 'Image successfully deleted.',
            type: 'success',
            onConfirm: () => setAlert(null),
          });
        } else {
          setAlert({
            title: 'Error',
            message: 'Failed to delete image.',
            type: 'error',
            onConfirm: () => setAlert(null),
          });
        }
      },
      onCancel: () => setAlert(null),
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
  }, [fetchGalleryImages]);

  const handleDownloadImage = useCallback((imageUrl: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `vm-gallery-${prompt.substring(0, 20).replace(/\s/g, '_')}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 text-center lg:text-left">My Gallery</h1>

      {galleryImages.length === 0 ? (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="text-xl text-gray-700 dark:text-gray-300">Your gallery is empty.</p>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Start generating images on the "Generate Image" page to add them here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <img
                src={image.imageUrl}
                alt={image.prompt}
                className="w-full h-48 object-cover object-center cursor-pointer"
                onClick={() => setSelectedImageForEnlarge(image)}
              />
              <div className="p-4">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate mb-1">{image.prompt}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Generated: {new Date(image.timestamp).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownloadImage(image.imageUrl, image.prompt)}
                    className="flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteImage(image.id)}
                    className="flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Enlarge Modal */}
      {selectedImageForEnlarge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
          onClick={() => setSelectedImageForEnlarge(null)}
        >
          <div
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate pr-4">{selectedImageForEnlarge.prompt}</h3>
              <button
                onClick={() => setSelectedImageForEnlarge(null)}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-grow overflow-auto">
              <img
                src={selectedImageForEnlarge.imageUrl}
                alt={selectedImageForEnlarge.prompt}
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={() => handleDownloadImage(selectedImageForEnlarge.imageUrl, selectedImageForEnlarge.prompt)}
                className="flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteImage(selectedImageForEnlarge.id)}
                className="flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {alert && (
        <AlertDialog
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onConfirm={alert.onConfirm}
          onCancel={alert.onCancel}
          confirmText={alert.confirmText}
          cancelText={alert.cancelText}
        />
      )}
    </div>
  );
};

export default MyGalleryPage;