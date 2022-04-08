export default function Register() {
	return (
		<form>
			<label for='username'>Email</label>
			<input id='username' name='username' type='text' />

			<label for='password'>Password</label>
			<input id='password' name='password' type='password' />

			<label for='confirm-password'>Confirm password</label>
			<input id='confirm-password' name='confirm-password' type='password' />

			<input type='submit' />
		</form>
	);
}
