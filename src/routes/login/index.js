import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	login,
	selectAuthPending,
	selectAuthFailed,
} from '../../store/authSlice';

/**
 * Login page component
 *
 * Contains the login form and dispatches login thunk to redux store
 */
export default function Login() {
	// Store input values in state
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	// Use dispatch to communicate with auth redux store
	const dispatch = useDispatch();

	// Get information about authentication state from auth redux store
	const authPending = useSelector(selectAuthPending);
	const authFailed = useSelector(selectAuthFailed);

	// Handle login form submission
	function handleSubmit(e) {
		e.preventDefault();

		// Dispatch login method from auth redux store
		dispatch(login({ email, password }));
	}

	return (
		<form onSubmit={handleSubmit}>
			{/* Email input field */}
			<label htmlFor='email'>Email</label>
			<input
				id='email'
				name='email'
				type='email'
				onChange={e => setEmail(e.target.value)}
			/>

			{/* Password input field */}
			<label htmlFor='password'>Password</label>
			<input
				id='password'
				name='password'
				type='password'
				onChange={e => setPassword(e.target.value)}
			/>

			{/* Submit button (disable if authentication is pending) */}
			<input type='submit' value='Submit' disabled={authPending} />

			{/* Display when authentication is pending */}
			{authPending && <p>Logging in...</p>}

			{/* Display when authentication has failed */}
			{authFailed && <p>Failed to login</p>}
		</form>
	);
}
