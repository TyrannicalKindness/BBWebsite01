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
    privateKey: process.env.FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC8F1GENLTH3f7K\nkpz11KVy4AaYdiAq6K8Ki5cwwiggj+KoU4SPxaL6/ImPEFRAeqUlbV7eWh6NXrlg\n8DZrDMG6f3e99rG7Xws7pg8RVY7Rwu3ekmMZYRU6IWbjoPvVjzm2nXQ/IsKjVyk0\nZeMKJ4luUMO6CvOJm7jHPmHJfks7suXN2KxyxOyJx9C1EPFIWfHiJQtJOf4+zwzA\ncmi+x40X+xYlNGldtTdbm449La7iGMoMCkXJzZ0yfqY8RWux1wmS7RbcvA77V7nr\nEfG9Jz7GeXBvuzc/HBiub7yzQco3y4Wusx3x6UgffM95F9COg3UGhQuIqnwAn9HQ\n8qbS+FKzAgMBAAECggEAE+7+tx2k2Re4VHykQNNX82w1lrvSHeoJ/vqbO9If0Y+e\nLEupnVkLNEFGTNCktS6qSOSl7LetTDsxN0pN4ht4fozawlmeLWbduGUZbLNeDvHz\nJqbp9Lsatk3q6w3ZEqF6stVOCBDlgs0Oc1ym6qEVCglqLNHTTI6hzw/X6jRFwd49\nxAVlFer05bWCtIPR470UYw+zfrGaDlFFCwcB3gxgXROm8tACgyTOqhXRQmtxzM3y\nUlZ2P8+ih58Am/hwFsCauZ88kLThjTDlLibHLmUe2PSk1aHYWXTXn/mGMP2vSBcu\ntYY5spUVxphPzDY8q3AWOzL0X7Ure7F5QaRzs7SQQQKBgQDdvN5iA8/wSAzjxpxv\nrynt0vwg1CZr0RAoZKyckfMPyZbSOVRX7IFBI/5nN1aHEvleBoyFuJGlpaxNr6Xp\niZNuUZ/v2HxnKjDrp9wyMVDl0EajtSB1dtrg6G8eLRZKJpMCvwgjnWe0j1LihR9D\nroOgdNijKtA2NseBcx7wgIOccwKBgQDZJ4K8koYV1JPSaTFRIJ/39udcch/Mvd0j\ntQX9hsYi6ag2fOCzgL7VNuoLdmFK7Qrsjfxfw8MdOnXcFFo2Y0ki1JINYjibJ0qn\nvmkij1idVMu7ooeEfnnBckEwZAG6yn2lk1JTQhEI1wVURCeyURJKSMK9vjxYhH9b\nqMoPn8sgwQKBgQCoPU5J9fSGrlRBWoeFYdUhYmz0h6MjOPvWehRRs5dFSkIJ/X+W\nOpcTkrjLHbykPexAwB1MtG6lzV8/jl8HI+Bd2sbMF2jEacm2c6Vp2+syg2Wlfp9D\nIMwPy6vLrI/18PCoK8OEKkDuSbSstC61jqrGSwG4Q5q5F7Ul7e/ysL+rKwKBgQCc\n314iu/cBbkAbkMJ/yQHHMCaTMh6m2cIXOX7KV8JrFkDem/f3tNonTTRmc251oihy\nG2BmDhW117Ws90b0Y2VCNC4OXRZnf0r/Qx7QSJ3LiqZjNlaP8I4koVVWj+hv+Dgs\nlPC0FNYZfLvs1A+ZUdfUsht81yDhEVav8I+IGfe0AQKBgQCKduD+FsphVccDFb9T\nO9hllD+C/jQ8ffWL2eQifQEDtUWhH1NG9gIswyP4scCvZ+yW4pw8XRdFy3ze0FQz\nV5bAI6ghk5+bTUR3bpCzOjzL+9Tt/oQNND6IZd3KBOwqViaSvy/PNArOZeBCJQkN\nIoPJn3KSLz+9Dymsme9UG9k+Pg==\n-----END PRIVATE KEY-----\n",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  })
});
const db = admin.firestore();

app.post('/checkout', async (req, res) => {
  try {
    const { items, customer, payment_method_id } = req.body;
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
      payment_method: payment_method_id,
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
