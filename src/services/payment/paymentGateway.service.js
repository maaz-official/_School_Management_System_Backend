import Stripe from 'stripe';
import { PayPal } from '@paypal/checkout-server-sdk';
import Razorpay from 'razorpay';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';

export class PaymentGatewayService {
  static stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  static razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
  });

  static async createPaymentIntent(amount, currency, method, metadata = {}) {
    try {
      switch (method) {
        case 'STRIPE':
          return await this.createStripePayment(amount, currency, metadata);
        case 'PAYPAL':
          return await this.createPayPalPayment(amount, currency, metadata);
        case 'RAZORPAY':
          return await this.createRazorpayPayment(amount, currency, metadata);
        default:
          throw new AppError('Unsupported payment method', 400);
      }
    } catch (error) {
      logger.error('Payment intent creation failed:', error);
      throw new AppError('Payment processing failed', 500);
    }
  }

  static async createStripePayment(amount, currency, metadata) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata,
      payment_method_types: ['card'],
      capture_method: 'automatic'
    });

    return {
      provider: 'STRIPE',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  }

  static async createRazorpayPayment(amount, currency, metadata) {
    const order = await this.razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: currency,
      receipt: `rcpt_${Date.now()}`,
      notes: metadata
    });

    return {
      provider: 'RAZORPAY',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    };
  }

  static async verifyPayment(provider, paymentData) {
    try {
      switch (provider) {
        case 'STRIPE':
          return await this.verifyStripePayment(paymentData);
        case 'PAYPAL':
          return await this.verifyPayPalPayment(paymentData);
        case 'RAZORPAY':
          return await this.verifyRazorpayPayment(paymentData);
        default:
          throw new AppError('Unsupported payment provider', 400);
      }
    } catch (error) {
      logger.error('Payment verification failed:', error);
      throw new AppError('Payment verification failed', 500);
    }
  }

  static async verifyStripePayment(paymentData) {
    const { paymentIntentId } = paymentData;
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new AppError('Payment not successful', 400);
    }

    return {
      success: true,
      transactionId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata
    };
  }

  static async verifyRazorpayPayment(paymentData) {
    const { orderId, paymentId, signature } = paymentData;
    
    const isValid = this.razorpay.validateWebhookSignature(
      orderId + '|' + paymentId,
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isValid) {
      throw new AppError('Invalid payment signature', 400);
    }

    return {
      success: true,
      transactionId: paymentId,
      orderId
    };
  }
}