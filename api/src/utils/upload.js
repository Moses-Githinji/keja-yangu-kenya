// utils/upload.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary once
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Storage for images (properties, avatars, etc.)
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "kejayangu_properties",
    format: async () => "webp",
    transformation: [{ width: 1200, height: 800, crop: "limit" }],
  },
});

// Storage for documents
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "kejayangu_documents",
    resource_type: "auto",
  },
});

// Multer middleware for images
export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Multer middleware for documents
export const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Invalid document type!"), false);
    }
    cb(null, true);
  },
});

// Delete image from Cloudinary
export const deleteImage = async (imageUrl) => {
  try {
    const publicIdMatch = imageUrl.match(/\/v\d+\/(.+?)\.(jpg|jpeg|png|webp)/);
    if (!publicIdMatch) throw new Error("Invalid Cloudinary URL");
    const publicId = publicIdMatch[1];

    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok"
      ? { success: true }
      : { success: false, message: result.result };
  } catch (error) {
    console.error("Delete image error:", error);
    return { success: false, message: error.message };
  }
};

// Delete document from Cloudinary
export const deleteDocument = async (documentUrl) => {
  try {
    const publicIdMatch = documentUrl.match(/\/v\d+\/(.+?)\./);
    if (!publicIdMatch) throw new Error("Invalid Cloudinary URL");
    const publicId = publicIdMatch[1];

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });
    return result.result === "ok"
      ? { success: true }
      : { success: false, message: result.result };
  } catch (error) {
    console.error("Delete document error:", error);
    return { success: false, message: error.message };
  }
};
