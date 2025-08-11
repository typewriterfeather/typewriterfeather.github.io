var editor = window.pell.init({
        element: document.getElementById('editor'),
        defaultParagraphSeparator: 'p'//,
        //onChange: function (html) {
        //  document.getElementById('text-output').innerHTML = html
        //  document.getElementById('html-output').textContent = html
        //}
      })

var APP_KEY = 'kj5lj89k7br0v46'; // APP KEY
var APP_SECRET = 'px68axwvij1w561';
var REFRESH_TOKEN = '_R-c-SlJ4XEAAAAAAAAAAWHoNda7uqPrihmBRnPEZc7XpMyLkesaAmyhqYSRRxeF'; 

// Parses the url and gets the access token if it is in the urls hash
function getAccessTokenFromUrl() {
  return utils.parseQueryString(window.location.hash).access_token;
}

// If the user was just redirected from authenticating, the urls hash will
// contain the access token.
function isAuthenticated() {
  return !!getAccessTokenFromUrl();
}

if (isAuthenticated()) {


  // Create an instance of Dropbox with the access token and use it to
  // fetch and render the files in the users root directory.
  var dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });
  dbx.filesListFolder({ path: '' })
    .then(function (response) {
      renderItems(response.result.entries);
    })
    .catch(function (error) {
      console.error(error.error || error);
    });
} else {


  // Set the login anchors href using dbx.getAuthenticationUrl()
  var dbx = new Dropbox.Dropbox({ clientId: APP_KEY });
  var authUrl = dbx.auth.getAuthenticationUrl('http://localhost:8000/')
    .then((authUrl) => {
      document.getElementById('authlink').href = authUrl;
      console.log(authUrl);
    })
}

async function getCode1() {
  var dbx = new Dropbox.Dropbox({ clientId: APP_KEY });
  var token = dbx.auth.getAccessTokenFromCode('http://localhost:8000/', '1gRsak2RXjAAAAAAAAAALJYHsfTe32n2oSR0L_4vAVg');
  console.log(token.result);
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

async function getCode() {

  //const response1 = await fetch('https://www.dropbox.com/oauth2/authorize?APP_KEY=kj5lj89k7br0v46&token_access_type=offline&response_type=code');



  const base64authorization = btoa(`${'kj5lj89k7br0v46'}:${'px68axwvij1w561'}`);
  const response = await fetch('https://api.dropbox.com/oauth2/authorize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${base64authorization}`
    },
    body: new URLSearchParams({
      "token_access_type": "offline",
      "response_type": "code"
    })
  });

  const data = await response.json();
  console.log('Refresh Token Response:', data);

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
  console.log('Refresh Token Response:', data.refresh_token);

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

function uploadFile() {

  const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;
  var ACCESS_TOKEN = getAccessTokenFromUrl();
  var dbx = new Dropbox.Dropbox({ accessToken: ACCESS_TOKEN });
  var fileInput = document.getElementById('file-upload');
  //var file = fileInput.files[0];
  var bfile = new Blob([fileInput.value], { type: 'plain/text' });

  if (bfile.size < UPLOAD_FILE_SIZE_LIMIT) { // File is smaller than 150 MB - use filesUpload API
    dbx.filesUpload({ path: '/Папка 2/' + 'data.txt'/*file.name*/, contents: bfile })
      .then(function (response) {
        var results = document.getElementById('results');
        var br = document.createElement("br");
        results.appendChild(document.createTextNode('File uploaded!'));
        results.appendChild(br);
        console.log(response);
      })
      .catch(function (error) {
        console.error(error.error || error);
      });
  } /*else { // File is bigger than 150 MB - use filesUploadSession* API
        const maxBlob = 12 * 1024 * 1024; // 8MB - Dropbox JavaScript API suggested chunk size

        var workItems = [];
      
        var offset = 0;

        while (offset < file.size) {
          var chunkSize = Math.min(maxBlob, file.size - offset);
          workItems.push(file.slice(offset, offset + chunkSize));
          offset += chunkSize;
        } 
          
        const task = workItems.reduce((acc, blob, idx, items) => {
          if (idx == 0) {
            // Starting multipart upload of file
            return acc.then(function() {
              return dbx.filesUploadSessionStart({ close: false, contents: blob})
                        .then(response => response.result.session_id)
            });          
          } else if (idx < items.length-1) {  
            // Append part to the upload session
            return acc.then(function(sessionId) {
             var cursor = { session_id: sessionId, offset: idx * maxBlob };
             return dbx.filesUploadSessionAppendV2({ cursor: cursor, close: false, contents: blob }).then(() => sessionId); 
            });
          } else {
            // Last chunk of data, close session
            return acc.then(function(sessionId) {
              var cursor = { session_id: sessionId, offset: file.size - blob.size };
              var commit = { path: '/' + file.name, mode: 'add', autorename: true, mute: false };              
              return dbx.filesUploadSessionFinish({ cursor: cursor, commit: commit, contents: blob });           
            });
          }          
        }, Promise.resolve());
        
        task.then(function(result) {
          var results = document.getElementById('results');
          results.appendChild(document.createTextNode('File uploaded!'));
        }).catch(function(error) {
          console.error(error);
        });
        
      }*/
  return false;
}