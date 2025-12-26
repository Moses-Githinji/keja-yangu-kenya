import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
});

// Configure Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "kejayangu_properties", // Folder in Cloudinary
      format: "webp", // Convert to webp for optimization
      transformation: [{ width: 1200, height: 800, crop: "limit" }], // Resize images
      public_id: `${file.fieldname}-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}`, // Unique public ID
    };
  },
});

// Multer upload middleware
export const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Function to delete image from Cloudinary
export const deleteImage = async (imageUrl) => {
  try {
    // Extract public ID from Cloudinary URL
    const publicIdMatch = imageUrl.match(/\/v\d+\/(.+?)\./);
    if (!publicIdMatch || !publicIdMatch[1]) {
      console.warn("Could not extract public ID from URL:", imageUrl);
      return { success: false, message: "Invalid Cloudinary URL" };
    }
    const publicId = publicIdMatch[1];

    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary delete result:", result);
    if (result.result === "ok") {
      return { success: true, message: "Image deleted from Cloudinary" };
    } else {
      throw new Error(result.result);
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
  }
};

// Function to upload a single document (e.g., PDF, DOCX)
export const uploadDocument = multer({
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      return {
        folder: "kejayangu_documents", // Folder for documents
        resource_type: "auto", // Automatically detect resource type
        public_id: `${file.fieldname}-${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}`,
      };
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB file size limit for documents
  },
  fileFilter: (req, file, cb) => {
    // Accept common document types
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(
        new Error("Only PDF, Word, Excel, and text files are allowed!"),
        false
      );
    }
    cb(null, true);
  },
});

// Function to delete a document from Cloudinary
export const deleteDocument = async (documentUrl) => {
  try {
    const publicIdMatch = documentUrl.match(/\/v\d+\/(.+?)\./);
    if (!publicIdMatch || !publicIdMatch[1]) {
      console.warn("Could not extract public ID from URL:", documentUrl);
      return { success: false, message: "Invalid Cloudinary URL" };
    }
    const publicId = publicIdMatch[1];

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });
    console.log("Cloudinary document delete result:", result);
    if (result.result === "ok") {
      return { success: true, message: "Document deleted from Cloudinary" };
    } else {
      throw new Error(result.result);
    }
  } catch (error) {
    console.error("Error deleting document from Cloudinary:", error);
    throw new Error(
      `Failed to delete document from Cloudinary: ${error.message}`
    );
  }
};
