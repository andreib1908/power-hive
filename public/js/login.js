/* eslint-disable */
const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      console.log('✅ Logged in!');
      window.setTimeout(() => {
        location.assign('/stations'); // ← Redirect to your power stations
      }, 1500);
    }
  } catch (err) {
    console.log('❌ Login failed');
    console.log(err.response?.data || err.message);
  }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
