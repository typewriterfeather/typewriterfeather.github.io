document.getElementById('pAccountName').innerHTML = 'UID: ' + UID;
var books = [];
var chapters = [];
var choosedBook = -1;
var readedChaptersFromBook = -1;
var choosedChapter = -1;
//var books = ['1', '1', '1N', 'Name 1', '1D', '11.11.2011', '1DS', '12.11.2011', '1LC', '0', '2', '2', '2N', 'Name 2', '2D', '22.02.2002', '2DS', '23.02.2002', '2LC', '2', '4', '4', '4N', 'Name 4', '4D', '24.04.2004', '4DS', '25.04.2004', '4LC', '3', '7', '7', '7N', 'Name 7', '7D', '27.07.2007', '7DS', '28.07.2007', '7LC', '8'];

window.onload = async function () {
  await readFiles();
  showBooks();
}

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
  books = mdaReadBooks(rawBooks, mdaBooksParams);
  console.log(books);
}

async function readChapters() {
  if (readedChaptersFromBook != choosedBook) {
    readedChaptersFromBook = choosedBook;
    let rawChapters = await dbDownloadStringArray('', choosedBook + '.txt');
    console.log(rawChapters);
    chapters = mdaReadBooks(rawChapters, mdaChaptersParams);
    console.log(chapters);
  }
}

async function saveFiles() {
  dbUploadStringArray(mdaSaveBooks(books, mdaBooksParams), '', 'books.txt');
}

async function saveChapters() {
  dbUploadStringArray(mdaSaveBooks(chapters, mdaChaptersParams), '', choosedBook + '.txt');
}

function addBook() {
  let bName = prompt('Введите название книги:', '');
  if ((bName) && (bName != '')) {
    bName.replace('	', '');
    mdaAddBook(bName, books, mdaBooksParams);
  }
  saveFiles();
  showBooks();
}

function addChapter() {
  let cName = prompt('Введите название главы:', '');
  if ((cName) && (cName != '')) {
    cName.replace('	', '');
    mdaAddChapter(cName, chapters, mdaChaptersParams);
  }
  saveChapters();
  showBook();
}

function selectBook(n) {
  choosedBook = n;
  setTitle('Загрузка глав...');
  hideBooks();
  showBook();
  //alert('Button: ' + n);
}

function selectChapter(n) {
  choosedChapter = n;
  hideBooks();
  showChapter();
  //alert('Button: ' + n);
}

function showBooks() {
  setTitle('Список книг');
  const parentElement = document.getElementById('books');
  hideBooks();
  for (let i = 0; i < books.length; i++) {
    createBookButton(i, parentElement, true)
  }
  createButton(parentElement, 'Создать книгу', 'addBook', '')
}

function hideBooks() {
  const parentElement = document.getElementById('books');
  parentElement.replaceChildren();
}

async function showBook() {
  await readChapters();
  setTitle('Список глав')
  const parentElement = document.getElementById('books');
  hideBooks();
  createBookButton(choosedBook, parentElement, false);
  createButton(parentElement, 'Настройки книги', 'showBookSettings', '');
  createButton(parentElement, 'Вернуться к списку книг', 'showBooks', '');
  createButton(parentElement, 'СОДЕРЖАНИЕ', '', '');
  for (let i = 0; i < chapters.length; i++) {
    createChapterButton(i, parentElement, true)
  }
  createButton(parentElement, 'Добавить главу', 'addChapter', '');
}
async function showChapter() {
  setTitle('Глава — ' + (choosedChapter + 1))
  const parentElement = document.getElementById('books');
  hideBooks();
  createChapterButton(choosedChapter, parentElement, false)
  createButton(parentElement, 'Редактировать', '', '');
  createButton(parentElement, 'Задать цель на день', '', '');
  createButton(parentElement, 'Задать цель на определённый срок', '', '');
  createButton(parentElement, 'Вернуться назад', 'showBook', '');
  createButton(parentElement, 'Вернуться к списку книг', 'showBooks', '');
  createButton(parentElement, 'Изменить название главы', 'changeChapterName', '');
  createButton(parentElement, 'Удалить главу', 'deleteChapter', '');
}

function showBookSettings() {
  setTitle('Настройки книги')
  const parentElement = document.getElementById('books');
  hideBooks();
  createBookButton(choosedBook, parentElement, false);
  createButton(parentElement, 'Изменить название книги', 'changeBookName', '');
  createButton(parentElement, 'Удалить книгу', 'deleteBook', choosedBook);
  createButton(parentElement, 'Вернуться назад', 'showBook', '');
  createButton(parentElement, 'Вернуться к списку книг', 'showBooks', '');
}

function createBookButton(i, parentElement, isClickable) {
  const book = books[i];
  const btn = document.createElement("button");
  btn.innerHTML = mdaCreateBookButtonHTML(book, i);
  btn.setAttribute('class', 'buttonBook');
  if (isClickable) {
    btn.setAttribute('onclick', 'selectBook(' + i + ')');
  }
  parentElement.appendChild(btn);
}

function createChapterButton(i, parentElement, isClickable) {
  const chapter = chapters[i];
  const btn = document.createElement("button");
  btn.innerHTML = mdaCreateChapterButtonHTML(chapter, i);
  btn.setAttribute('class', 'buttonBook');
  if (isClickable) {
    btn.setAttribute('onclick', 'selectChapter(' + i + ')');
  }
  parentElement.appendChild(btn);
}

function createButton(parentElement, lable, func, funcprm) {
  const btn = document.createElement("button");
  btn.innerHTML = '<br>' + lable + '<br><br>';
  btn.setAttribute('class', 'buttonBook');
  if (func != '') {
    btn.setAttribute('onclick', func + '(' + funcprm + ')');
  } else {
    btn.setAttribute('disabled', '');
  }
  parentElement.appendChild(btn);
}

function setTitle(title) {
  document.getElementById('booksTitle').innerText = title;
}

function deleteBook(i) {
  let confirmDelete = confirm('Вы действительно хотите удалить книгу "' + books[i][1] + '"?');
  if (confirmDelete) {
    let confirmDelete = confirm('Вы точно уверены, что хотите удалить книгу "' + books[i][1] + '"? Книга будет удалена навсегда!!!');
    if (confirmDelete) {
      books.splice(i, 1);
      showBooks();
      saveFiles();
    }
  }
}

function deleteChapter() {
  let confirmDelete = confirm('Вы действительно хотите удалить Главу ' + (choosedChapter + 1) + '—' + chapters[choosedChapter][1] + '?');
  if (confirmDelete) {
    let confirmDelete = confirm('Вы точно уверены, что хотите удалить Главу ' + (choosedChapter + 1) + '—' + chapters[choosedChapter][1] + '? Глава будет удалена навсегда!!!');
    if (confirmDelete) {
      chapters.splice(choosedChapter, 1);
      showBook();
      saveChapters();
    }
  }
}

function test() {
  todayDate = new Date();
  alert(todayDate.getTime())
}

function changeBookName() {
  let bName = prompt('Введите новое название книги:', '');
  if ((bName) && (bName != '')) {
    bName.replace('	', '');
    books[choosedBook][1] = bName;
    saveFiles();
    showBook();
  }
}

function changeChapterName() {
  let bName = prompt('Введите новое название главы:', '');
  if ((bName) && (bName != '')) {
    bName.replace('	', '');
    chapters[choosedChapter][1] = bName;
    saveChapters();
    showChapter();
  }
}