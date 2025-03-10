async function postData(url, data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data)
  })

  if (response.status >= 400) {
    throw new Error('invalid credentials')
  }
  return response.json()
}

const AUTH_CREDENTIALS = {
  email: 'nguyenvanviet.150204@gmail.com',
  password: 'Vietviet@150204',
  deviceId: '01955b33-5c89-76e5-a11a-282d4fbd2f88'
}

postData('/api/v1/auth/login', AUTH_CREDENTIALS)
  .then((data) => {
    setTimeout(() => {
      window.ui.preauthorizeApiKey('BearerAuth', data.data.accessToken)
      console.log('preauth success')
    }, 1000)
  })
  .catch((e) => {
    console.error(`preauth failed: ${e}`)
  })
