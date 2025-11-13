const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Drug = require('../../models/Drug');
const getServerSession = require('../../middleware/serverSession');
const requireAdmin = require('../../middleware/adminAuth');
const { processImageForDrugs } = require('../../utils/searchDrugAi');

const uploadDirectory = path.join(__dirname, '../../uploads/tmp');

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdir(uploadDirectory, { recursive: true }, (err) => {
      cb(err, uploadDirectory);
    });
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).slice(2, 8);
    const ext = path.extname(file.originalname || '') || '.png';
    cb(null, `${timestamp}-${randomPart}${ext}`);
  }
});

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
]);

const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

const upload = multer({
  storage: imageStorage,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload a JPG, PNG, or WEBP image.'));
    }
  }
});

const escapeRegex = (text = '') =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeImages = (images) => {
  if (!images) return [];

  if (typeof images === 'string') {
    return images ? [images] : [];
  }

  if (Array.isArray(images)) {
    return images.filter(Boolean);
  }

  return [];
};

const isBase64Image = (value = '') =>
  typeof value === 'string' && value.startsWith('data:image');

const getBase64Size = (dataUrl = '') => {
  try {
    const [, base64 = ''] = dataUrl.split(',');
    if (!base64) return 0;
    return Buffer.from(base64, 'base64').length;
  } catch (err) {
    return 0;
  }
};

const validateImageSizes = (images = []) => {
  const oversized = images.find(
    (img) => isBase64Image(img) && getBase64Size(img) > MAX_IMAGE_SIZE_BYTES
  );

  if (oversized) {
    const error = new Error('Image size must be 4MB or smaller.');
    error.statusCode = 400;
    throw error;
  }
};

const handleImageUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image size must be 4MB or smaller.' });
      }
      if (err.message && err.message.includes('Unsupported file type')) {
        return res.status(400).json({ error: err.message });
      }
      return next(err);
    }
    next();
  });
};

/**
 * POST /api/drugs/search-image
 * Upload an image, run OCR and search for matching drugs
 */
router.post('/search-image', handleImageUpload, async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }

  const imagePath = req.file.path;

  try {
    const { rawText, keywords } = await processImageForDrugs(imagePath);

    if (!rawText.trim()) {
      return res.status(200).json({
        rawText: '',
        keywords: [],
        drugs: [],
        message: 'No readable text detected in the uploaded image.'
      });
    }

    let drugs = [];

    if (keywords.length) {
      const textSearch = keywords.slice(0, 3).join(' ');

      try {
        drugs = await Drug.find(
          {
            isActive: true,
            $text: { $search: textSearch }
          },
          {
            score: { $meta: 'textScore' }
          }
        )
          .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
          .limit(20)
          .lean();
      } catch (err) {
        console.error('Text search failed, falling back to regex:', err.message);
      }

      if (!drugs.length) {
        const regexes = keywords.map((keyword) => new RegExp(escapeRegex(keyword), 'i'));

        drugs = await Drug.find({
          isActive: true,
          $or: [
            { drugName: { $in: regexes } },
            { description: { $in: regexes } }
          ]
        })
          .limit(20)
          .lean();
      }
    }

    res.json({
      rawText,
      keywords,
      drugs
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message && error.message.includes('Unsupported file type')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  } finally {
    fs.promises.unlink(imagePath).catch(() => {});
  }
});

