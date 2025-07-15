// checkout.js - Handles Stripe Elements payment and form submission

document.addEventListener('DOMContentLoaded', () => {
  const stripe = Stripe('pk_live_51Rg3n2FphX9gu7mJKsh3Q4yoA4PyLZXcs4kuUs4KJueDstyGIMZcmGHmuaWXrVzrs9fBRVByOfAEYpjeFbrlDkzI00weWvGWBt'); // Replace with your Stripe publishable key
  const elements = stripe.elements();
  const cardElement = elements.create('card');
  cardElement.mount('#card-element');

  const form = document.getElementById('checkout-form');
  const cardErrors = document.getElementById('card-errors');

  cardElement.on('change', event => {
    if (event.error) {
      cardErrors.textContent = event.error.message;
    } else {
      cardErrors.textContent = '';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!document.getElementById('age-check').checked) {
      alert('You must confirm that you are 18 or older to proceed.');
      return;
    }

    const name = form.name.value.trim();
    const address = form.address.value.trim();
    const email = form.email.value.trim();

    if (!name || !address || !email) {
      alert('Please fill in all required fields.');
      return;
    }

    // Get cart items from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    try {
      // Create payment method
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name,
          email
        }
      });

      if (error) {
        cardErrors.textContent = error.message;
        return;
      }

      // Send checkout data to server
      const response = await fetch('/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method_id: paymentMethod.id,
          items: cart,
          customer: { name, address, email }
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to Stripe Checkout or success page
        window.location.href = `https://checkout.stripe.com/pay/${result.id}`;
      } else {
        alert(result.message || 'Payment failed.');
      }
    } catch (err) {
      alert('Error processing payment.');
      console.error(err);
    }
  });
});
