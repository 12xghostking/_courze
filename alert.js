fetch('/auth', {
    method: 'POST',
    body: JSON.stringify({ username: 'example', password: 'password' }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'success') {
        window.location.replace('/home');
    } else {
      window.alert(data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
  