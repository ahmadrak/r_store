const stripe = require("../config/stripe");
const Cart = require("../models/cart.model");

const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await Cart.getCartItems(userId);

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (cartItems.some(item => !Number.isSafeInteger(item.quantity) || item.quantity <= 0 || item.quantity > item.stock || !Number.isFinite(Number(item.price)) || Number(item.price) <= 0)) {
      return res.status(409).json({ message: "Cart contains unavailable items" });
    }
    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          ...(item.image_url ? { images: [item.image_url] } : {}),
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        user_id: userId,
      },
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error("Checkout session failed", err);
    res.status(500).json({ message: "Unable to start checkout" });
  }
};

module.exports = { createCheckoutSession };
