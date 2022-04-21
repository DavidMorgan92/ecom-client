/**
 * Routes to API endpoints
 */
export const routes = {
	base: () => process.env.REACT_APP_ECOM_API_URL,
	get: (category, name) => {
		// Base URL
		let url = '/products';

		// Append search params if provided
		const searchParams = new URLSearchParams();
		if (category) searchParams.append('category', category);
		if (name) searchParams.append('name', name);
		if (category || name) url += '?' + searchParams.toString();

		// Return complete URL
		return new URL(url, routes.base());
	},
};

/**
 * Get a list of products matching the search criteria
 * @param {string} category Product category to search
 * @param {string} name Product name to search
 * @returns List of products which match the search criteria
 * @throws Will throw if network response is not OK
 */
export async function getProducts(category, name) {
	// Encode search parameters
	category = encodeURIComponent(category);
	name = encodeURIComponent(name);

	// Send products request to API endpoint
	const response = await fetch(routes.get(category, name));

	// Throw if response is not OK
	if (!response.ok) {
		throw new Error(`GET ${routes.get(category, name)} response not OK`);
	}

	// Get product info returned by API
	const products = await response.json();

	// Return product info
	return products;
}
