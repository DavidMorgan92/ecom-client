import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	getProducts,
	selectGetProductsFailed,
	selectGetProductsPending,
	selectProducts,
} from '../../store/productsSlice';
import ProductList from '../../components/productList';

/**
 * Products list page
 *
 * Displays the products that have been received from the API
 */
export default function Products() {
	// Use dispatch to communicate with products redux store
	const dispatch = useDispatch();

	// Get information about products received from the API
	const products = useSelector(selectProducts);
	const getPending = useSelector(selectGetProductsPending);
	const getFailed = useSelector(selectGetProductsFailed);

	// Get products on mount
	useEffect(() => {
		dispatch(getProducts({ category: '', name: '' }));
	}, [dispatch]);

	return (
		<>
			{/* Display when products have been received */}
			{getPending || getFailed || <ProductList products={products} />}

			{/* Display when get is pending */}
			{getPending && <p>Receiving products list...</p>}

			{/* Display when get has failed */}
			{getFailed && <p>Failed to receive products list</p>}
		</>
	);
}
