import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_CONFIG } from "../config/cloudinary";

export const imageService = {
  async uploadImage(file, userId) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
      formData.append("folder", `posts/${userId}`);

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error uploading image to Cloudinary");
      }

      const data = await response.json();

      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },
};
