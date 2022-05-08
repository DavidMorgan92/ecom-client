/**
 * Routes to API endpoints
 */
export const routes = {
	base: () => process.env.REACT_APP_ECOM_API_URL,
	addresses: () => new URL('/addresses', routes.base()),
	addressById: id => new URL(`/addresses/${id}`, routes.base()),
};

/**
 * Get all addresses belonging to the authenticated user
 * @returns Array of addresses belonging to the authenticated user
 * @throws Will throw if network response is not OK
 */
export async function getAddresses() {
	// Send get request to API endpoint
	const response = await fetch(routes.addresses(), {
		credentials: 'include',
	});

	// Throw if response is not OK
	if (!response.ok) {
		throw new Error(`GET ${routes.addresses()} response not OK`);
	}

	// Get addresses returned by API
	const addresses = await response.json();

	// Return addresses
	return addresses;
}

/**
 * Create a new address belonging to the authenticated user
 * @param {string} houseNameNumber House name/number
 * @param {string} streetName Street name
 * @param {string} townCityName Town/City name
 * @param {string} postCode Post code
 * @returns Address object
 * @throws Will throw if network response is not OK
 */
export async function createAddress(
	houseNameNumber,
	streetName,
	townCityName,
	postCode,
) {
	// Send post request to API endpoint
	const response = await fetch(routes.addresses(), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({
			houseNameNumber,
			streetName,
			townCityName,
			postCode,
		}),
	});

	// Throw if response is not OK
	if (!response.ok) {
		throw new Error(`POST ${routes.addresses()} response not OK`);
	}

	// Get address returned by API
	const address = await response.json();

	// Return address
	return address;
}

/**
 * Update an address belonging to the authenticated user
 * @param {number} id ID of the address to update
 * @param {string} houseNameNumber House name/number
 * @param {string} streetName Street name
 * @param {string} townCityName Town/City name
 * @param {string} postCode Post code
 * @returns Address object
 * @throws Will throw if network response is not OK
 */
export async function updateAddress(
	id,
	houseNameNumber,
	streetName,
	townCityName,
	postCode,
) {
	// Send put request to API endpoint
	const response = await fetch(routes.addressById(id), {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({
			houseNameNumber,
			streetName,
			townCityName,
			postCode,
		}),
	});

	// Throw if response is not OK
	if (!response.ok) {
		throw new Error(`PUT ${routes.addresses()} response not OK`);
	}

	// Get address returned by API
	const address = await response.json();

	// Return address
	return address;
}

/**
 * Delete an address belonging to the authenticated user
 * @param {number} id ID of the address to delete
 * @throws Will throw if network response is not OK
 */
export async function deleteAddress(id) {
	// Send delete request to API endpoint
	const response = await fetch(routes.addressById(id), {
		method: 'DELETE',
		credentials: 'include',
	});

	// Throw if response is not OK
	if (!response.ok) {
		throw new Error(`DELETE ${routes.addresses()} response not OK`);
	}
}
