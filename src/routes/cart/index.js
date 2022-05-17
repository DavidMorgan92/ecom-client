import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { selectAuthenticated } from '../../store/authSlice';
import {
	selectCart,
	selectGetCartFailed,
	selectGetCartPending,
	selectUpdateCartFailed,
	selectUpdateCartPending,
	getCart,
	updateCart,
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

	// Get information about auth state from the auth redux store
	const authenticated = useSelector(selectAuthenticated);

	// Use navigate to go to the checkout page when checkout is clicked
	const navigate = useNavigate();

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
	function handleCountChange(productId, count) {
		// Get index of item with matching product ID
		const index = cart.findIndex(item => item.product.id === productId);

		// Update item count in cart
		if (index >= 0) {
			const newCart = [...cart];
			newCart[index] = { count, product: cart[index].product };

			// Update cart on server
			dispatch(updateCart(newCart));
		}
	}

	// User clicked the remove button
	function handleRemove(productId) {
		// Get index of item with matching product ID
		const index = cart.findIndex(item => item.product.id === productId);

		// Remove item from cart
		if (index >= 0) {
			const newCart = [...cart];
			newCart.splice(index, 1);

			// Update cart on server
			dispatch(updateCart(newCart));
		}
	}

	// User clicked the checkout button
	function handleCheckout() {
		// Navigate to checkout page
		navigate('/checkout');
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
			<div data-testid='cart-list'>
				{cart.map(item => (
					<div key={item.product.id}>
						<span>{item.product.name}</span>
						<input
							data-testid='item-count'
							type='number'
							min='1'
							max='999'
							value={item.count}
							onChange={event =>
								handleCountChange(item.product.id, Number(event.target.value))
							}
						/>
						<button onClick={() => handleRemove(item.product.id)}>
							Remove
						</button>
					</div>
				))}
			</div>

			{/* Checkout button, disabled if cart is empty */}
			<button onClick={handleCheckout} disabled={cart.length === 0}>
				Checkout
			</button>
		</div>
	);
}
