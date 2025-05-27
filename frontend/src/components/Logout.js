<button onClick={() => {
  localStorage.removeItem('isLoggedIn');
  navigate('/login');
}}>
  Logout
</button>