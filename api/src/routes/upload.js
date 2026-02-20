// routes/upload.js
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

// Single image upload (avatar, etc.)
router.post(
  "/image",
  authenticateToken,
  uploadImage.single("image"),
  (req, res) => {
    if (!req.file)
      return res
        .status(400)
        .json({ status: "error", message: "No image uploaded" });

    res.json({
      status: "success",
      message: "Image uploaded successfully",
      data: {
        url: req.file.path,
        public_id: req.file.public_id || req.file.filename,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  }
);

// Multiple images for a property – FULLY FIXED
router.post(
  "/property-images/:propertyId",
  authenticateToken,
  uploadImage.array("images", 15),
  async (req, res) => {
    try {
      const { propertyId } = req.params;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "No images uploaded",
        });
      }

      const prisma = getPrismaClient();

      // Verify ownership
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { id: true, ownerId: true, agentId: true },
      });

      if (
        !property ||
        (property.ownerId !== req.user.id && property.agentId !== req.user.id)
      ) {
        return res.status(403).json({
          status: "error",
          message: "Access denied – you do not own this property",
        });
      }

      // Get accurate count of existing images
      const existingImageCount = await prisma.propertyImage.count({
        where: { propertyId },
      });

      const createdImages = [];

      // Process sequentially for reliability
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const isFirstImageOverall =
          existingImageCount + createdImages.length === 0;

        const imageData = {
          url: file.path,
          // Only fields that exist in your schema
          // Removed: caption, publicId
          // Optional: altText if you want
          // altText: `Property image ${i + 1}`,
          isPrimary: isFirstImageOverall && i === 0,
          order: existingImageCount + i,
          propertyId,
        };

        const created = await prisma.propertyImage.create({
          data: imageData,
        });

        createdImages.push(created);
      }

      return res.json({
        status: "success",
        message: `${createdImages.length} images uploaded and saved successfully`,
        data: createdImages,
      });
    } catch (error) {
      console.error("Property image upload error:", error);
      return res.status(500).json({
        status: "error",
        message: "Upload failed",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Single document upload
router.post(
  "/document",
  authenticateToken,
  uploadDocument.single("document"),
  (req, res) => {
    if (!req.file)
      return res
        .status(400)
        .json({ status: "error", message: "No document uploaded" });

    res.json({
      status: "success",
      message: "Document uploaded",
      data: {
        url: req.file.path,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  }
);

// Avatar upload
router.post(
  "/avatar",
  authenticateToken,
  uploadImage.single("avatar"),
  async (req, res) => {
    if (!req.file)
      return res
        .status(400)
        .json({ status: "error", message: "No avatar uploaded" });

    const prisma = getPrismaClient();
    await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: req.file.path },
    });

    res.json({
      status: "success",
      message: "Avatar updated",
      data: { url: req.file.path },
    });
  }
);

// Delete image
router.delete("/image", authenticateToken, async (req, res) => {
  const { url } = req.body;
  if (!url)
    return res.status(400).json({ status: "error", message: "URL required" });

  const result = await deleteImage(url);
  res
    .status(result.success ? 200 : 400)
    .json(
      result.success
        ? { status: "success", message: "Image deleted" }
        : { status: "error", message: result.message }
    );
});

// Delete document
router.delete("/document", authenticateToken, async (req, res) => {
  const { url } = req.body;
  if (!url)
    return res.status(400).json({ status: "error", message: "URL required" });

  const result = await deleteDocument(url);
  res
    .status(result.success ? 200 : 400)
    .json(
      result.success
        ? { status: "success", message: "Document deleted" }
        : { status: "error", message: result.message }
    );
});

export default router;
