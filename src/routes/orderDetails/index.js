import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuthenticated } from '../../store/authSlice';
import {
	selectOrders,
	getOrderById,
	selectGetOrderByIdFailed,
} from '../../store/ordersSlice';
import NoMatch from '../noMatch';

/**
 * Order details page component
 *
 * Shows the details of the order whose ID is given as a URL parameter
 */
export default function OrderDetails() {
	// Use dispatch to communicate with the products redux store
	const dispatch = useDispatch();

	// Get the order ID from the URL parameter
	const { orderId } = useParams();

	// Get information about orders from the orders redux store
	const orders = useSelector(selectOrders);
	const getOrderByIdFailed = useSelector(selectGetOrderByIdFailed);

	// Get authenticated state from auth redux store
	const authenticated = useSelector(selectAuthenticated);

	// Use navigate to go back to orders page when user clicks go back button
	const navigate = useNavigate();

	// If user isn't authenticated then redirect to login with redirect back to this page
	if (!authenticated) {
		return (
			<Navigate to={`/login?redirect=/account/order/${orderId}`} replace />
		);
	}

	// Get the order with the matching ID
	const order = orders.find(o => o.id === Number(orderId));

	// If order is not found in the redux store
	if (!order) {
		// Show this if the get request failed
		if (getOrderByIdFailed) {
			return <NoMatch />;
		}

		// Request the order from the API
		dispatch(getOrderById(orderId));

		// Get request is now pending because of the dispatched thunk
		return <div>Loading order information...</div>;
	}

	function handleGoBackClick() {
		navigate('/account/orders');
	}

	return (
		<>
			<dl>
				{/* Created at date/time */}
				<dt>Created at:</dt>
				<dd>{new Date(order.createdAt).toLocaleString()}</dd>

				{/* Delivery address */}
				<dt>Delivery address:</dt>
				<dd>
					<span>{order.address.houseNameNumber}</span>
					<span>{order.address.streetName}</span>
					<span>{order.address.townCityName}</span>
					<span>{order.address.postCode}</span>
				</dd>

				{/* Items in the order */}
				<dt>Items:</dt>
				<dd>
					{order.items.map(item => (
						<div key={item.product.id}>
							<span>{item.product.name}</span>
							<span>x{item.count}</span>
						</div>
					))}
				</dd>
			</dl>

			{/* Button to go back to orders page */}
			<button onClick={handleGoBackClick}>Go back</button>
		</>
	);
}
