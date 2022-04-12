/**
 * Routes to API endpoints
 */
const routes = {
	base: () => process.env.REACT_APP_ECOM_API_URL,
	account: () => new URL('/account', routes.base()),
};

/**
 * Get the account information of the authenticated user
 * @returns Account info object if the request was successful, false otherwise
 */
export async function getAccountInfo() {
	try {
		// Send get request to API endpoint
		const response = await fetch(routes.account(), {
			credentials: 'include',
		});

		// Return false if response was not OK
		if (!response.ok) {
			return false;
		}

		// Get account info returned by API
		const accountInfo = await response.json();

		// Return account info
		return accountInfo;
	} catch (err) {
		// Log error
		console.error(err);

		// Return false if an error occurred
		return false;
	}
}

/**
 * Update the authenticated user's account information
 * @param {string} firstName User's new first name
 * @param {string} lastName User's new last name
 * @returns Account info object i the request was successful, false otherwise
 */
export async function updateAccountInfo(firstName, lastName) {
	try {
		// Send put request to API endpoint
		const response = await fetch(routes.account(), {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({
				firstName,
				lastName,
			}),
		});

		// Return false if response was not OK
		if (!response.ok) {
			return false;
		}

		// Get account info returned by API
		const accountInfo = await response.json();

		// Return account info
		return accountInfo;
	} catch (err) {
		// Log error
		console.error(err);

		// Return false if an error occurred
		return false;
	}
}
