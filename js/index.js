document.getElementById('authLink').href = 'https://www.dropbox.com/oauth2/authorize?client_id=' + APP_KEY + '&token_access_type=offline&response_type=code';

if (REFRESH_TOKEN != null) {
  alert('Refresh Token сохранён!!!');
  location.href = "chooseBook.html";
}

async function getToken() {
  var dbx = new Dropbox.Dropbox({
    clientId: APP_KEY,
    clientSecret: APP_SECRET,
    refreshToken: REFRESH_TOKEN
  });

  dbx.filesListFolder({ path: '' })
    .then(function (response) {
      renderItems(response.result.entries);
    })
    .catch(function (error) {
      console.error(error.error || error);
    });


}

async function getRefreshToken(accessToken) {

  const base64authorization = btoa(`${'kj5lj89k7br0v46'}:${'px68axwvij1w561'}`);
  const response = await fetch('https://api.dropbox.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${base64authorization}`
    },
    body: new URLSearchParams({
      "code": accessToken,
      "grant_type": "authorization_code"
    })
  });

  const data = await response.json();
  REFRESH_TOKEN = data.refresh_token

  if (REFRESH_TOKEN != null) {
    console.log('Refresh Token получен:', REFRESH_TOKEN);
    let lastUID = UID;
    let newUID = data.uid;

    if (lastUID != newUID) {
      localStorage.clear();
    }

    localStorage.setItem('dbRefreshToken', REFRESH_TOKEN);
    localStorage.setItem('dbUID', newUID);
    location.href = "chooseBook.html";
  } else {
    console.log('Refresh Token не получен!');
    alert('Ошибка. Сгенерируйте код заново, пожалуйста!');
    document.getElementById('authCode').value = '';
  }
}

// Render a list of items to #files
function renderItems(items) {
  var filesContainer = document.getElementById('files');
  items.forEach(function (item) {
    var li = document.createElement('li');
    li.innerHTML = item.name;
    filesContainer.appendChild(li);
  });
}

function saveData() {
  localStorage.setItem('data1', document.getElementById('textInput').value);
}

function loadData() {
  document.getElementById('textInput').value = localStorage.getItem('data1');
}