/**
 * Routes to API endpoints
 */
export const routes = {
	base: () => process.env.REACT_APP_ECOM_API_URL,
	get: () => new URL('/orders', routes.base()),
	getOne: id => new URL(`/orders/${id}`, routes.base()),
};

/**
 * Get the orders belonging to the authorized user
 * @returns List of orders
 * @throws Will throw if network response is not OK
 */
export async function getOrders() {
	// Send orders request to API endpoint
	const response = await fetch(routes.get(), {
		credentials: 'include',
	});

	// Throw if response is not OK
	if (!response.ok) {
		throw new Error(`GET ${routes.get()} response not OK`);
	}

	// Get orders returned by API
	const orders = await response.json();

	// Return orders
	return orders;
}

/**
 * Get one order belonging to the authorized user by its ID
 * @param {number} id ID of the order to get
 * @returns Order object
 * @throws Will throw if network response is not OK
 */
export async function getOrderById(id) {
	// Send order request to API endpoint
	const response = await fetch(routes.getOne(id), {
		credentials: 'include'
	});

	// Throw if response is not OK
	if (!response.ok) {
		throw new Error(`GET ${routes.getOne(id)} response not OK`);
	}

	// Get order returned by API
	const order = await response.json();

	// Return order
	return order;
}
