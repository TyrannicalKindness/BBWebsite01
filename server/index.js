const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const app = express();

app.use(express.static('public'));
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  })
});
const db = admin.firestore();

app.post('/checkout', async (req, res) => {
  try {
    const { items, customer } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'gbp',
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: item.quantity
      })),
      mode: 'payment',
      success_url: 'https://britishbaccy.com/success',
      cancel_url: 'https://britishbaccy.com/checkout.html',
      customer_email: customer.email
    });
    const orderId = `#${Math.floor(1000 + Math.random() * 9000)}`;
    await db.collection('orders').doc(orderId).set({
      items,
      customer,
      trackingNumber: '', // Add Royal Mail tracking manually later
      created: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ id: session.id, orderId });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/orders/:orderId', async (req, res) => {
  try {
    const order = await db.collection('orders').doc(req.params.orderId).get();
    if (!order.exists) return res.status(404).send('Order not found');
    res.json(order.data());
  } catch (error) {
    res.status(500).send(error.message);
  }
});

exports.app = functions.https.onRequest(app);
