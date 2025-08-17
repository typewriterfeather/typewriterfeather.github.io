document.getElementById('pAccountName').innerHTML = 'UID: ' + UID;
var books = [];
var chapters = [];
var bac = []; // books and chapters
var choosedBook = -1;
var readedChaptersFromBook = -1;
var choosedChapter = -1;
//var books = ['1', '1', '1N', 'Name 1', '1D', '11.11.2011', '1DS', '12.11.2011', '1LC', '0', '2', '2', '2N', 'Name 2', '2D', '22.02.2002', '2DS', '23.02.2002', '2LC', '2', '4', '4', '4N', 'Name 4', '4D', '24.04.2004', '4DS', '25.04.2004', '4LC', '3', '7', '7', '7N', 'Name 7', '7D', '27.07.2007', '7DS', '28.07.2007', '7LC', '8'];

window.onload = async function () {
  let dbx = await new Dropbox.Dropbox({
    clientId: APP_KEY,
    clientSecret: APP_SECRET,
    refreshToken: REFRESH_TOKEN
  });
  await readFiles(dbx);
  //await readChapters(dbx);
  showBooks();
}

function Exit() {
  let confirmExit = confirm('Вы действительно хотите выйти?');
  if (confirmExit) {
    localStorage.removeItem('dbRefreshToken');
    location.href = "index.html";
  }
}

async function test() {
  let testArray = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  test1(testArray[1]);
  console.log('TEST');
  console.log(testArray);
}

function test1(arr) {
  arr[1] = 23;
}

async function readFiles(dbxin) {
  let rawReadedFilesOnline = await dbDownloadStringArrays('', 'books.txt', dbxin);
  let rawReadedFilesOffline = localStorage.getItem('bac')
  console.log('rawReadedFilesOnline:');
  console.log('#' + rawReadedFilesOnline + '#');

  let bacon = mdaReadBooksAndChapters(mdaStringToArray(rawReadedFilesOnline));



  let bacoff = mdaReadBooksAndChapters(mdaStringToArray(rawReadedFilesOffline));

  console.log('mdaBacCompare');
  if ((bacon && bacoff) && (bacon.length > 0) && (bacoff.length > 0)) {
    console.log(mdaBacCompare(bacon, bacoff));
  }

  console.log('bacon:');
  console.log(bacon);
  console.log('bacoff');
  console.log(bacoff);
  bac = bacon;
  console.log('mdaStringToArray(rawReadedFilesOnline)');
  console.log(mdaStringToArray(rawReadedFilesOnline));
  console.log('bac');
  console.log(bac);
  // books = readedBooksAndChapters[0];
  // let l = readedBooksAndChapters.length;
  // chapters.length = l - 1;
  // for (let i = 1; i < l; i++) {
  //   chapters[i - 1] = readedBooksAndChapters[i];
  // }
  // console.log('books:');
  // console.log(books);
}

// async function readChapters(dbxin) {
//   console.log('Загрузка глав!');
//   chapters = [];
//   chapters.length = books.length;
//   for (let i = 0; i < books.length; i++) {
//     chapters[i] = [];
//     console.log(books[i][0] + '.txt');
//     let rawChapters = await dbDownloadStringArray('', books[i][0] + '.txt', dbxin);
//     console.log('rawChapters');
//     console.log(rawChapters);
//     chapters[i] = mdaReadBooks(rawChapters, mdaChaptersParams);
//     console.log('chapters[i]');
//     console.log(chapters[i]);
//   }
// }

async function saveFiles() {
  //dbUploadStringArray(mdaSaveBooks(books, mdaBooksParams), '', 'books.txt');
  let filesToSave = mdaArrayToString(mdaSaveBooksAndChapters(bac));
  await dbUploadStringArrays(filesToSave, '', 'books.txt');
  localStorage.setItem('bac', filesToSave);
}

// async function saveChapters() {
//   dbUploadStringArray(mdaSaveBooks(chapters[choosedBook], mdaChaptersParams), '', books[choosedBook][0] + '.txt');
// }

