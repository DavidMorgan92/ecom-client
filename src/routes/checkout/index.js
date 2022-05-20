import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectAuthenticated } from '../../store/authSlice';
import ChooseAddress from './chooseAddress';
import ConfirmPayment from './confirmPayment';

/**
 * Checkout page component
 *
 * First shows user the ChooseAddress page to choose a delivery address
 * Then shows the user the ConfirmPayment page to input their payment details
 */
export default function Checkout() {
	// Store user's delivery address in state
	const [deliveryAddress, setDeliveryAddress] = useState(null);

	// Store total price of cart in state when the address is confirmed
	const [pricePennies, setPricePennies] = useState(0);

	// Get authenticated state from auth redux store
	const authenticated = useSelector(selectAuthenticated);

	// If user isn't authenticated, redirect to login with redirect back to this page
	if (!authenticated) {
		return <Navigate to='/login?redirect=/checkout' replace />;
	}

	// User has chosen a delivery address
	function handleContinueToPayment(address, pricePennies) {
		// Save address to be used in confirm payment page
		setDeliveryAddress(address);

		// Save total cart price
		setPricePennies(pricePennies);
	}

	// User chose to go back from payment confirmation
	function handleBackClick() {
		// Clear address to be chosen again on ChooseAddress page
		setDeliveryAddress(null);
	}

	if (!deliveryAddress) {
		// Show when user has not chosen a delivery address
		return <ChooseAddress onContinueToPayment={handleContinueToPayment} />;
	} else {
		// Show when user has chosen a delivery address
		return (
			<ConfirmPayment
				onBackClick={handleBackClick}
				pricePennies={pricePennies}
				deliveryAddress={deliveryAddress}
			/>
		);
	}
}
