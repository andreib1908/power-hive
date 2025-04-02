/* eslint-disable no-alert */
/* eslint-disable no-undef */
// ✅ signup.js — client-side logic for signup.pug

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.querySelector('.signup-form');
  const signupButton = document.querySelector('.signup-button button');

  signupButton.addEventListener('click', async (e) => {
    e.preventDefault();

    const formData = new FormData(signupForm);

    const data = {
      firstName: formData.get('firstname'),
      lastName: formData.get('lastname'),
      address: formData.get('address'),
      email: formData.get('email'),
      password: formData.get('password1'),
      passwordConfirm: formData.get('password2'),
    };

    try {
      const res = await fetch('/api/v1/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (res.ok && resData.status === 'success') {
        alert('✅ Account created! Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        alert(resData.message || 'Something went wrong during signup.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    }
  });
});
