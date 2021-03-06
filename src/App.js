import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
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
import Checkout from './routes/checkout';
import Orders from './routes/orders';
import OrderDetails from './routes/orderDetails';
import NoMatch from './routes/noMatch';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

function App() {
	return (
		<Elements stripe={stripePromise}>
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
									<Route path='orders' element={<Orders />} />
									<Route path='order/:orderId' element={<OrderDetails />} />
								</Route>
								<Route path='products' element={<Products />} />
								<Route path='product/:productId' element={<ProductDetails />} />
								<Route path='cart' element={<Cart />} />
								<Route path='checkout' element={<Checkout />} />
								<Route path='*' element={<NoMatch />} />
							</Route>
						</Routes>
					</main>
				</Router>
			</Provider>
		</Elements>
	);
}

export default App;
