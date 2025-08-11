

document.getElementById('pAccountName').innerHTML = 'UID:' + UID;

function Exit() {
  let confirmExit = confirm('Вы действительно хотите выйти?');
  if ( confirmExit ) {
    localStorage.removeItem('dbRefreshToken');
    location.href = "index.html";
  }
}