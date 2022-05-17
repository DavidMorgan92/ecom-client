import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { selectAuthenticated } from '../../store/authSlice';
import {
	selectCart,
	selectUpdateCartFailed,
	selectUpdateCartPending,
	updateCart,
} from '../../store/cartSlice';
import {
	getProductById,
	selectGetProductByIdFailed,
	selectProducts,
} from '../../store/productsSlice';
import { formatPrice } from '../../util';
import NoMatch from '../noMatch';

/**
 * Product details page component
 *
 * Shows the details of the product whose ID is given as a URL parameter
 */
export default function ProductDetails() {
	// Use dispatch to communicate with the products redux store
	const dispatch = useDispatch();

	// Get the product ID from the URL parameter
	const { productId } = useParams();

	// Get information about products from the products redux store
	const products = useSelector(selectProducts);
	const getProductByIdFailed = useSelector(selectGetProductByIdFailed);

	// Get the current cart from the cart redux store for adding
	const cart = useSelector(selectCart);
	const updateCartPending = useSelector(selectUpdateCartPending);
	const updateCartFailed = useSelector(selectUpdateCartFailed);

	// Get authenticated state from auth redux store
	const authenticated = useSelector(selectAuthenticated);

	// Use navigate to go to login page if not authenticated
	const navigate = useNavigate();

	// Get the product with the matching ID
	const product = products.find(p => p.id === Number(productId));

	// If product is not found in the redux store
	if (!product) {
		// Show this if the get request failed
		if (getProductByIdFailed) {
			return <NoMatch />;
		}

		// Request the product from the API
		dispatch(getProductById({ id: productId }));

		// Get request is now pending because of the dispatched thunk
		return <div>Loading product information...</div>;
	}

	// User clicked the add to cart button
	function handleAddToCart() {
		// If not authenticated, redirect to login page with redirect back to this product page
		if (!authenticated) {
			navigate(`/login?redirect=/product/${productId}`);
			return;
		}

		const newCart = [...cart, { count: 1, product }];

		// Dispatch update cart thunk to add new item
		dispatch(updateCart(newCart));
	}

	return (
		<>
			<div>{product.name}</div>
			<div>{product.description}</div>
			<div>{formatPrice(product.pricePennies)}</div>
			<div>
				{/* Add to cart button, disabled when update cart is pending */}
				<button onClick={handleAddToCart} disabled={updateCartPending}>
					Add to Cart
				</button>

				{/* Show when update cart is pending */}
				{updateCartPending && <p>Adding item to cart...</p>}

				{/* Show when update cart failed */}
				{updateCartFailed && <p>Failed to add item to cart</p>}
			</div>
		</>
	);
}
