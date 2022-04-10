import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	updateAccountInfo,
	selectUpdatePending,
	selectUpdateFailed,
} from '../../store/accountSlice';

/**
 * Account details page
 *
 * Contains a form for updating the user's account details
 */
export default function Account() {
	// Store input values in state
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');

	// Use dispatch to communicate with account redux store
	const dispatch = useDispatch();

	// Get information about account information update state from account redux store
	const updatePending = useSelector(selectUpdatePending);
	const updateFailed = useSelector(selectUpdateFailed);

	// Handle update form submission
	function handleSubmit(e) {
		e.preventDefault();

		// Dispatch updateAccount method from account redux store
		dispatch(updateAccountInfo({ firstName, lastName }));
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

			{/* Submit button (disabled if account update is pending) */}
			<input type='submit' value='Submit' disabled={updatePending} />

			{/* Display when update is pending */}
			{updatePending && <p>Updating...</p>}

			{/* Display when update has failed */}
			{updateFailed && <p>Failed to update</p>}
		</form>
	);
}
