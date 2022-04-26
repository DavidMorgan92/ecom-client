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
	categories: () => new URL('/products/categories', routes.base()),
	getOne: id => new URL(`/products/${id}`, routes.base()),
};

/**
 * Get a list of products matching the search criteria
 * @param {string} category Product category to search
 * @param {string} name Product name to search
 * @returns List of products which match the search criteria
 * @throws Will throw if network response is not OK
 */
export async function getProducts(category, name) {
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

/**
 * Get a list of product categories
 * @returns List of product categories sorted alphabetically
 * @throws Will throw if network response is not OK
 */
export async function getCategories() {
	// Send categories request to API endpoint
	const response = await fetch(routes.categories());

	// Throw if response is not OK
	if (!response.ok) {
		throw new Error(`GET ${routes.categories()} response not OK`);
	}

	// Get categories returned by API
	const categories = await response.json();

	// Return categories
	return categories;
}

/**
 * Get a product by its ID
 * @param {number} id ID of the product to get from the API
 * @returns The product information
 * @throws Will throw if network response is not OK
 */
export async function getProductById(id) {
	// Get product from API endpoint
	const response = await fetch(routes.getOne(id));

	// Throw if response is not OK
	if (!response.ok) {
		throw new Error(`GET ${routes.getOne(id)} response not OK`);
	}

	// Get product returned by API
	const product = await response.json();

	// Return product
	return product;
}
