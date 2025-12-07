// pages/ImageGenerationPage.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { imageService } from '../services/imageService';
import { creditsService } from '../services/creditsService';
import Button from '../components/Button';
import Input from '../components/Input';
import AlertDialog from '../components/AlertDialog';
import {
  APP_ROUTES,
  IMAGE_SIZES,
  IMAGE_STYLES,
  NUMBER_OF_IMAGES_OPTIONS,
  MODEL_TYPES,
} from '../constants';
import { GeneratedImage, ImageConfig, ImageSize, ImageStyle, ModelType, AlertMessage } from '../types';

const ImageGenerationPage: React.FC = () => {
  const { credits, updateCredits, currentUser } = useAuth();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [promptError, setPromptError] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.DEFAULT);
  const [imageStyle, setImageStyle] = useState<ImageStyle>(ImageStyle.DEFAULT);
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [model, setModel] = useState<ModelType>(ModelType.GEMINI_FLASH);

  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);
  const [selectedImageForEnlarge, setSelectedImageForEnlarge] = useState<GeneratedImage | null>(null);

  const validatePrompt = (p: string) => {
    if (!p.trim()) return 'Prompt cannot be empty.';
    if (p.trim().length < 10) return 'Prompt must be at least 10 characters long for better results.';
    return '';
  };

  const handleGenerateImage = useCallback(async () => {
    setPromptError('');
    const promptErrMsg = validatePrompt(prompt);
    if (promptErrMsg) {
      setPromptError(promptErrMsg);
      return;
    }

    if (credits === 0) {
      setAlert({
        title: 'Out of Credits',
        message: 'You have no credits left. Please purchase more to generate images.',
        type: 'info',
        onConfirm: () => {
          setAlert(null);
          navigate(APP_ROUTES.CREDITS_PAYMENTS);
        },
        confirmText: 'Buy Credits',
      });
      return;
    }

    if (credits < numberOfImages) {
        setAlert({
            title: 'Insufficient Credits',
            message: `You only have ${credits} credit(s) but are trying to generate ${numberOfImages} image(s). Please reduce the number of images or purchase more credits.`,
            type: 'warning',
            onConfirm: () => setAlert(null),
        });
        return;
    }

    setLoading(true);
    setGeneratedImages([]); // Clear previous images
    try {
      const imageConfig: ImageConfig = {
        imageSize,
        imageStyle,
        numberOfImages,
        model,
      };

      const generateResponse = await imageService.generateImage(prompt, imageConfig);

      if (generateResponse.success && generateResponse.images) {
        setGeneratedImages(generateResponse.images);
        // Deduct credits based on the number of images generated
        for (let i = 0; i < numberOfImages; i++) {
          await creditsService.deductCredit();
        }
        updateCredits(credits - numberOfImages);
        setAlert({
          title: 'Success!',
          message: `${numberOfImages} image(s) generated successfully. ${numberOfImages} credit(s) deducted.`,
          type: 'success',
          onConfirm: () => setAlert(null),
        });
      } else {
        setAlert({
          title: 'Generation Failed',
          message: generateResponse.message || 'An unknown error occurred during image generation.',
          type: 'error',
          onConfirm: () => setAlert(null),
        });
      }
    } catch (error) {
      setAlert({
        title: 'Generation Error',
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error',
        onConfirm: () => setAlert(null),
      });
    } finally {
      setLoading(false);
    }
  }, [prompt, credits, numberOfImages, imageSize, imageStyle, model, navigate, updateCredits]);

  const handleSaveToGallery = useCallback((image: GeneratedImage) => {
    const success = imageService.saveImageToGallery(image);
    if (success) {
      setGeneratedImages(prev => prev.map(img => img.id === image.id ? { ...img, savedToGallery: true } : img));
      setAlert({
        title: 'Saved!',
        message: 'Image saved to My Gallery.',
        type: 'success',
        onConfirm: () => setAlert(null),
      });
    } else {
      setAlert({
        title: 'Already Saved',
        message: 'This image is already in your gallery.',
        type: 'info',
        onConfirm: () => setAlert(null),
      });
    }
  }, []);

  const handleDownloadImage = useCallback((imageUrl: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `vm-image-generator-${prompt.substring(0, 20).replace(/\s/g, '_')}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const demoImages = useMemo(() => {
    // Generate static demo images for the homepage
    return [
      { id: 'demo-1', prompt: 'A medieval knight riding a dragon, fantasy art', imageUrl: 'https://picsum.photos/600/400?random=11', timestamp: new Date().toISOString(), savedToGallery: false, imageSize: ImageSize.DEFAULT, imageStyle: ImageStyle.FANTASY, model: ModelType.GEMINI_FLASH },
      { id: 'demo-2', prompt: 'A cute robot chef baking a cake, cartoon style, vibrant colors', imageUrl: 'https://picsum.photos/600/400?random=22', timestamp: new Date().toISOString(), savedToGallery: false, imageSize: ImageSize.DEFAULT, imageStyle: ImageStyle.CARTOON, model: ModelType.GEMINI_FLASH },
      { id: 'demo-3', prompt: 'An astronaut planting a flag on Mars, realistic photo, sci-fi', imageUrl: 'https://picsum.photos/600/400?random=33', timestamp: new Date().toISOString(), savedToGallery: false, imageSize: ImageSize.DEFAULT, imageStyle: ImageStyle.REALISTIC, model: ModelType.GEMINI_PRO_IMAGE },
      { id: 'demo-4', prompt: 'A serene mountain landscape with a flowing river, watercolor painting', imageUrl: 'https://picsum.photos/600/400?random=44', timestamp: new Date().toISOString(), savedToGallery: false, imageSize: ImageSize.DEFAULT, imageStyle: ImageStyle.IMPRESSIONISTIC, model: ModelType.GEMINI_FLASH },
      { id: 'demo-5', prompt: 'A majestic lion with a glowing mane, 3D render, cinematic lighting', imageUrl: 'https://picsum.photos/600/400?random=55', timestamp: new Date().toISOString(), savedToGallery: false, imageSize: ImageSize.DEFAULT, imageStyle: ImageStyle['3D'], model: ModelType.GEMINI_PRO_IMAGE },
    ];
  }, []);

  // Effect to handle model and size dependencies
  React.useEffect(() => {
    if (model === ModelType.GEMINI_FLASH && imageSize !== ImageSize.DEFAULT) {
      // If Flash model is selected, reset size to default as it doesn't support K sizes
      setImageSize(ImageSize.DEFAULT);
    }
    // If Pro Image model is selected, ensure size is not 'Default' if it was previously
    // This handles the case where user switches from Flash to Pro Image,
    // we might want to automatically pick a K size or keep previous if valid.
    // For now, let's keep it simple: if Flash is selected, force default size.
    // If Pro Image is selected, allow any size.
  }, [model, imageSize]);

  return (
    <div className="flex flex-col space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 text-center lg:text-left">Image Generator</h1>

      {/* Generation Controls */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Describe Your Image</h2>
        <div className="space-y-4">
          <Input
            id="prompt-input"
            label="Image Prompt"
            type="text"
            placeholder="e.g., A whimsical forest creature in an enchanted forest, vibrant and detailed"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onBlur={() => setPromptError(validatePrompt(prompt))}
            error={promptError}
            className="text-lg py-2"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                AI Model
              </label>
              <select
                id="model-select"
                value={model}
                onChange={(e) => setModel(e.target.value as ModelType)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {MODEL_TYPES.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="size-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image Size
              </label>
              <select
                id="size-select"
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value as ImageSize)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={model === ModelType.GEMINI_FLASH && imageSize !== ImageSize.DEFAULT} // Disable if Flash model and not default size
              >
                {IMAGE_SIZES.map(s => (
                  <option key={s.value} value={s.value} disabled={model === ModelType.GEMINI_FLASH && s.value !== ImageSize.DEFAULT}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="style-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image Style
              </label>
              <select
                id="style-select"
                value={imageStyle}
                onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {IMAGE_STYLES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="num-images-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of Images
              </label>
              <select
                id="num-images-select"
                value={numberOfImages}
                onChange={(e) => setNumberOfImages(parseInt(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {NUMBER_OF_IMAGES_OPTIONS.map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={handleGenerateImage} loading={loading} className="w-full mt-4" size="lg">
            Generate Image ({numberOfImages} credit{numberOfImages > 1 ? 's' : ''})
          </Button>
        </div>
      </section>

      {/* Generated Images Display */}
      {generatedImages.length > 0 && (
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Generated Images</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {generatedImages.map((image) => (
              <div
                key={image.id}
                className="relative group bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
              >
                <img
                  src={image.imageUrl}
                  alt={image.prompt}
                  className="w-full h-48 object-cover object-center"
                  onClick={() => setSelectedImageForEnlarge(image)}
                />
                <div className="p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{image.prompt}</p>
                  <div className="mt-3 flex flex-wrap gap-2 justify-center">
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
                      variant="primary"
                      size="sm"
                      onClick={() => handleSaveToGallery(image)}
                      disabled={image.savedToGallery}
                      className="flex items-center"
                    >
                      {image.savedToGallery ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                          Saved
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                          Save to Gallery
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Demo Images Section */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Explore Demo Images</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          These are sample outputs from our AI image generator, showcasing various styles and capabilities.
          Click on any image to enlarge and view its details.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {demoImages.map((image) => (
            <div
              key={image.id}
              className="relative group bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
            >
              <img
                src={image.imageUrl}
                alt={image.prompt}
                className="w-full h-48 object-cover object-center"
                onClick={() => setSelectedImageForEnlarge(image)}
              />
              <div className="p-4">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{image.prompt}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Style: {image.imageStyle} | Model: {image.model}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

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
              {/* Corrected typo: selectedImageForEnlarged to selectedImageForEnlarge */}
              {!selectedImageForEnlarge.savedToGallery && (
                <Button
                  variant="primary"
                  onClick={() => handleSaveToGallery(selectedImageForEnlarge)}
                  className="flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  Save to Gallery
                </Button>
              )}
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
          confirmText={alert.confirmText}
        />
      )}
    </div>
  );
};

export default ImageGenerationPage;