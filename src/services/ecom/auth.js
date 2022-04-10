/**
 * Routes to API endpoints
 */
const routes = {
	base: () => process.env.REACT_APP_ECOM_API_URL,
	login: () => new URL('/auth/login', routes.base()),
	logout: () => new URL('/auth/logout', routes.base()),
	register: () => new URL('/auth/register', routes.base()),
};

/**
 * Send login credentials to the login API endpoint
 * @param {string} email User's email
 * @param {string} password User's password
 * @returns True if login was successful, false otherwise
 */
export async function login(email, password) {
	try {
		// Send login request to API endpoint
		const response = await fetch(routes.login(), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email,
				password,
			}),
		});

		// Return true if response was OK
		return response.ok;
	} catch (err) {
		// Log error
		console.error(err);

		// Return false if an error occurred
		return false;
	}
}

/**
 * Send a logout request to the API endpoint
 * @returns True if request was successful, false otherwise
 */
export async function logout() {
	try {
		// Send logout request to API endpoint
		const response = await fetch(routes.logout(), {
			method: 'POST',
		});

		// Return true if response was OK
		return response.ok;
	} catch (err) {
		// Log error
		console.error(err);

		// Return false if an error occurred
		return false;
	}
}

/**
 * Send a register request to the API endpoint
 * @param {string} firstName User's first name
 * @param {string} lastName User's last name
 * @param {string} email User's email address
 * @param {string} password User's password
 * @returns Account info object if the request was successful, false otherwise
 */
export async function register(firstName, lastName, email, password) {
	try {
		// Send register request to API endpoint
		const response = await fetch(routes.register(), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				firstName,
				lastName,
				email,
				password,
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
