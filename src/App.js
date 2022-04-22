import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Home from './routes/home';
import Login from './routes/login';
import Register from './routes/register';
import Account from './routes/account';
import Products from './routes/products';
import Header from './components/header';

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
							<Route path='account' element={<Account />} />
							<Route path='products' element={<Products />} />
						</Route>
					</Routes>
				</main>
			</Router>
		</Provider>
	);
}

export default App;
