/**
 * Routes to API endpoints
 */
export const routes = {
	base: () => process.env.REACT_APP_ECOM_API_URL,
	login: () => new URL('/auth/login', routes.base()),
	googleLogin: () => new URL('/auth/google', routes.base()),
	logout: () => new URL('/auth/logout', routes.base()),
	register: () => new URL('/auth/register', routes.base()),
};

/**
 * Send login credentials to the login API endpoint
 * @param {string} email User's email
 * @param {string} password User's password
 * @throws Will throw if network response is not OK
 */
export async function login(email, password) {
	// Send login request to API endpoint
	const response = await fetch(routes.login(), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({
			email,
			password,
		}),
	});

	// Throw if response was not OK
	if (!response.ok) {
		throw new Error(`POST ${routes.login()} response not OK`);
	}
}

/**
 * Send a google auth token to the API endpoint to login
 * @param {string} token Authorization token obtained from Google
 * @returns Email address of the user
 */
export async function googleLogin(token) {
	// Send login request to API endpoint
	const response = await fetch(routes.googleLogin(), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({
			token,
		}),
	});

	// Throw if response is not OK
	if (!response.ok) {
		throw new Error(`POST ${routes.googleLogin()} response not OK`);
	}

	// Get email address returned from server
	const email = await response.text();

	// Return email address
	return email;
}

/**
 * Send a logout request to the API endpoint
 * @throws Will throw if network response is not OK
 */
export async function logout() {
	// Send logout request to API endpoint
	const response = await fetch(routes.logout(), {
		method: 'POST',
		credentials: 'include',
	});

	// Throw if response was not OK
	if (!response.ok) {
		throw new Error(`POST ${routes.logout()} response not OK`);
	}
}

/**
 * Send a register request to the API endpoint
 * @param {string} firstName User's first name
 * @param {string} lastName User's last name
 * @param {string} email User's email address
 * @param {string} password User's password
 * @returns Account info object if the request was successful
 * @throws Will throw if network response is not OK
 */
export async function register(firstName, lastName, email, password) {
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

	// Throw if response was not OK
	if (!response.ok) {
		throw new Error(`POST ${routes.register()} response not OK`);
	}

	// Get account info returned by API
	const accountInfo = await response.json();

	// Return account info
	return accountInfo;
}
