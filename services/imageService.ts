// services/imageService.ts
import { ImageConfig, GeneratedImage, ImageSize, ModelType } from '../types';
// CRITICAL: In a real production application, you would NOT directly import or use
// @google/genai in the frontend. Instead, you would send the user's prompt and
// configuration to a secure backend endpoint. The backend would then use the
// process.env.API_KEY to call the Google Gemini API. This prevents exposing
// your API key to the client-side.
// The following import is included for type definitions and to illustrate
// the API interaction, but the actual logic is simulated.
// import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

interface ImageGenerationResponse {
  success: boolean;
  message: string;
  images?: GeneratedImage[];
}

const STORAGE_KEY_GALLERY_IMAGES = 'vm_image_generator_gallery_images';
const simulateDelay = (ms = 2000) => new Promise(resolve => setTimeout(resolve, ms));

export const imageService = {
  async generateImage(prompt: string, config: ImageConfig): Promise<ImageGenerationResponse> {
    await simulateDelay(); // Simulate network latency

    // --- MOCK BACKEND LOGIC STARTS HERE ---
    // In a real application, this is where your frontend would make an
    // HTTP request to your backend server.
    // Example:
    // const response = await fetch('/api/generate-image', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ prompt, config, userId: currentUser.id }), // Include user ID if using a real backend
    // });
    // const data = await response.json();
    // if (!response.ok) throw new Error(data.message || 'Image generation failed');
    // return { success: true, message: 'Images generated successfully!', images: data.images };


    // For this frontend-only demo, we simulate the backend's response:
    try {
      if (!prompt || prompt.length < 5) {
        return { success: false, message: 'Please provide a more descriptive prompt (min 5 characters).' };
      }

      const generatedImages: GeneratedImage[] = [];
      const imageUrlBase = 'https://picsum.photos';
      let width, height;

      // Determine dimensions based on ImageSize
      switch (config.imageSize) {
        case ImageSize['1K']:
          width = 1024; height = 1024; break;
        case ImageSize['2K']:
          width = 2048; height = 2048; break;
        case ImageSize['4K']:
          width = 4096; height = 4096; break;
        case ImageSize.DEFAULT:
        default:
          width = 768; height = 768; break; // A reasonable default for general purpose
      }

      for (let i = 0; i < config.numberOfImages; i++) {
        // Mock image URL from Lorem Picsum
        const imageUrl = `${imageUrlBase}/${width}/${height}?random=${Date.now() + i}`;

        generatedImages.push({
          id: `img-${Date.now()}-${i}`,
          prompt,
          imageUrl,
          timestamp: new Date().toISOString(),
          savedToGallery: false,
          imageSize: config.imageSize,
          imageStyle: config.imageStyle,
          model: config.model,
        });
      }

      return { success: true, message: 'Images generated successfully!', images: generatedImages };

    } catch (error) {
      console.error('Mock image generation error:', error);
      return { success: false, message: `An error occurred during image generation: ${error instanceof Error ? error.message : String(error)}` };
    }
    // --- MOCK BACKEND LOGIC ENDS HERE ---

    /*
    // Example of how the backend would use @google/genai (pseudo-code):
    // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // const modelName = config.model;
    // const imageConfig: any = {};
    // if (config.imageSize !== ImageSize.DEFAULT && modelName === ModelType.GEMINI_PRO_IMAGE) {
    //   imageConfig.imageSize = config.imageSize; // e.g., "1K", "2K", "4K"
    // }
    // if (modelName === ModelType.GEMINI_PRO_IMAGE && config.imageSize !== ImageSize.DEFAULT) {
    //   // Only apply aspectRatio if imageSize is specified for PRO_IMAGE
    //   // Note: Gemini API often defaults to 1:1, but can be specified.
    //   imageConfig.aspectRatio = "1:1"; // Assuming square for simplicity
    // }

    // let fullPrompt = prompt;
    // if (config.imageStyle !== ImageStyle.DEFAULT) {
    //   fullPrompt = `${config.imageStyle} style: ${prompt}`;
    // }

    // const response = await ai.models.generateContent({
    //   model: modelName,
    //   contents: [{ parts: [{ text: fullPrompt }] }],
    //   config: {
    //     imageConfig: imageConfig,
    //     // tools: [{ google_search: {} }], // Optional for Gemini Pro Image
    //   },
    // });

    // const generatedImagesData: GeneratedImage[] = [];
    // if (response.candidates && response.candidates.length > 0) {
    //   for (const candidate of response.candidates) {
    //     for (const part of candidate.content.parts) {
    //       if (part.inlineData) {
    //         const base64EncodeString: string = part.inlineData.data;
    //         const imageUrl = `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
    //         generatedImagesData.push({
    //           id: `img-${Date.now()}-${generatedImagesData.length}`,
    //           prompt,
    //           imageUrl,
    //           timestamp: new Date().toISOString(),
    //           savedToGallery: false,
    //           imageSize: config.imageSize,
    //           imageStyle: config.imageStyle,
    //           model: config.model,
    //         });
    //       } else if (part.text) {
    //         console.log("Gemini response text:", part.text); // Model might include text feedback
    //       }
    //     }
    //   }
    // }
    // return { success: true, message: 'Images generated successfully!', images: generatedImagesData };
    */
  },

  getGalleryImages(): GeneratedImage[] {
    const imagesJson = localStorage.getItem(STORAGE_KEY_GALLERY_IMAGES);
    return imagesJson ? JSON.parse(imagesJson) as GeneratedImage[] : [];
  },

  saveImageToGallery(image: GeneratedImage): boolean {
    const currentImages = this.getGalleryImages();
    if (currentImages.find(img => img.id === image.id)) {
      return false; // Image already in gallery
    }
    const updatedImages = [...currentImages, { ...image, savedToGallery: true }];
    localStorage.setItem(STORAGE_KEY_GALLERY_IMAGES, JSON.stringify(updatedImages));
    return true;
  },

  deleteImageFromGallery(id: string): boolean {
    const currentImages = this.getGalleryImages();
    const updatedImages = currentImages.filter(img => img.id !== id);
    if (updatedImages.length < currentImages.length) {
      localStorage.setItem(STORAGE_KEY_GALLERY_IMAGES, JSON.stringify(updatedImages));
      return true;
    }
    return false; // Image not found
  },

  // Add initial demo images to gallery if not present
  initializeDemoImages(): void {
    const currentImages = this.getGalleryImages();
    if (currentImages.length === 0) {
      const demoPrompts = [
        'A futuristic cityscape at sunset, highly detailed',
        'A whimsical forest creature with glowing eyes, cartoon style',
        'An ancient warrior standing on a mountain peak, realistic',
        'A detailed 3D render of a cozy living room',
        'Abstract art featuring geometric shapes and vibrant colors',
      ];

      const demoImages: GeneratedImage[] = demoPrompts.map((prompt, index) => ({
        id: `demo-img-${index}`,
        prompt,
        imageUrl: `https://picsum.photos/600/400?random=${index}`, // Different random images
        timestamp: new Date().toISOString(),
        savedToGallery: true,
        imageSize: ImageSize.DEFAULT,
        imageStyle: index % 2 === 0 ? ImageStyle.REALISTIC : ImageStyle.CARTOON,
        model: ModelType.GEMINI_FLASH,
      }));
      localStorage.setItem(STORAGE_KEY_GALLERY_IMAGES, JSON.stringify(demoImages));
    }
  }
};
