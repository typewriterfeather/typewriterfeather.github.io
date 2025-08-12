document.getElementById('pAccountName').innerHTML = 'UID: ' + UID;
var books = [];
//var books = ['1', '1', '1N', 'Name 1', '1D', '11.11.2011', '1DS', '12.11.2011', '1LC', '0', '2', '2', '2N', 'Name 2', '2D', '22.02.2002', '2DS', '23.02.2002', '2LC', '2', '4', '4', '4N', 'Name 4', '4D', '24.04.2004', '4DS', '25.04.2004', '4LC', '3', '7', '7', '7N', 'Name 7', '7D', '27.07.2007', '7DS', '28.07.2007', '7LC', '8'];

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
  //dbUploadStringArray(mdaSaveBooks(mdaReadBooks(books)), '', 'books.txt');
}

function addBook() {
  let bName = prompt('Введите название книги:', '');
  if ((bName) && (bName != '')) {
    mdaAddBook(bName, books);
  }
}

function findParam() {
  console.log(mdaSaveBooks(mdaReadBooks(books)));
}

function testFunc(n) {
  alert('Button: ' + n);
}

function testDate() {
  const parentElement = document.getElementById('books'); // DOM location when buttons will be added
  parentElement.replaceChildren();
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const btn = document.createElement("button");
    btn.innerHTML = mdaCreateBookButtonHTML(book, i);
    btn.setAttribute('class', 'buttonBook');
    btn.setAttribute('onclick', 'testFunc(' + i + ')');
    parentElement.appendChild(btn);
  }
}