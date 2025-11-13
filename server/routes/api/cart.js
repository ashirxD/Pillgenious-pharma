const express = require('express');
const router = express.Router();
const Drug = require('../../models/Drug');
const CartItem = require('../../models/CartItem');
const getServerSession = require('../../middleware/serverSession');

/**
 * GET /api/cart
 * Authenticated users only - Get all cart items for the current user
 */
router.get('/', getServerSession, async (req, res, next) => {
  try {
    // Get all cart items for the current user with status 1 (in cart)
    const cartItems = await CartItem.find({ 
      user: req.user.id,
      status: 1
    }).populate('drug').lean();

    // Format response to match cart items structure
    const items = cartItems
      .filter(item => item.drug && item.drug.isActive) // Filter out inactive drugs
      .map(item => ({
        _id: item._id,
        id: item._id,
        drugId: item.drug._id,
        drugName: item.drug.drugName,
        name: item.drug.drugName,
        type: item.drug.type,
        category: item.drug.category,
        price: item.drug.price,
        quantity: item.quantity,
        stockQuantity: item.drug.stockQuantity,
        description: item.drug.description,
        sideEffects: item.drug.sideEffects,
        prescriptionRequired: item.drug.prescriptionRequired,
        images: item.drug.images
      }));

    res.json({ items });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cart/add
 * Authenticated users only - Add drug to cart (create CartItem with status 1)
 */
router.post('/add', getServerSession, async (req, res, next) => {
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

    // Check if drug is already in cart
    const existingCartItem = await CartItem.findOne({
      user: req.user.id,
      drug: drugId,
      status: 1
    });

    if (existingCartItem) {
      const updatedQuantity = existingCartItem.quantity + quantity;

      if (drug.stockQuantity < updatedQuantity) {
        return res.status(400).json({
          error: 'Insufficient stock',
          available: drug.stockQuantity,
          currentQuantity: existingCartItem.quantity
        });
      }

      existingCartItem.quantity = updatedQuantity;
      await existingCartItem.save();
      await existingCartItem.populate('drug');

      return res.json({
        message: 'Drug quantity updated in cart successfully',
        drug: {
          id: existingCartItem.drug._id,
          drugName: existingCartItem.drug.drugName,
          price: existingCartItem.drug.price,
          type: existingCartItem.drug.type
        },
        quantity: existingCartItem.quantity
      });
    }

    if (drug.stockQuantity < quantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock',
        available: drug.stockQuantity
      });
    }

    // Create new cart item with status 1 (in cart)
    const cartItem = new CartItem({
      user: req.user.id,
      drug: drugId,
      quantity: quantity,
      status: 1
    });

    await cartItem.save();
    await cartItem.populate('drug');

    res.json({
      message: 'Drug added to cart successfully',
      drug: {
        id: drug._id,
        drugName: drug.drugName,
        price: drug.price,
        type: drug.type
      }
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Drug not found' });
    }
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Drug is already in cart' });
    }
    next(err);
  }
});

/**
 * PUT /api/cart/:id
 * Authenticated users only - Update cart item quantity
 */
router.put('/:id', getServerSession, async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cartItemId = req.params.id;

    if (quantity !== undefined && quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const cartItem = await CartItem.findOne({
      _id: cartItemId,
      user: req.user.id,
      status: 1
    }).populate('drug');

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (!cartItem.drug || !cartItem.drug.isActive) {
      return res.status(404).json({ error: 'Drug not found or unavailable' });
    }

    // Check stock availability if quantity is being updated
    if (quantity !== undefined) {
      if (cartItem.drug.stockQuantity < quantity) {
        return res.status(400).json({ 
          error: 'Insufficient stock',
          available: cartItem.drug.stockQuantity
        });
      }
      cartItem.quantity = quantity;
      await cartItem.save();
    }

    res.json({
      message: 'Cart item updated successfully',
      drug: {
        id: cartItem.drug._id,
        drugName: cartItem.drug.drugName,
        price: cartItem.drug.price,
        type: cartItem.drug.type
      }
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    next(err);
  }
});

/**
 * DELETE /api/cart/:id
 * Authenticated users only - Remove drug from cart (delete CartItem or set status to 0)
 */
router.delete('/:id', getServerSession, async (req, res, next) => {
  try {
    const cartItemId = req.params.id;

    const cartItem = await CartItem.findOne({
      _id: cartItemId,
      user: req.user.id,
      status: 1
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Delete the cart item
    await CartItem.findByIdAndDelete(cartItemId);

    res.json({
      message: 'Drug removed from cart successfully'
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    next(err);
  }
});

module.exports = router;

