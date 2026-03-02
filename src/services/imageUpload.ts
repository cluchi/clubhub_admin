import { supabase } from "./supabase";
import imageCompression from "browser-image-compression";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class ImageUploadService {
  private static readonly BUCKET_NAME = "trainers-avatars";
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  /**
   * Initialize the storage bucket if it doesn't exist
   */
  static async initializeBucket(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: existingBuckets, error: listError } =
        await supabase.storage.listBuckets();

      if (listError) {
        console.warn("Failed to list buckets:", listError.message);
        return;
      }

      const bucketExists = existingBuckets?.some(
        (bucket) => bucket.name === this.BUCKET_NAME,
      );

      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(
          this.BUCKET_NAME,
          {
            public: true,
            fileSizeLimit: this.MAX_FILE_SIZE,
            allowedMimeTypes: this.ALLOWED_TYPES,
          },
        );

        if (createError) {
          console.warn("Failed to create bucket:", createError.message);
        } else {
          console.log("Created new bucket:", this.BUCKET_NAME);
        }
      }
    } catch (error) {
      console.warn("Error initializing bucket:", error);
    }
  }

  /**
   * Validate file before processing
   */
  private static validateFile(file: File): string | null {
    if (!file) {
      return "No file selected";
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return "Invalid file type. Please select a JPG, PNG, or WebP image.";
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return "File too large. Please select an image under 5MB.";
    }

    return null;
  }

  /**
   * Compress and resize image to 256x256px
   */
  private static async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 256,
      useWebWorker: true,
      maxIteration: 10,
      fileType: "image/webp",
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.warn("Image compression failed, using original file:", error);
      return file;
    }
  }

  /**
   * Generate unique filename
   */
  private static generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split(".").pop();
    return `trainer-avatar-${timestamp}-${randomString}.${extension || "webp"}`;
  }

  /**
   * Upload image to Supabase storage
   */
  static async uploadImage(file: File): Promise<UploadResult> {
    // Initialize bucket if needed
    await this.initializeBucket();

    // Validate file
    const validationError = this.validateFile(file);
    if (validationError) {
      return { success: false, error: validationError };
    }

    try {
      // Compress image
      const compressedFile = await this.compressImage(file);

      // Generate unique filename
      const fileName = this.generateFileName(file.name);

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, compressedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      return {
        success: true,
        url: publicData.publicUrl,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Delete image from Supabase storage
   */
  static async deleteImage(fileUrl: string): Promise<boolean> {
    try {
      // Extract filename from URL
      const urlParts = fileUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName]);
      return !error;
    } catch (error) {
      console.warn("Failed to delete image:", error);
      return false;
    }
  }

  /**
   * Get public URL for a file
   */
  static getPublicUrl(fileName: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
}
