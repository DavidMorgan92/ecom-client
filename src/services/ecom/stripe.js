/**
 * Routes to API endpoints
 */
export const routes = {
	base: () => process.env.REACT_APP_ECOM_API_URL,
	createIntent: () => new URL('/stripe/intent', routes.base()),
};

/**
 * Begin a transaction
 * @param {number} pricePennies Total price of order in pennies
 * @returns The Stripe client secret used to confirm the transaction
 * @throws Will throw if network response is not OK
 */
export async function createIntent(pricePennies) {
	// Send total order price to API server
	const response = await fetch(routes.createIntent(), {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			pricePennies,
		}),
	});

	// Throw if response is not OK
	if (!response.ok) {
		throw new Error(`POST ${routes.createIntent()} response not OK`);
	}

	// Get client secret from API response
	const secret = await response.text();

	// Return client secret
	return secret;
}
