export default function Login() {
	return (
		<form>
			<label for='username'>Email</label>
			<input id='username' name='username' type='text' />

			<label for='password'>Password</label>
			<input id='password' name='password' type='password' />

			<input type='submit' />
		</form>
	);
}
