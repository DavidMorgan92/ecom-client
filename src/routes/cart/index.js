import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectAuthenticated } from '../../store/authSlice';
import {
	selectCart,
	selectCheckoutCartFailed,
	selectCheckoutCartPending,
	selectGetCartFailed,
	selectGetCartPending,
	selectUpdateCartFailed,
	selectUpdateCartPending,
	getCart,
	updateCart,
	checkoutCart,
} from '../../store/cartSlice';

/**
 * Cart page component
 */
export default function Cart() {
	// Use dispatch to communicate with the cart redux store
	const dispatch = useDispatch();

	// Get information about the cart from the cart redux store
	const cart = useSelector(selectCart);
	const getPending = useSelector(selectGetCartPending);
	const getFailed = useSelector(selectGetCartFailed);
	const updatePending = useSelector(selectUpdateCartPending);
	const updateFailed = useSelector(selectUpdateCartFailed);
	const checkoutPending = useSelector(selectCheckoutCartPending);
	const checkoutFailed = useSelector(selectCheckoutCartFailed);

	// Get information about auth state from the auth redux store
	const authenticated = useSelector(selectAuthenticated);

	// Get cart on mount
	useEffect(() => {
		// User will be redirect to login page if not authenticated, so don't get cart
		if (!authenticated) {
			return;
		}

		dispatch(getCart());
	}, [dispatch, authenticated]);

	// If user isn't authenticated then redirect to login with redirect back to this page
	if (!authenticated) {
		return <Navigate to='/login?redirect=/cart' replace />;
	}

	// User changed the item count value
	function handleCountChange(productId, count) {}

	// User clicked the remove button
	function handleRemove(productId) {
		const index = cart.findIndex(item => item.product.id === productId);

		if (index >= 0) {
			cart.splice(index, 1);
		}

		dispatch(updateCart(cart));
	}

	// User clicked the checkout button
	function handleCheckout() {
		dispatch(checkoutCart());
	}

	return (
		<div>
			{/* Show when get cart request is pending */}
			{getPending && <p>Loading cart...</p>}

			{/* Show when get cart request failed */}
			{getFailed && <p>Failed to get cart</p>}

			{/* Show when there are no cart items, and get is not pending and not failed */}
			{cart.length === 0 && !getPending && !getFailed && <p>Cart is empty</p>}

			{/* Show when cart is updating */}
			{updatePending && <p>Updating cart...</p>}

			{/* Show when cart failed to update */}
			{updateFailed && <p>Failed to update</p>}

			{/* List of cart items */}
			{cart.map(item => (
				<div key={item.product.id}>
					<span>{item.product.name}</span>
					<input
						type='number'
						min='1'
						max='999'
						value={item.count}
						onChange={event =>
							handleCountChange(item.product.id, event.target.value)
						}
					/>
					<button onClick={() => handleRemove(item.product.id)}>Remove</button>
				</div>
			))}

			{/* Show when checkout is pending */}
			{checkoutPending && <p>Checking out...</p>}

			{/* Show when checkout failed */}
			{checkoutFailed && <p>Failed to checkout</p>}

			{/* Checkout button */}
			<button onClick={handleCheckout} disabled={checkoutPending}>
				Checkout
			</button>
		</div>
	);
}
