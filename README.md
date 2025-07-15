# Tobacco E-Commerce Website Setup

## Prerequisites
- Install [Node.js](https://nodejs.org/) and npm.
- Create a Firebase project at [firebase.google.com](https://firebase.google.com/) (free tier).
- Enable Firebase Hosting and Firestore Database.
- Obtain Firebase configuration (API keys, project ID, etc.).
- Create a Stripe account at [stripe.com](https://stripe.com/).
- Obtain Stripe Publishable and Secret API keys (test mode for development).
- Purchase a custom domain (optional).

## Installation

1. Open a terminal and navigate to the `server/` folder:
   ```
   cd tobacco-ecommerce/server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the `server/` folder with the following content (replace placeholders with your actual keys):
   ```
   STRIPE_SECRET_KEY=your_stripe_secret_key
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY="your_firebase_private_key"
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   ```

## Running Locally

- Start the server:
  ```
  npm start
  ```

- Open your browser and navigate to `http://localhost:3000` (or the port your server runs on).

## Firebase Deployment

1. Install Firebase CLI globally if not already installed:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase in the project root (if not done):
   ```
   firebase init
   ```

4. Deploy to Firebase Hosting:
   ```
   firebase deploy
   ```

## Custom Domain Setup

- In Firebase Hosting console, add your custom domain (e.g., yourdomain.com).
- Update DNS settings at your domain registrar with Firebase’s provided A records.

## Stripe Tobacco Compliance

- Submit required tobacco sales compliance documentation via Stripe Dashboard.
- Use Stripe test cards (e.g., 4242 4242 4242 4242) for testing payments.

## Order Tracking

- Manually add Royal Mail tracking numbers to Firestore under the `orders` collection for each order.

## Notes

- The website is optimized for mobile and desktop with responsive design.
- Age verification is enforced before accessing the site and at checkout.
- The backend uses Firebase Functions to minimize cold starts.
- Static files are served via Firebase Hosting CDN for fast delivery.

For any issues or questions, contact support@britishbaccy.com.
