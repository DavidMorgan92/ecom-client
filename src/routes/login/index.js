import { useState } from 'react';
import { login } from '../../services/ecom';

/**
 * Login page component
 * 
 * Contains the login form and invokes login method on API endpoint
 */
export default function Login() {
	const [email, setEmail] = useState();
	const [password, setPassword] = useState();

	// Handle login form submission
	async function handleSubmit(e) {
		e.preventDefault();

		// Pass submitted values to login method from services/ecom
		await login(email, password);
	}

	return (
		<form onSubmit={handleSubmit}>
			<label htmlFor='email'>Email</label>
			<input
				id='email'
				name='email'
				type='email'
				onChange={e => setEmail(e.target.value)}
			/>

			<label htmlFor='password'>Password</label>
			<input
				id='password'
				name='password'
				type='password'
				onChange={e => setPassword(e.target.value)}
			/>

			<input type='submit' />
		</form>
	);
}
