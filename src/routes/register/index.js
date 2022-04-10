import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	register,
	selectRegistrationPending,
	selectRegistrationFailed,
} from '../../store/authSlice';

/**
 * Register page component
 *
 * Contains the registration form and dispatches register thunk to redux store
 */
export default function Register() {
	// Store input values in state
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	// Use dispatch to communicate with auth redux store
	const dispatch = useDispatch();

	// Get information about registration state from auth redux store
	const registrationPending = useSelector(selectRegistrationPending);
	const registrationFailed = useSelector(selectRegistrationFailed);

	// Handle registration form submission
	function handleSubmit(e) {
		e.preventDefault();

		// Dispatch register method from auth redux store
		dispatch(register({ firstName, lastName, email, password }));
	}

	return (
		<form onSubmit={handleSubmit}>
			{/* First name input field */}
			<label htmlFor='firstName'>First name</label>
			<input
				id='firstName'
				name='firstName'
				type='text'
				onChange={e => setFirstName(e.target.value)}
			/>

			{/* Last name input field */}
			<label htmlFor='lastName'>Last name</label>
			<input
				id='lastName'
				name='lastName'
				type='text'
				onChange={e => setLastName(e.target.value)}
			/>

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

			{/* Confirm password input field */}
			<label htmlFor='confirm-password'>Confirm password</label>
			<input
				id='confirm-password'
				name='confirm-password'
				type='password'
				onChange={e => setConfirmPassword(e.target.value)}
			/>

			{/* Submit button (disable if registration is pending) */}
			<input type='submit' value='Submit' disabled={registrationPending} />

			{/* Display when registration is pending */}
			{registrationPending && <p>Registering...</p>}

			{/* Display when registration has failed */}
			{registrationFailed && <p>Failed to register</p>}
		</form>
	);
}
