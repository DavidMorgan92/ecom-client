import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './routes/home';
import Login from './routes/login';
import Register from './routes/register';
import Header from './components/header';

function App() {
	return (
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
	);
}

export default App;
