import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Home from './routes/home';
import Login from './routes/login';
import Register from './routes/register';
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
						</Route>
					</Routes>
				</main>
			</Router>
		</Provider>
	);
}

export default App;
