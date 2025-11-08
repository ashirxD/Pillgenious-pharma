const express = require('express');
const router = express.Router();
const Drug = require('../../models/Drug');
const requireAuth = require('../../middleware/auth');

/**
 * GET /api/cart
 * Authenticated users only - Get all drugs with status 1 (in cart)
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    // Get all drugs with status 1 (in cart)
    const drugs = await Drug.find({ 
      status: 1,
      isActive: true 
    }).lean();

    // Format response to match cart items structure
    const items = drugs.map(drug => ({
      _id: drug._id,
      id: drug._id,
      drugName: drug.drugName,
      name: drug.drugName,
      type: drug.type,
      category: drug.category,
      price: drug.price,
      quantity: 1, // Default quantity, can be extended later
      stockQuantity: drug.stockQuantity,
      description: drug.description,
      sideEffects: drug.sideEffects,
      prescriptionRequired: drug.prescriptionRequired,
      images: drug.images
    }));

    res.json({ items });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cart/add
 * Authenticated users only - Add drug to cart (change status from 0 to 1)
 */
router.post('/add', requireAuth, async (req, res, next) => {
  try {
    const { drugId, quantity = 1 } = req.body;

    if (!drugId) {
      return res.status(400).json({ error: 'Drug ID is required' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const drug = await Drug.findById(drugId);

    if (!drug || !drug.isActive) {
      return res.status(404).json({ error: 'Drug not found or unavailable' });
    }

    if (drug.status === 1) {
      return res.status(400).json({ error: 'Drug is already in cart' });
    }

    if (drug.stockQuantity < quantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock',
        available: drug.stockQuantity
      });
    }

    // Update drug status to 1 (in cart)
    drug.status = 1;
    await drug.save();

    res.json({
      message: 'Drug added to cart successfully',
      drug: {
        id: drug._id,
        drugName: drug.drugName,
        price: drug.price,
        type: drug.type,
        status: drug.status
      }
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Drug not found' });
    }
    next(err);
  }
});

/**
 * PUT /api/cart/:id
 * Authenticated users only - Update cart item quantity (for future use)
 * Currently just updates the drug, but keeps status as 1
 */
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const drugId = req.params.id;

    if (quantity !== undefined && quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const drug = await Drug.findById(drugId);

    if (!drug || !drug.isActive) {
      return res.status(404).json({ error: 'Drug not found or unavailable' });
    }

    if (drug.status !== 1) {
      return res.status(400).json({ error: 'Drug is not in cart' });
    }

    // For now, we just confirm the drug is in cart
    // Quantity management can be extended later if needed
    res.json({
      message: 'Cart item updated successfully',
      drug: {
        id: drug._id,
        drugName: drug.drugName,
        price: drug.price,
        type: drug.type,
        status: drug.status
      }
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Drug not found' });
    }
    next(err);
  }
});

/**
 * DELETE /api/cart/:id
 * Authenticated users only - Remove drug from cart (change status from 1 to 0)
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const drugId = req.params.id;

    const drug = await Drug.findById(drugId);

    if (!drug) {
      return res.status(404).json({ error: 'Drug not found' });
    }

    if (drug.status !== 1) {
      return res.status(400).json({ error: 'Drug is not in cart' });
    }

    // Update drug status back to 0 (not in cart)
    drug.status = 0;
    await drug.save();

    res.json({
      message: 'Drug removed from cart successfully'
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Drug not found' });
    }
    next(err);
  }
});

module.exports = router;

