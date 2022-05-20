import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {
	getCart,
	selectCart,
	selectGetCartFailed,
	selectGetCartPending,
} from '../../store/cartSlice';
import { totalPricePennies } from '../../util';
import AddressPicker from '../../components/addressPicker';

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

	// Use dispatch to communicate with redux store
	const dispatch = useDispatch();

	// Store user's chosen address
	const [deliveryAddress, setDeliveryAddress] = useState(null);

	// Make sure cart and addresses are gotten from server
	useEffect(() => {
		// Get cart and addresses from API
		dispatch(getCart());
	}, [dispatch]);

	function handleAddressChange(address) {
		setDeliveryAddress(address);
	}

	// Handle continue to payment
	function handleContinueToPayment() {
		if (!deliveryAddress) {
			return;
		}

		// Get total price of cart
		const totalPrice = totalPricePennies(cart);

		// Pass chosen delivery address and total price to containing component
		onContinueToPayment(deliveryAddress, totalPrice);
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

			{/* Allow user to choose an address */}
			<h2>Select delivery address</h2>
			<AddressPicker onChange={handleAddressChange} />

			{/* Show address user has chosen for clarity */}
			<h2>Delivering to...</h2>
			{deliveryAddress ? (
				<div data-testid='delivery-address'>
					<span>{deliveryAddress.houseNameNumber}</span>
					<span>{deliveryAddress.streetName}</span>
					<span>{deliveryAddress.townCityName}</span>
					<span>{deliveryAddress.postCode}</span>
				</div>
			) : (
				<p>Please choose a delivery address</p>
			)}

			{/* Button to confirm cart items and delivery address (disabled when create address is pending) */}
			<button onClick={handleContinueToPayment}>
				Continue to Payment
			</button>
		</>
	);
}
