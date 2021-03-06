/**
 * Routes to API endpoints
 */
export const routes = {
	base: () => process.env.REACT_APP_ECOM_API_URL,
	cart: () => new URL('/cart', routes.base()),
	checkout: () => new URL('/cart/checkout', routes.base()),
};

/**
 * Get the cart belonging to the authenticated user
 * @returns Array of cart items belonging to the authenticated user
 * @throws Will throw if network response is not OK
 */
export async function getCart() {
	// Send get request to API endpoint
	const response = await fetch(routes.cart(), {
		credentials: 'include',
	});

	// Throw if response is not OK
	if (!response.ok) {
		throw new Error(`GET ${routes.cart()} response not OK`);
	}

	// Get cart returned by API
	const cart = await response.json();

	// Return cart
	return cart.items;
}

/**
 * Update the cart belonging to the authenticated user
 * @param {object[]} items New cart items
 * @returns Updated cart
 * @throws Will throw if network response is not OK
 */
export async function updateCart(items) {
	// Send put request to API endpoint
	const response = await fetch(routes.cart(), {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ items }),
	});

	// Throw if response is not OK
	if (!response.ok) {
		throw new Error(`PUT ${routes.cart()} response not OK`);
	}

	// Get cart returned by API
	const cart = await response.json();

	// Return updated cart
	return cart.items;
}

/**
 * Checkout the cart belonging to the authenticated user
 * @param {number} addressId ID of the delivery address for the order
 * @param {string} paymentIntentId ID of the Stripe payment intent associated with the order
 * @returns ID of the created order
 * @throws Will throw if network response is not OK
 */
export async function checkoutCart(addressId, paymentIntentId) {
	// Send post request to API endpoint
	const response = await fetch(routes.checkout(), {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			addressId,
			paymentIntentId,
		}),
	});

	// Throw if response is not OK
	if (!response.ok) {
		throw new Error(`POST ${routes.checkout()} response not OK`);
	}

	// Get order ID returned by API
	const { orderId } = await response.json();

	// Return order ID
	return orderId;
}