async function addBook() {
  let bName = prompt('Введите название книги:', '');
  if ((bName) && (bName != '')) {
    bName.replace('	', '');
    mdaAddBook(bName, bac, mdaBooksParams);
    await saveFiles();
    //let k = books.length - 1;

    //chapters[k] = [];
    //choosedBook = k;

    //await saveChapters();
    showBooks();

    choosedBook = -1;
  }
}

function addChapter() {
  let cName = prompt('Введите название главы:', '');
  if ((cName) && (cName != '')) {
    cName.replace('	', '');
    mdaAddChapter(cName, bac[choosedBook]);
    console.log('Chapter added');
    console.log(bac);
    saveFiles();
    showBook();
  }
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
  for (let i = 0; i < bac.length; i++) {
    createBookButton(i, parentElement, true)
  }
  createButton(parentElement, 'Создать книгу', 'addBook', '')
}

function hideBooks() {
  const parentElement = document.getElementById('books');
  parentElement.replaceChildren();
}

async function showBook() {
  setTitle('Список глав')
  const parentElement = document.getElementById('books');
  hideBooks();
  createBookButton(choosedBook, parentElement, false);
  createButton(parentElement, 'Настройки книги', 'showBookSettings', '');
  createButton(parentElement, 'Вернуться к списку книг', 'showBooks', '');
  createButton(parentElement, 'СОДЕРЖАНИЕ', '', '');
  if (bac[choosedBook]) {
    for (let i = 1; i < bac[choosedBook].length; i++) {
      createChapterButton(i, parentElement, true)
    }
  }
  createButton(parentElement, 'Добавить главу', 'addChapter', '');
}

async function showChapter() {
  setTitle('Глава — ' + (choosedChapter))
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
  const book = bac[i][0];
  const btn = document.createElement("button");
  btn.innerHTML = mdaCreateBookButtonHTML(book, i);
  btn.setAttribute('class', 'buttonBook');
  if (isClickable) {
    btn.setAttribute('onclick', 'selectBook(' + i + ')');
  }
  parentElement.appendChild(btn);
}

function createChapterButton(i, parentElement, isClickable) {
  const chapter = bac[choosedBook][i];
  const btn = document.createElement("button");
  btn.innerHTML = mdaCreateChapterButtonHTML(bac[choosedBook][i], i);
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
  let confirmDelete = confirm('Вы действительно хотите удалить книгу "' + bac[i][0][1] + '"?');
  if (confirmDelete) {
    let confirmDelete = confirm('Вы точно уверены, что хотите удалить книгу "' + bac[i][0][1] + '"? Книга будет удалена навсегда!!!');
    if (confirmDelete) {
      bac.splice(i, 1);
      //chapters.splice(i, 1);
      showBooks();
      saveFiles();
      // if (choosedChapter >= 0) {
      //   choosedBook -= 1;
      // }
    }
  }
}

function deleteChapter() {
  let confirmDelete = confirm('Вы действительно хотите удалить Главу ' + choosedChapter + '—' + bac[choosedBook][choosedChapter][1] + '?');
  if (confirmDelete) {
    let confirmDelete = confirm('Вы точно уверены, что хотите удалить Главу ' + choosedChapter + '—' + bac[choosedBook][choosedChapter][1] + '? Глава будет удалена навсегда!!!');
    if (confirmDelete) {
      bac[choosedBook].splice(choosedChapter, 1);
      showBook();
      saveFiles();
    }
  }
}

function changeBookName() {
  let bName = prompt('Введите новое название книги:', '');
  if ((bName) && (bName != '')) {
    bName.replace('	', '');
    bac[choosedBook][0][1] = bName;
    bac[choosedBook][0][15] = (+(new Date())).toString();
    saveFiles();
    showBook();
  }
}

function changeChapterName() {
  let bName = prompt('Введите новое название главы:', '');
  if ((bName) && (bName != '')) {
    bName.replace('	', '');
    bac[choosedBook][choosedChapter][1] = bName;
    bac[choosedBook][choosedChapter][15] = (+(new Date())).toString();
    saveFiles();
    showChapter();
  }
}