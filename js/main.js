/* Updated main.js with Buy Now buttons, cart button update, and cart modal */

const products = [
  {
    id: 1,
    name: "British Amber Leaf 50G",
    description: "Premium British Amber Leaf tobacco, 50 grams. Smooth and rich flavor.",
    oldPrice: 39.99,
    price: 19.99,
    image: "https://www.bullbrand.co.uk/cdn/shop/products/Amber-leaf-original-50-pouch_f08160a6-3d50-4adc-8bbd-1034bf70092f.jpg?v=1686177424&width=600"
  },
  {
    id: 2,
    name: "Belgium Amber Leaf 50G",
    description: "Fine Belgium Amber Leaf tobacco, 50 grams. Distinctive aroma and taste.",
    oldPrice: 49.99,
    price: 29.99,
    image: "https://www.bullbrand.co.uk/cdn/shop/products/Amber-leaf-original-50-pouch_f08160a6-3d50-4adc-8bbd-1034bf70092f.jpg?v=1686177424&width=600"
  },
  {
    id: 3,
    name: "Rothmans Demi Cigarettes",
    description: "Classic Rothmans Demi cigarettes. Smooth and satisfying.",
    oldPrice: 20.00,
    price: 13.99,
    image: "https://handrollingtobacco.co.uk/wp-content/uploads/2024/02/rothmans-demi-blue-20s-004-1.jpg"
  },
  {
    id: 4,
    name: "BritishBaccy Cigarettes Brand D",
    description: "Premium cigarettes with a rich tobacco blend.",
    oldPrice: 15.00,
    price: 10.00,
    image: "https://static.vecteezy.com/system/resources/thumbnails/021/282/077/small_2x/coming-soon-banner-icon-in-flat-style-promotion-label-illustration-on-isolated-background-open-poster-sign-business-concept-vector.jpg"
  },
  {
    id: 5,
    name: "BritishBaccy Cigarettes Brand E",
    description: "Smooth and flavorful cigarettes for discerning smokers.",
    oldPrice: 15.00,
    price: 10.00,
    image: "https://static.vecteezy.com/system/resources/thumbnails/021/282/077/small_2x/coming-soon-banner-icon-in-flat-style-promotion-label-illustration-on-isolated-background-open-poster-sign-business-concept-vector.jpg"
  },
  {
    id: 6,
    name: "Tester Product",
    description: "This is a tester product for demonstration purposes.",
    oldPrice: 0.60,
    price: 0.50,
    image: "https://www.shutterstock.com/image-vector/tester-not-sale-stamp-on-260nw-2558996789.jpg"
  }
];

// Age verification logic
function verifyAge() {
  const checkbox = document.getElementById('age-check');
  if (checkbox.checked) {
    localStorage.setItem('ageVerified', 'true');
    document.getElementById('age-verification').style.display = 'none';
  } else {
    alert('You must confirm that you are 18 or older to enter this site.');
  }
}

function checkAgeVerification() {
  const ageVerificationElem = document.getElementById('age-verification');
  if (!ageVerificationElem) return;
  if (localStorage.getItem('ageVerified') === 'true') {
    ageVerificationElem.style.display = 'none';
  } else {
    ageVerificationElem.style.display = 'flex';
  }
}

// Cart functionality

function getCart() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId) {
  const cart = getCart();
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const cartItem = cart.find(item => item.id === productId);
  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({ id: productId, name: product.name, price: product.price, quantity: 1 });
  }
  saveCart(cart);
  updateCartDisplay();
  alert(`${product.name} added to cart.`);
}

function buyNow(productId) {
  const cart = [];
  const product = products.find(p => p.id === productId);
  if (!product) return;
  cart.push({ id: productId, name: product.name, price: product.price, quantity: 1 });
  saveCart(cart);
  window.location.href = 'checkout.html';
}

function updateCartDisplay() {
  const cart = getCart();
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartCountElem = document.getElementById('cart-count');
  if (cartCountElem) {
    cartCountElem.textContent = count;
  }
}

// Populate products on index.html and products.html
function populateProducts() {
  const container = document.getElementById('products') || document.getElementById('product-list');
  if (!container) return;
  container.innerHTML = '';
  // Render products once to remove duplicates
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h2>${product.name}</h2>
      <p>${product.description}</p>
      <p><del>£${product.oldPrice.toFixed(2)}</del> <span class="price">£${product.price.toFixed(2)}</span></p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
      <button onclick="buyNow(${product.id})" class="buy-now">Buy Now</button>
    `;
    container.appendChild(productCard);
  });
}

// Tracking form logic
async function handleTracking(event) {
  event.preventDefault();
  const orderIdInput = document.getElementById('order-id');
  const orderId = orderIdInput.value.trim();
  if (!orderId) {
    alert('Please enter an order number.');
    return;
  }
  try {
    const response = await fetch(`/orders/${encodeURIComponent(orderId)}`);
    if (!response.ok) {
      alert('Order not found.');
      return;
    }
    const order = await response.json();
    displayOrderDetails(order);
  } catch (error) {
    alert('Error fetching order details.');
  }
}

function displayOrderDetails(order) {
  const section = document.getElementById('order-details');
  const itemsDiv = document.getElementById('items');
  const trackingNumberSpan = document.getElementById('tracking-number');
  const trackingLink = document.getElementById('tracking-link');

  itemsDiv.innerHTML = '';
  order.items.forEach(item => {
    const itemElem = document.createElement('p');
    itemElem.textContent = `${item.quantity} x ${item.name}`;
    itemsDiv.appendChild(itemElem);
  });

  trackingNumberSpan.textContent = order.trackingNumber || 'Not available';
  trackingLink.href = order.trackingNumber ? `https://www.royalmail.com/track-your-item?tracking-number=${encodeURIComponent(order.trackingNumber)}` : '#';
  section.style.display = 'block';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAgeVerification();
  populateProducts();
  updateCartDisplay();

  const trackingForm = document.getElementById('tracking-form');
  if (trackingForm) {
    trackingForm.addEventListener('submit', handleTracking);
  }

  const cartButton = document.getElementById('cart-btn');
  if (cartButton) {
    cartButton.addEventListener('click', () => {
      window.location.href = 'cart.html';
    });
  }
});
