import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {
	getCart,
	selectCart,
	selectGetCartFailed,
	selectGetCartPending,
} from '../../store/cartSlice';
import {
	createAddress,
	getAddresses,
	selectAddresses,
	selectCreateAddressFailed,
	selectCreateAddressPending,
	selectGetAddressesFailed,
	selectGetAddressesPending,
} from '../../store/addressesSlice';
import AddressForm from '../../components/addressForm';

/**
 * ChooseAddress page component
 * 
 * First step of the checkout process
 * Allows user to choose a delivery address for their order
 */
export default function ChooseAddress({ onContinueToPayment }) {
	// Get cart to show user for confirmation
	const cart = useSelector(selectCart);
	const getCartPending = useSelector(selectGetCartPending);
	const getCartFailed = useSelector(selectGetCartFailed);

	// Get addresses belonging to the user
	const addresses = useSelector(selectAddresses);
	const getAddressesPending = useSelector(selectGetAddressesPending);
	const getAddressesFailed = useSelector(selectGetAddressesFailed);
	const createAddressPending = useSelector(selectCreateAddressPending);
	const createAddressFailed = useSelector(selectCreateAddressFailed);

	// Use dispatch to communicate with redux store
	const dispatch = useDispatch();

	// Store selected address in state
	const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);

	// Store new address in state
	const [newAddress, setNewAddress] = useState(null);

	// Store user's chosen address
	const [deliveringToAddress, setDeliveringToAddress] = useState(null);

	// Make sure cart and addresses are gotten from server
	useEffect(() => {
		// Get cart and addresses from API
		dispatch(getCart());
		dispatch(getAddresses());
	}, [dispatch]);

	// User selected a new address in the select input
	function handleSelectedAddressIndexChange(index) {
		// Store selected address index in state
		setSelectedAddressIndex(index);

		// Clear new address in state
		setNewAddress(null);

		// Store selected address in state
		setDeliveringToAddress(addresses[index]);
	}

	// Handle submission of new address
	function handleAddressSubmit(values) {
		// Store new address in state
		setNewAddress(values);

		// Clear selected existing address
		setSelectedAddressIndex(-1);

		// Store selected address in state
		setDeliveringToAddress(values);
	}

	// Handle continue to payment
	function handleContinueToPayment() {
		// If user has given a new address and not selected an existing address
		if (newAddress && selectedAddressIndex === -1) {
			// Send new address to API
			dispatch(createAddress(newAddress))
				.unwrap()
				.then(payload => {
					// Continue to payment with new address
					onContinueToPayment(payload.address);
				})
				.catch(() => {});
		} else if (selectedAddressIndex !== -1) {
			// Continue to payment with selected existing address
			onContinueToPayment(addresses[selectedAddressIndex]);
		} else {
			// Show that user has not chosen an address
		}
	}

	return (
		<>
			{/* Show list of cart items for confirmation */}
			<h2>Your cart</h2>
			{cart.map(item => (
				<div key={item.product.id}>
					<span>{item.product.name}</span>
					<span>x{item.count}</span>
				</div>
			))}

			{/* Show when get cart is pending */}
			{getCartPending && <p>Loading cart...</p>}

			{/* Show when get cart failed */}
			{getCartFailed && <p>Failed to get cart</p>}

			{/* Allow user to choose an existing address */}
			<h2>Select delivery address</h2>
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

			{/* Show address user has chosen for clarity */}
			<h2>Delivering to...</h2>
			{deliveringToAddress ? (
				<div data-testid='delivering-to-address'>
					<span>{deliveringToAddress.houseNameNumber}</span>
					<span>{deliveringToAddress.streetName}</span>
					<span>{deliveringToAddress.townCityName}</span>
					<span>{deliveringToAddress.postCode}</span>
				</div>
			) : (
				<p>Please choose a delivery address</p>
			)}

			{/* Button to confirm cart items and delivery address (disabled when create address is pending) */}
			<button onClick={handleContinueToPayment} disabled={createAddressPending}>
				Continue to Payment
			</button>
		</>
	);
}
