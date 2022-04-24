import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
	selectCategories,
	getCategories,
	getProducts,
} from '../../store/productsSlice';

/**
 * Search component
 *
 * Contains search input and category selector
 * Gets matching products and redirects to products page on search
 */
export default function Search() {
	// Get information about product categories from products redux store
	const categories = useSelector(selectCategories);

	// Use dispatch to communicate with products redux store
	const dispatch = useDispatch();

	// Store search term and selected category index in state
	const [searchTerm, setSearchTerm] = useState('');
	const [categoryIndex, setCategoryIndex] = useState(-1);

	// Use navigate to go to the products page
	const navigate = useNavigate();

	// Get product categories on mount
	useEffect(() => {
		dispatch(getCategories());
	}, [dispatch]);

	// Get products matching the given search parameters
	function handleSearch() {
		// Use empty category string if 'All categories' is chosen, else send the chosen category
		const category =
			Number(categoryIndex) === -1 ? '' : categories[categoryIndex];

		// Get products with the given category and name search term
		dispatch(getProducts({ category, name: searchTerm }));

		// Navigate to products page
		navigate('/products');
	}

	return (
		<>
			{/* Search text input */}
			<input
				type='search'
				placeholder='Search products'
				onChange={e => setSearchTerm(e.target.value)}
				data-testid='search-input'
			/>

			{/* Search category input */}
			<select
				onChange={e => setCategoryIndex(e.target.value)}
				data-testid='search-dropdown'
			>
				<option value={-1}>All categories</option>
				{categories.map((category, index) => (
					<option key={category} value={index}>
						{category}
					</option>
				))}
			</select>

			{/* Search button */}
			<button onClick={handleSearch} data-testid='search-button'>
				Search
			</button>
		</>
	);
}