/**
 * GET /api/drugs
 * Public route - Get all drugs with optional filtering and search
 * Query params: category, type, search, minPrice, maxPrice, page, limit
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      category,
      type,
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query - only show active drugs
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (type) {
      query.type = type;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Text search on drugName and description
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // If text search, add text score to sort
    if (search) {
      sort.score = { $meta: 'textScore' };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const drugs = await Drug.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Get total count for pagination
    const total = await Drug.countDocuments(query);

    res.json({
      drugs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/drugs/:id
 * Public route - Get a single drug by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const drug = await Drug.findById(req.params.id);
    
    if (!drug) {
      return res.status(404).json({ error: 'Drug not found' });
    }

    res.json(drug);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Drug not found' });
    }
    next(err);
  }
});

/**
 * POST /api/drugs
 * Admin only - Create a new drug
 */
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const {
      drugName,
      sideEffects,
      type,
      price,
      category,
      description,
      stockQuantity,
      prescriptionRequired,
      images
    } = req.body;

    // Validation
    if (!drugName || !price) {
      return res.status(400).json({ error: 'Drug name and price are required' });
    }

    if (price < 0) {
      return res.status(400).json({ error: 'Price must be non-negative' });
    }

    // Create drug
    const drug = new Drug({
      drugName,
      sideEffects: sideEffects || [],
      type: type || 'Tablet',
      price,
      category,
      description,
      stockQuantity: stockQuantity || 0,
      prescriptionRequired: prescriptionRequired || false,
      images: (() => {
        const formattedImages = normalizeImages(images);
        validateImageSizes(formattedImages);
        return formattedImages;
      })(),
      isActive: true
    });

    await drug.save();

    res.status(201).json({
      message: 'Drug created successfully',
      drug
    });
  } catch (err) {
    if (err.statusCode === 400) {
      return res.status(400).json({ error: err.message });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

/**
 * PUT /api/drugs/:id
 * Admin only - Update a drug
 */
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const drug = await Drug.findById(req.params.id);

    if (!drug) {
      return res.status(404).json({ error: 'Drug not found' });
    }

    // Update fields
    const {
      drugName,
      sideEffects,
      type,
      price,
      category,
      description,
      stockQuantity,
      prescriptionRequired,
      images,
      isActive
    } = req.body;

    if (drugName !== undefined) drug.drugName = drugName;
    if (sideEffects !== undefined) drug.sideEffects = sideEffects;
    if (type !== undefined) drug.type = type;
    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({ error: 'Price must be non-negative' });
      }
      drug.price = price;
    }
    if (category !== undefined) drug.category = category;
    if (description !== undefined) drug.description = description;
    if (stockQuantity !== undefined) {
      if (stockQuantity < 0) {
        return res.status(400).json({ error: 'Stock quantity must be non-negative' });
      }
      drug.stockQuantity = stockQuantity;
    }
    if (prescriptionRequired !== undefined) drug.prescriptionRequired = prescriptionRequired;
    if (images !== undefined) {
      const formattedImages = normalizeImages(images);
      validateImageSizes(formattedImages);
      drug.images = formattedImages;
    }
    if (isActive !== undefined) drug.isActive = isActive;

    await drug.save();

    res.json({
      message: 'Drug updated successfully',
      drug
    });
  } catch (err) {
    if (err.statusCode === 400) {
      return res.status(400).json({ error: err.message });
    }
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Drug not found' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

/**
 * DELETE /api/drugs/:id
 * Admin only - Delete a drug (soft delete by setting isActive to false)
 */
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const drug = await Drug.findById(req.params.id);

    if (!drug) {
      return res.status(404).json({ error: 'Drug not found' });
    }

    // Soft delete - set isActive to false
    drug.isActive = false;
    await drug.save();

    res.json({
      message: 'Drug deleted successfully'
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Drug not found' });
    }
    next(err);
  }
});

/**
 * POST /api/drugs/:id/buy
 * Authenticated users only - Purchase a drug (add to cart or create order)
 * This is a simplified purchase endpoint - you can extend it to integrate with your cart/order system
 */
router.post('/:id/buy', getServerSession, async (req, res, next) => {
  try {
    const { quantity = 1 } = req.body;
    const drugId = req.params.id;

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const drug = await Drug.findById(drugId);

    if (!drug || !drug.isActive) {
      return res.status(404).json({ error: 'Drug not found or unavailable' });
    }

    if (drug.stockQuantity < quantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock',
        available: drug.stockQuantity
      });
    }

    // Check if prescription is required
    if (drug.prescriptionRequired) {
      // You can add prescription validation here if needed
      // For now, we'll just return a warning
    }

    // Calculate total price
    const totalPrice = drug.price * quantity;

    // Return purchase information
    // In a real implementation, you would:
    // 1. Add to cart, or
    // 2. Create an order directly, or
    // 3. Return cart item data for frontend to handle
    res.json({
      message: 'Drug added to purchase',
      drug: {
        id: drug._id,
        drugName: drug.drugName,
        price: drug.price,
        type: drug.type
      },
      quantity,
      totalPrice,
      // You can return cart item data here for frontend integration
      cartItem: {
        drugId: drug._id,
        drugName: drug.drugName,
        price: drug.price,
        quantity,
        totalPrice
      }
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Drug not found' });
    }
    next(err);
  }
});

module.exports = router;

