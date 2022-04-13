import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	getAccountInfo,
	selectGetPending,
	selectGetFailed,
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
	const getPending = useSelector(selectGetPending);
	const getFailed = useSelector(selectGetFailed);
	const updatePending = useSelector(selectUpdatePending);
	const updateFailed = useSelector(selectUpdateFailed);

	// Get account information on mount
	useEffect(() => {
		dispatch(getAccountInfo())
			.then(result => {
				if (result.payload.accountInfo) {
					// Assign values gotten from API to the input fields
					setFirstName(result.payload.accountInfo.firstName);
					setLastName(result.payload.accountInfo.lastName);
				} else {
					// If get request failed, blank out input fields
					setFirstName('');
					setLastName('');
				}
			});
	}, [dispatch]);

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
				value={firstName}
				onChange={e => setFirstName(e.target.value)}
				disabled={getPending || updatePending}
			/>

			{/* Last name input field */}
			<label htmlFor='lastName'>Last name</label>
			<input
				id='lastName'
				name='lastName'
				type='text'
				value={lastName}
				onChange={e => setLastName(e.target.value)}
				disabled={getPending || updatePending}
			/>

			{/* Submit button (disabled if account get or update is pending) */}
			<input
				type='submit'
				value='Submit'
				disabled={getPending || updatePending}
			/>

			{/* Display when get is pending */}
			{getPending && <p>Loading account information...</p>}

			{/* Display when get has failed */}
			{getFailed && <p>Failed to get account information</p>}

			{/* Display when update is pending */}
			{updatePending && <p>Updating...</p>}

			{/* Display when update has failed */}
			{updateFailed && <p>Failed to update</p>}
		</form>
	);
}
