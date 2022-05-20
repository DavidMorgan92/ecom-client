import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {
	createAddress,
	getAddresses,
	selectAddresses,
	selectGetAddressesPending,
	selectGetAddressesFailed,
	selectCreateAddressPending,
	selectCreateAddressFailed,
} from '../../store/addressesSlice';
import AddressForm from '../addressForm';

/**
 * AddressPicker component
 *
 * Allows a user to choose an existing address or create a new one
 */
export default function AddressPicker({ onChange }) {
	// Get addresses belonging to the user
	const addresses = useSelector(selectAddresses);
	const getAddressesPending = useSelector(selectGetAddressesPending);
	const getAddressesFailed = useSelector(selectGetAddressesFailed);
	const createAddressPending = useSelector(selectCreateAddressPending);
	const createAddressFailed = useSelector(selectCreateAddressFailed);

	// Use dispatch to communicate with redux store
	const dispatch = useDispatch();

	// Store selected and new addresses in state
	const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
	const [newAddress, setNewAddress] = useState(null);

	// Make addresses are gotten from server
	useEffect(() => {
		// Get addresses from API
		dispatch(getAddresses());
	}, [dispatch]);

	// User selected a new address in the select input
	function handleSelectedAddressIndexChange(index) {
		// Store selected address index in state
		setSelectedAddressIndex(index);

		// Clear new address in state
		setNewAddress(null);

		// Pass new address to containing component
		onChange(index >= 0 ? addresses[index] : null);
	}

	// Handle submission of new address
	function handleAddressSubmit(values) {
		// Store new address in state
		setNewAddress(values);

		// Clear selected existing address
		setSelectedAddressIndex(-1);

		// Send new address to API
		dispatch(createAddress(values))
			.unwrap()
			.then(payload => {
				// Pass new address to containing component
				onChange(payload.address);
			})
			.catch(() => {});
	}

	return (
		<>
			{/* Allow user to choose an existing address */}
			<h3>Choose an existing address or...</h3>
			<select
				data-testid='existing-address-select'
				value={selectedAddressIndex}
				onChange={event =>
					handleSelectedAddressIndexChange(Number(event.target.value))
				}
			>
				<option value={-1}>New address</option>
				{addresses.map((address, index) => (
					<option value={index} key={index}>
						{address.houseNameNumber}
						{address.postCode}
					</option>
				))}
			</select>

			{/* Show when get addresses is pending */}
			{getAddressesPending && <p>Loading addresses...</p>}

			{/* Show when get addresses failed */}
			{getAddressesFailed && <p>Failed to get addresses</p>}

			{/* Allow user to create a new address */}
			<h3>Input a new address</h3>
			<AddressForm
				address={newAddress}
				onSubmit={handleAddressSubmit}
				hideCancel={true}
			/>

			{/* Show when create address is pending */}
			{createAddressPending && <p>Saving new address...</p>}

			{/* Show when create address has failed */}
			{createAddressFailed && <p>Failed to save new address</p>}
		</>
	);
}
