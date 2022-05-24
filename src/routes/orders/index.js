import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectAuthenticated } from '../../store/authSlice';
import {
	getOrders,
	selectGetOrdersFailed,
	selectGetOrdersPending,
	selectOrders,
} from '../../store/ordersSlice';

/**
 * Orders list page
 *
 * Shows the authorized user's past orders
 */
export default function Orders() {
	// Get information about orders from the orders redux store
	const orders = useSelector(selectOrders);
	const getPending = useSelector(selectGetOrdersPending);
	const getFailed = useSelector(selectGetOrdersFailed);

	// Get authenticated state from auth redux store
	const authenticated = useSelector(selectAuthenticated);

	// Use dispatch to get orders from the API
	const dispatch = useDispatch();

	// Get orders on mount
	useEffect(() => {
		// User will be redirected to login page if not authenticated, so don't get orders
		if (!authenticated) {
			return;
		}

		dispatch(getOrders());
	}, [dispatch, authenticated]);

	// If user isn't authenticated then redirect to login with redirect back to this page
	if (!authenticated) {
		return <Navigate to='/login?redirect=/account/orders' replace />;
	}

	// User clicked the order details button
	function handleDetailsClick(orderId) {
		// TODO: Navigate to order details page
	}

	return (
		<>
			{/* Show when get orders request is pending */}
			{getPending && <p>Loading orders...</p>}

			{/* Show when get orders request failed */}
			{getFailed && <p>Failed to load orders</p>}

			{/* Show when there are no orders, and get is not pending and not failed */}
			{orders.length === 0 && !getPending && !getFailed && <p>No orders</p>}

			{/* List of orders */}
			{orders.map(order => (
				<div key={order.id}>
					{new Date(order.createdAt).toLocaleString()}
					<button onClick={() => handleDetailsClick(order.id)}>Details</button>
				</div>
			))}
		</>
	);
}
