const express = require('express');
const router = express.Router();
const Drug = require('../../models/Drug');
const getServerSession = require('../../middleware/serverSession');
const requireAdmin = require('../../middleware/adminAuth');

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
      images: images || [],
      isActive: true
    });

    await drug.save();

    res.status(201).json({
      message: 'Drug created successfully',
      drug
    });
  } catch (err) {
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
    if (images !== undefined) drug.images = images;
    if (isActive !== undefined) drug.isActive = isActive;

    await drug.save();

    res.json({
      message: 'Drug updated successfully',
      drug
    });
  } catch (err) {
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

