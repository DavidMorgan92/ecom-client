import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Header from './components/header';
import Home from './routes/home';
import Login from './routes/login';
import Register from './routes/register';
import Account from './routes/account';
import AccountDetails from './routes/accountDetails';
import AccountAddresses from './routes/accountAddresses';
import Products from './routes/products';
import ProductDetails from './routes/productDetails';
import Cart from './routes/cart';
import NoMatch from './routes/noMatch';

function App() {
	return (
		<Provider store={store}>
			<Router>
				<Header />
				<main>
					<Routes>
						<Route path='/'>
							<Route index element={<Home />} />
							<Route path='login' element={<Login />} />
							<Route path='register' element={<Register />} />
							<Route path='account' element={<Account />}>
								<Route index element={<AccountDetails />} />
								<Route path='details' element={<AccountDetails />} />
								<Route path='addresses' element={<AccountAddresses />} />
							</Route>
							<Route path='products' element={<Products />} />
							<Route path='product/:productId' element={<ProductDetails />} />
							<Route path='cart' element={<Cart />} />
							<Route path='*' element={<NoMatch />} />
						</Route>
					</Routes>
				</main>
			</Router>
		</Provider>
	);
}

export default App;
