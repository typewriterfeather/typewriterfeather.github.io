document.getElementById('pAccountName').innerHTML = 'UID: ' + UID;
var books = [[]];
//var books = ['1', 'Name 1', '1D', '11.11.2011', '1DS', '12.11.2011', '1LC', '0', '2', 'Name 2', '2D', '22.02.2002', '2DS', '23.02.2002', '2LC', '2', '4', 'Name 4', '4D', '24.04.2004', '4DS', '25.04.2004', '4LC', '3', '7', 'Name 7', '7D', '27.07.2007', '7DS', '28.07.2007', '7LC', '8'];

function Exit() {
  let confirmExit = confirm('Вы действительно хотите выйти?');
  if (confirmExit) {
    localStorage.removeItem('dbRefreshToken');
    location.href = "index.html";
  }
}

async function findFiles() {
  const finded = await dbFileExists('', 'books');
  console.log(finded);
}

async function readFiles() {
  let rawBooks = await dbDownloadStringArray('', 'books.txt');
  console.log(rawBooks);
  books = mdaReadBooks(rawBooks);
  console.log(books);
}

async function saveFiles() {
  dbUploadStringArray(mdaSaveBooks(books), '', 'books.txt');
}

async function addBook() {
  //mdaWriteParam(books, 1, '', 'NOOOO')
  //console.log(mdaFindParamI(books, '', ''));
  //let l = books.length;
  //books[l] = '' + l;
  //books[l+1] = '' + (l + 1);
  //document.getElementById('textOutput').innerText = books;  
}

function findParam() {
  console.log(mdaSaveBooks(mdaReadBooks(books)));
}