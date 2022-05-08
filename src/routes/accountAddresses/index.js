import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import AddressForm from '../../components/addressForm';
import {
	createAddress,
	deleteAddress,
	editAddress,
	getAddresses,
	selectAddresses,
	selectCreateAddressFailed,
	selectCreateAddressPending,
	selectDeleteAddressFailed,
	selectDeleteAddressPending,
	selectEditAddressFailed,
	selectEditAddressPending,
	selectGetAddressesFailed,
	selectGetAddressesPending,
} from '../../store/addressesSlice';
import { selectAuthenticated } from '../../store/authSlice';

/**
 * Addresses page
 */
export default function AccountAddresses() {
	// Use dispatch to communicate with account redux store
	const dispatch = useDispatch();

	// Get information about addresses state from addresses redux store
	const getPending = useSelector(selectGetAddressesPending);
	const getFailed = useSelector(selectGetAddressesFailed);
	const createPending = useSelector(selectCreateAddressPending);
	const createFailed = useSelector(selectCreateAddressFailed);
	const editPending = useSelector(selectEditAddressPending);
	const editFailed = useSelector(selectEditAddressFailed);
	const deletePending = useSelector(selectDeleteAddressPending);
	const deleteFailed = useSelector(selectDeleteAddressFailed);
	const addresses = useSelector(selectAddresses);

	// Get information about auth state from auth redux store
	const authenticated = useSelector(selectAuthenticated);

	// Whether the user is creating a new address with a form or not
	const [creating, setCreating] = useState(false);

	// What address ID is the user editing? (-1 if none)
	const [editingId, setEditingId] = useState(-1);

	// What address is the user trying to delete?
	const [deletingAddress, setDeletingAddress] = useState(null);

	// Get addresses on mount
	useEffect(() => {
		// User will be redirected to login page if not authenticated, so don't get addresses
		if (!authenticated) {
			return;
		}

		dispatch(getAddresses());
	}, [dispatch, authenticated]);

	// If user isn't authenticated then redirect to login with redirect back to this page
	if (!authenticated) {
		return <Navigate to='/login?redirect=/account/addresses' replace />;
	}

	// User clicked the Create New Address button
	function handleCreateClick() {
		// Start creating
		setCreating(true);

		// Stop editing
		setEditingId(-1);

		// Stop deleting
		setDeletingAddress(null);
	}

	// User submitted the new address form
	function handleCreateSubmit(values) {
		// Dispatch create address request
		dispatch(createAddress(values))
			.unwrap()
			.then(() => {
				// Stop creating if create is successful
				setCreating(false);
			})
			.catch(() => {
				// Don't stop creating if create is unsuccessful
				// Allow failed to create message to be shown
			});
	}

	// User cancelled the new address form
	function handleCreateCancel() {
		// Stop creating
		setCreating(false);
	}

	// User clicked the Edit button
	function handleEditClick(addressId) {
		// Stop creating
		setCreating(false);

		// Start editing this address
		setEditingId(addressId);

		// Stop deleting
		setDeletingAddress(null);
	}

	// User submitted the edit address form
	function handleEditSubmit(values) {
		dispatch(editAddress(values))
			.unwrap()
			.then(() => {
				// Stop editing if edit is successful
				setEditingId(-1);
			})
			.catch(() => {
				// Don't stop editing if edit is unsuccessful
				// Allow failed to edit message to be shown
			});
	}

	// User cancelled the edit address form
	function handleEditCancel() {
		// Stop editing
		setEditingId(-1);
	}

	// User clicked the delete button
	function handleDeleteClick(address) {
		// Stop creating
		setCreating(false);

		// Stop editing
		setEditingId(-1);

		// Start deleting this address
		setDeletingAddress(address);
	}

	// User confirmed deletion
	function handleDeleteSubmit() {
		dispatch(deleteAddress(deletingAddress.id))
			.unwrap()
			.then(() => {
				// Stop deleting if delete is successful
				setDeletingAddress(null);
			})
			.catch(() => {
				// Don't stop deleting if delete is unsuccessful
				// Allow failed to delete message to be shown
			});
	}

	// User cancelled deletion
	function handleDeleteCancel() {
		// Stop deleting
		setDeletingAddress(null);
	}

	return (
		<>
			{/* Show when get addresses request is pending */}
			{getPending && <p>Loading addresses...</p>}

			{/* Show when get addresses request failed */}
			{getFailed && <p>Failed to load addresses</p>}

			{/* Show when there are no addresses, and get is not pending and not failed */}
			{addresses.length === 0 && !getPending && !getFailed && (
				<p>No addresses</p>
			)}

			{/* List of addresses */}
			<div data-testid='address-list'>
				{addresses.map(address => {
					// Show edit form if editingId is this address's ID
					if (address.id === editingId) {
						return (
							<div key={address.id} data-testid='edit-address-form'>
								<AddressForm
									address={address}
									onSubmit={handleEditSubmit}
									onCancel={handleEditCancel}
								/>

								{/* Show when edit is pending */}
								{editPending && <p>Updating address...</p>}

								{/* Show when edit has failed */}
								{editFailed && <p>Failed to update address</p>}
							</div>
						);
					}

					// Show address details for this address
					return (
						<div key={address.id}>
							<span>{address.houseNameNumber}</span>
							<span>{address.streetName}</span>
							<span>{address.townCityName}</span>
							<span>{address.postCode}</span>
							<button onClick={() => handleEditClick(address.id)}>Edit</button>
							<button onClick={() => handleDeleteClick(address)}>Delete</button>
						</div>
					);
				})}
			</div>

			{/* Show create form if creating, else show create button */}
			{creating ? (
				<div data-testid='create-address-form'>
					{/* Address form is shown while creating */}
					<AddressForm
						onSubmit={handleCreateSubmit}
						onCancel={handleCreateCancel}
						disabled={createPending}
					/>

					{/* Show when create is pending */}
					{createPending && <p>Creating address...</p>}

					{/* Show when create has failed */}
					{createFailed && <p>Failed to create address</p>}
				</div>
			) : (
				<button onClick={handleCreateClick}>Create New Address</button>
			)}

			{/* Show if user is deleting an address */}
			{deletingAddress && (
				<dialog open data-testid='delete-address-dialog'>
					<p>Are you sure you want to delete this address?</p>

					{/* Show when delete is pending */}
					{deletePending && <p>Deleting address...</p>}

					{/* Show when delete has failed */}
					{deleteFailed && <p>Failed to delete address</p>}

					<div>
						<span>{deletingAddress.houseNameNumber}</span>
						<span>{deletingAddress.streetName}</span>
						<span>{deletingAddress.townCityName}</span>
						<span>{deletingAddress.postCode}</span>
					</div>
					<div>
						<button onClick={handleDeleteSubmit}>Confirm</button>
						<button onClick={handleDeleteCancel}>Cancel</button>
					</div>
				</dialog>
			)}
		</>
	);
}
