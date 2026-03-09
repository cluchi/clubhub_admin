import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Avatar,
  IconButton,
  LinearProgress,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { ImageUploadService } from "../services/imageUpload";
import type { UploadResult } from "../services/imageUpload";

interface ImageUploadProps {
  onImageUpload: (file: File | null, url?: string | null) => void;
  currentImageUrl?: string;
  currentImageName?: string;
  label?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImageUrl,
  currentImageName,
  label = "Upload Trainer Photo",
  maxSize = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Prevent duplicate uploads of the same file
    if (
      uploadedFile &&
      uploadedFile.name === file.name &&
      uploadedFile.size === file.size
    ) {
      return; // File already uploaded
    }

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setUploadError(
        "Invalid file type. Please select a JPG, PNG, or WebP image.",
      );
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(
        `File too large. Please select an image under ${maxSize}MB.`,
      );
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      // Upload to Supabase
      const result: UploadResult = await ImageUploadService.uploadImage(file);

      if (result.success && result.url) {
        onImageUpload(file, result.url);
        setUploadedFile(file); // Track uploaded file
        // Create preview URL for the selected file
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
      } else {
        setUploadError(result.error || "Failed to upload image");
      }
    } catch (error) {
      setUploadError("An error occurred while uploading the image");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      // Delete from Supabase if URL exists
      if (currentImageUrl) {
        await ImageUploadService.deleteImage(currentImageUrl);
      }

      // Clear all local state
      setPreviewUrl(null);
      setUploadError(null);
      setUploadedFile(null);

      // Notify parent component that avatar was deleted (null file and null URL)
      onImageUpload(null, null);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setUploadError("Failed to delete image from storage");
      console.error("Delete error:", error);
    }
  };

  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>

      <Box
        display="flex"
        alignItems="center"
        gap={2}
        p={2}
        border="2px dashed #ccc"
        borderRadius={1}
        sx={{
          backgroundColor: "#f5f5f5",
          "&:hover": {
            borderColor: "#999",
            backgroundColor: "#e8e8e8",
          },
        }}
      >
        {/* Image Preview */}
        <Avatar
          src={displayImageUrl || undefined}
          alt={currentImageName}
          sx={{
            width: 80,
            height: 80,
            fontSize: 24,
            backgroundColor: displayImageUrl ? "transparent" : "#bdbdbd",
          }}
        >
          {!displayImageUrl && (currentImageName || "T")[0]}
        </Avatar>

        {/* Upload Controls */}
        <Box flex={1}>
          <input
            ref={fileInputRef}
            accept={acceptedTypes.join(",")}
            style={{ display: "none" }}
            id="image-upload-input"
            type="file"
            onChange={handleFileSelect}
          />

          <label htmlFor="image-upload-input">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Choose Image"}
            </Button>
          </label>

          {displayImageUrl && (
            <IconButton
              onClick={handleRemoveImage}
              color="error"
              sx={{ ml: 1 }}
              aria-label="remove image"
            >
              <DeleteIcon />
            </IconButton>
          )}

          {isUploading && (
            <Box mt={1}>
              <LinearProgress />
              <Typography variant="caption" color="textSecondary">
                Uploading image...
              </Typography>
            </Box>
          )}

          {uploadError && (
            <Alert
              severity="error"
              sx={{ mt: 1 }}
              onClose={() => setUploadError(null)}
            >
              {uploadError}
            </Alert>
          )}
        </Box>
      </Box>

      <Typography
        variant="caption"
        color="textSecondary"
        sx={{ mt: 1, display: "block" }}
      >
        Supported formats: JPG, PNG, WebP. Maximum size: {maxSize}MB. Images
        will be resized to 256x256px.
      </Typography>
    </Box>
  );
};
