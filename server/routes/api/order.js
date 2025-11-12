const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const getServerSession = require('../../middleware/serverSession');

// Initialize Stripe with secret key from environment
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Warning: STRIPE_SECRET_KEY is not set in environment variables');
}
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

/**
 * POST /api/orders/create-payment-intent
 * Create a Stripe payment intent for online payment
 */
router.post('/create-payment-intent', getServerSession, async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.' });
    }

    const { amount, currency = 'usd' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        userId: req.user._id.toString(),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/orders
 * Create a new order
 */
router.post('/', getServerSession, async (req, res, next) => {
  try {
    const {
      items,
      subtotal,
      tax,
      deliveryFee,
      discount = 0,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus = 'Pending',
      transactionId,
      stripePaymentIntentId,
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    // Calculate totals if not provided
    const calculatedSubtotal = subtotal || items.reduce((sum, item) => {
      const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price);
      const quantity = item.quantity || 1;
      return sum + (itemPrice * quantity);
    }, 0);

    const calculatedTax = tax || calculatedSubtotal * 0.05; // 5% tax
    const calculatedDeliveryFee = deliveryFee || (calculatedSubtotal > 50 ? 0 : 5);
    const calculatedTotal = totalAmount || (calculatedSubtotal + calculatedTax + calculatedDeliveryFee - discount);

    // Prepare order items
    const orderItems = items.map(item => ({
      drugId: item.drugId,
      drugName: item.drugName || item.name,
      quantity: item.quantity || 1,
      price: typeof item.price === 'number' ? item.price : parseFloat(item.price),
      subtotal: (typeof item.price === 'number' ? item.price : parseFloat(item.price)) * (item.quantity || 1),
    }));

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      deliveryFee: calculatedDeliveryFee,
      discount: discount,
      total: calculatedTotal,
      price: calculatedTotal, // Keep for backward compatibility
      shippingAddress: {
        fullName: shippingAddress.fullName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
      },
      paymentMethod,
      paymentStatus,
      transactionId,
      stripePaymentIntentId,
      status: 'Pending',
    });

    await order.save();

    // Populate user and drug references
    await order.populate('user', 'name email');
    await order.populate('items.drugId', 'drugName price');

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/orders/confirm-payment
 * Confirm payment and create order after successful Stripe payment
 */
router.post('/confirm-payment', getServerSession, async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.' });
    }

    const {
      paymentIntentId,
      items,
      subtotal,
      tax,
      deliveryFee,
      discount = 0,
      totalAmount,
      shippingAddress,
    } = req.body;

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    // Calculate totals if not provided
    const calculatedSubtotal = subtotal || items.reduce((sum, item) => {
      const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price);
      const quantity = item.quantity || 1;
      return sum + (itemPrice * quantity);
    }, 0);

    const calculatedTax = tax || calculatedSubtotal * 0.05;
    const calculatedDeliveryFee = deliveryFee || (calculatedSubtotal > 50 ? 0 : 5);
    const calculatedTotal = totalAmount || (calculatedSubtotal + calculatedTax + calculatedDeliveryFee - discount);

    // Prepare order items
    const orderItems = items.map(item => ({
      drugId: item.drugId,
      drugName: item.drugName || item.name,
      quantity: item.quantity || 1,
      price: typeof item.price === 'number' ? item.price : parseFloat(item.price),
      subtotal: (typeof item.price === 'number' ? item.price : parseFloat(item.price)) * (item.quantity || 1),
    }));

    // Create order with payment confirmed
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      deliveryFee: calculatedDeliveryFee,
      discount: discount,
      total: calculatedTotal,
      price: calculatedTotal,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
      },
      paymentMethod: 'Online Payment',
      paymentStatus: 'Paid',
      transactionId: paymentIntent.id,
      stripePaymentIntentId: paymentIntentId,
      status: 'Confirmed',
    });

    await order.save();

    // Populate user and drug references
    await order.populate('user', 'name email');
    await order.populate('items.drugId', 'drugName price');

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders
 * Get all orders for the authenticated user
 */
router.get('/', getServerSession, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.drugId', 'drugName price')
      .lean();

    res.json(orders);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders/:id
 * Get a single order by ID
 */
router.get('/:id', getServerSession, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate('items.drugId', 'drugName price')
      .populate('user', 'name email')
      .lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/orders/:id/cancel
 * Cancel an order
 */
router.put('/:id/cancel', getServerSession, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.canCancel()) {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    await order.cancel(req.body.reason || 'Cancelled by user');

    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

