import { Request, Response } from 'express';
import Cart from '../models/cart.model';
import Product from '../models/product.model';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';
import sendResponse from '../utils/sendResponse';

const calcTotal = (items: { quantity: number; price: number }[]) =>
  items.reduce((sum, item) => sum + item.quantity * item.price, 0);

// GET /api/v1/cart
const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await Cart.findOne({ userId: req.user!.id }).populate(
    'items.productId',
    'title images price stock brand'
  );

  if (!cart) {
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Cart is empty',
      data: { items: [], totalAmount: 0 },
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Cart retrieved successfully',
    data: cart,
  });
});

// POST /api/v1/cart  { productId, quantity }
const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);
  if (product.stock < quantity) throw new AppError('Insufficient stock', 400);

  let cart = await Cart.findOne({ userId: req.user!.id });

  if (!cart) {
    cart = await Cart.create({
      userId: req.user!.id,
      items: [{ productId, quantity, price: product.price }],
      totalAmount: product.price * quantity,
    });
  } else {
    const existingIndex = cart.items.findIndex(
      (item) => String(item.productId) === String(productId)
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, price: product.price });
    }
    cart.totalAmount = calcTotal(cart.items);
    await cart.save();
  }

  await cart.populate('items.productId', 'title images price stock brand');

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Item added to cart',
    data: cart,
  });
});

// PATCH /api/v1/cart/:itemId  { quantity }
const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) throw new AppError('Quantity must be at least 1', 400);

  const cart = await Cart.findOne({ userId: req.user!.id });
  if (!cart) throw new AppError('Cart not found', 404);

  const item = cart.items.find((i) => String((i as any)._id) === req.params.itemId);
  if (!item) throw new AppError('Cart item not found', 404);

  const product = await Product.findById(item.productId);
  if (product && product.stock < quantity) throw new AppError('Insufficient stock', 400);

  item.quantity = quantity;
  cart.totalAmount = calcTotal(cart.items);
  await cart.save();
  await cart.populate('items.productId', 'title images price stock brand');

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Cart updated',
    data: cart,
  });
});

// DELETE /api/v1/cart/:itemId
const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await Cart.findOne({ userId: req.user!.id });
  if (!cart) throw new AppError('Cart not found', 404);

  const initialLength = cart.items.length;
  cart.items = cart.items.filter((i) => String((i as any)._id) !== req.params.itemId) as any;

  if (cart.items.length === initialLength) throw new AppError('Cart item not found', 404);

  cart.totalAmount = calcTotal(cart.items);
  await cart.save();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Item removed from cart',
    data: cart,
  });
});

// DELETE /api/v1/cart
const clearCart = asyncHandler(async (req: Request, res: Response) => {
  await Cart.findOneAndUpdate(
    { userId: req.user!.id },
    { items: [], totalAmount: 0 }
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Cart cleared',
  });
});

export const cartControllers = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
