import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  uploadImage,
  uploadDocument,
  deleteImage,
  deleteDocument,
} from "../utils/upload.js";
import { getPrismaClient } from "../config/database.js";

const router = express.Router();

// @route   POST /api/v1/upload/image
// @desc    Upload a single image
// @access  Private
router.post(
  "/image",
  authenticateToken,
  uploadImage.single("image"),
  async (req, res, next) => {
    try {
      console.log("Upload request received");
      console.log("File info:", {
        fieldname: req.file?.fieldname,
        originalname: req.file?.originalname,
        mimetype: req.file?.mimetype,
        size: req.file?.size,
      });

      if (!req.file) {
        console.error("No file in request");
        return res.status(400).json({
          status: "error",
          message: "No image file uploaded",
        });
      }

      console.log("Cloudinary upload successful");
      console.log("File path (URL):", req.file.path);
      console.log("File filename:", req.file.filename);
      console.log("File public_id:", req.file.public_id);

      const responseData = {
        status: "success",
        message: "Image uploaded successfully",
        data: {
          url: req.file.path,
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size,
          public_id: req.file.public_id,
        },
      };

      console.log("Sending response:", responseData);
      res.status(200).json(responseData);
    } catch (error) {
      console.error("Upload error:", error);
      next(error);
    }
  }
);

// @route   POST /api/v1/upload/images
// @desc    Upload multiple images
// @access  Private
router.post(
  "/images",
  authenticateToken,
  uploadImage.array("images", 10),
  async (req, res, next) => {
    try {
      console.log("Multiple upload request received");
      console.log("Number of files:", req.files?.length || 0);

      if (!req.files || req.files.length === 0) {
        console.error("No files in request");
        return res.status(400).json({
          status: "error",
          message: "No image files uploaded",
        });
      }

      const uploadedImages = req.files.map((file, index) => {
        console.log(`Processing file ${index + 1}:`, {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          filename: file.filename,
          public_id: file.public_id,
        });

        return {
          url: file.path,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          public_id: file.public_id,
        };
      });

      console.log("All files processed successfully");
      console.log("Final uploadedImages array:", uploadedImages);

      const responseData = {
        status: "success",
        message: `${uploadedImages.length} images uploaded successfully`,
        data: uploadedImages,
      };

      console.log("Sending multiple upload response:", responseData);
      res.status(200).json(responseData);
    } catch (error) {
      console.error("Multiple upload error:", error);
      next(error);
    }
  }
);

// @route   POST /api/v1/upload/document
// @desc    Upload a single document
// @access  Private
router.post(
  "/document",
  authenticateToken,
  uploadDocument.single("document"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "No document file uploaded",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Document uploaded successfully",
        data: {
          url: req.file.path,
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/v1/upload/documents
// @desc    Upload multiple documents
// @access  Private
router.post(
  "/documents",
  authenticateToken,
  uploadDocument.array("documents", 5),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "No document files uploaded",
        });
      }

      const uploadedDocuments = req.files.map((file) => ({
        url: file.path,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
      }));

      res.status(200).json({
        status: "success",
        message: `${uploadedDocuments.length} documents uploaded successfully`,
        data: uploadedDocuments,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/v1/upload/image
// @desc    Delete an image
// @access  Private
router.delete("/image", authenticateToken, async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        status: "error",
        message: "Image URL is required",
      });
    }

    const result = await deleteImage(url);

    if (result.success) {
      res.status(200).json({
        status: "success",
        message: "Image deleted successfully",
      });
    } else {
      res.status(400).json({
        status: "error",
        message: "Failed to delete image",
        error: result.message,
      });
    }
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/v1/upload/document
// @desc    Delete a document
// @access  Private
router.delete("/document", authenticateToken, async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        status: "error",
        message: "Document URL is required",
      });
    }

    const result = await deleteDocument(url);

    if (result.success) {
      res.status(200).json({
        status: "success",
        message: "Document deleted successfully",
      });
    } else {
      res.status(400).json({
        status: "error",
        message: "Failed to delete document",
        error: result.message,
      });
    }
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/upload/avatar
// @desc    Upload user avatar
// @access  Private
router.post(
  "/avatar",
  authenticateToken,
  uploadImage.single("avatar"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "No avatar file uploaded",
        });
      }

      const prisma = getPrismaClient();

      // Update user avatar in database
      await prisma.user.update({
        where: { id: req.user.id },
        data: { avatar: req.file.path },
      });

      res.status(200).json({
        status: "success",
        message: "Avatar uploaded successfully",
        data: {
          url: req.file.path,
          filename: req.file.filename,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/v1/upload/property-images
// @desc    Upload images for a specific property
// @access  Private
router.post(
  "/property-images/:propertyId",
  authenticateToken,
  uploadImage.array("images", 10),
  async (req, res, next) => {
    try {
      const { propertyId } = req.params;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "No image files uploaded",
        });
      }

      const prisma = getPrismaClient();

      // Check if property exists and user has access
      const property = await prisma.property.findFirst({
        where: {
          id: propertyId,
          OR: [{ ownerId: req.user.id }, { agentId: req.user.id }],
        },
      });

      if (!property) {
        return res.status(404).json({
          status: "error",
          message: "Property not found or access denied",
        });
      }

      // Create property images
      const propertyImages = await Promise.all(
        req.files.map((file, index) =>
          prisma.propertyImage.create({
            data: {
              url: file.path,
              caption: `Property Image ${index + 1}`,
              isPrimary: property.images.length === 0 && index === 0,
              order: property.images.length + index,
              propertyId,
            },
          })
        )
      );

      res.status(200).json({
        status: "success",
        message: `${propertyImages.length} images uploaded successfully`,
        data: propertyImages,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/v1/upload/agent-documents
// @desc    Upload verification documents for agent
// @access  Private
router.post(
  "/agent-documents",
  authenticateToken,
  uploadDocument.array("documents", 5),
  async (req, res, next) => {
    try {
      if (req.user.role !== "AGENT") {
        return res.status(403).json({
          status: "error",
          message: "Only agents can upload verification documents",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "No document files uploaded",
        });
      }

      const prisma = getPrismaClient();

      // Update agent profile with document URLs
      const documentUrls = req.files.map((file) => file.path);

      await prisma.agentProfile.update({
        where: { userId: req.user.id },
        data: {
          verificationDocuments: {
            push: documentUrls,
          },
        },
      });

      res.status(200).json({
        status: "success",
        message: `${documentUrls.length} documents uploaded successfully`,
        data: {
          documents: documentUrls,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
