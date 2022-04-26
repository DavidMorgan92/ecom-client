import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
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

	return (
		<>
			<div>{product.name}</div>
			<div>{product.description}</div>
			<div>{formatPrice(product.pricePennies)}</div>
		</>
	);
}
