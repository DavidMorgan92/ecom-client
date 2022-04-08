const routes = {
	base: () => process.env.REACT_APP_ECOM_API_URL,
	login: () => new URL('/auth/login', routes.base()),
	register: () => new URL('/auth/register', routes.base()),
};

/**
 * Send login credentials to the login API endpoint
 * @param {string} email User's email
 * @param {string} password User's password
 */
export async function login(email, password) {
	try {
		const response = await fetch(routes.login(), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email,
				password,
			}),
		});

		console.log(response);
	} catch (err) {
		console.error(err);
	}
}
