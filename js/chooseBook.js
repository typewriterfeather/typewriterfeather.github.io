document.getElementById('pAccountName').innerHTML = 'UID: ' + UID;
var books = [];
var chapters = [];
var bac = []; // books and chapters
var choosedBook = -1;
var readedChaptersFromBook = -1;
var choosedChapter = -1;
var dbx = null;
var onlineStatus = false;
//var books = ['1', '1', '1N', 'Name 1', '1D', '11.11.2011', '1DS', '12.11.2011', '1LC', '0', '2', '2', '2N', 'Name 2', '2D', '22.02.2002', '2DS', '23.02.2002', '2LC', '2', '4', '4', '4N', 'Name 4', '4D', '24.04.2004', '4DS', '25.04.2004', '4LC', '3', '7', '7', '7N', 'Name 7', '7D', '27.07.2007', '7DS', '28.07.2007', '7LC', '8'];

async function test() {
  clearLocalStorage();
}

function test1(arr) {
  arr[1] = 23;
}

async function createDbx() {
  dbx = await new Dropbox.Dropbox({
    clientId: APP_KEY,
    clientSecret: APP_SECRET,
    refreshToken: REFRESH_TOKEN
  })
}

window.onload = async function () {
  await createDbx();
  //console.log('DBX:');
  //console.log(dbx);
  //await test();
  //await updateFiles(dbx);
  //await readFiles(dbx);
  await updateFiles(dbx);
  //log('ONLINE = ', onlineStatus);
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

async function updateFiles(dbxin) {
  let rawReadedFilesOnline = await dbDownloadStringArrays('', 'books.txt', dbxin);
  log('rawReadedFilesOnline', rawReadedFilesOnline);

  if (rawReadedFilesOnline == 'TypeError: Failed to fetch') {
    onlineStatus = false;
  } else {
    onlineStatus = true;
  }

  log('ONLINE', onlineStatus);

  let bacoff;
  if (bac.length > 0) {
    bacoff = bac;
  } else {
    let rawReadedFilesOffline = localStorage.getItem('bac');
    log('rawReadedFilesOffline', rawReadedFilesOffline);
    log('mdaStringToArray(rawReadedFilesOffline)', mdaStringToArray(rawReadedFilesOffline));
    bacoff = mdaReadBooksAndChapters(mdaStringToArray(rawReadedFilesOffline));
  }

  if (!onlineStatus) {
    bac = bacoff;
    saveBac(true, false);
  } else {
    if (rawReadedFilesOnline == 'DropboxResponseError: Response failed with a 409 code') {
      rawReadedFilesOnline = '';
    }
    let bacon = mdaReadBooksAndChapters(mdaStringToArray(rawReadedFilesOnline));

    log('bacoff', bacoff);

    let comp = mdaBacCompare(bacon, bacoff);
    let comp2 = mdaBacCompare2(bacon, bacoff);
    log('comp', comp);
    log('comp2', comp2);

    let uploadBooks = [];
    let downloadBooks = [];
    //let conflictBooks = [];
    let decision = [];

    for (let i = 0; i < comp.length; i++) {
      decision[i] = [];
      let b0 = comp[i][0][0];
      let b1 = comp[i][0][1];

      if (b0 && b1) {
        b0[16] = mdaStringReplaceChar(b0[16], 0, b1[16][0]);
        if (b1[16][0] == '0') {
          //log('Не РЕдактируется:', b1[1]);
          decision[i][0] = 0;
          // if ((b1[3]) && (b1[15])) {
          //   localStorage.removeItem(b0[0] + '_' + c0[0]);
          // }
          b0[3] = 0;
          b0[15] = 0;

        } else {
          //log('Сравнить BOOK', b0 + ' ' + b1);
          if (b0[3] == b1[3]) {
            if (b1[3] != b1[15]) {
              // Если нет конфликта и файл обновился на устройстве
              decision[i][0] = 1;
              b1[3] = b1[15];
              //uploadBooks.push(b1);
            } else {
              // Если нет конфликта и файл не обновлялся
              decision[i][0] = 0;
            }
          } else if (b1[3] == b1[15]) {
            // Если нет конфликта и файл обновился на сервере
            decision[i][0] = 0;
            //downloadBooks.push(b0);
          } else {
            // Если есть конфликт                           TODO TODO
            //log('Конфликт в книге:', b0[1] + '/' + b1[1]);
            if (b0[3] > b1[3]) {
              // Сохраняется более свежий файл!
              decision[i][0] = 0;
              //downloadBooks.push(b0);
            } else {
              decision[i][0] = 1;
              b1[3] = b1[15];
              //uploadBooks.push(b1);
            }
          }
        }
      } else if (b0) {
        // Если файл есть только на сервере
        //log('Download BOOK', b0);
        b0[16] = mdaStringReplaceChar(b0[16], 0, 0);
        decision[i][0] = 0;
        //downloadBooks.push(b0);
      } else {
        // Если файл есть только на устройстве
        //log('Upload BOOK', b1)
        decision[i][0] = 1;
        b1[3] = b1[15];
        //uploadBooks.push(b1);
      }
      
      for (let j = 1; j < comp[i].length; j++) {
        let c0 = comp[i][j][0];
        let c1 = comp[i][j][1];
        if (c0 && c1) {
          c0[16] = mdaStringReplaceChar(c0[16], 0, c1[16][0]);
          if (b1[16][0] == '0') {
            //log('Не РЕдактируется:', b1[1]);

            decision[i][j] = 0;
            c0[16] = mdaStringReplaceChar(c0[16], 0, 0);
            localStorage.removeItem(b0[0] + '_' + c0[0]);
            c0[3] = 0;
            c0[15] = 0;

          } else {
            //log('Сравнить', c0 + ' ' + c1);
            if (c0[3] == c1[3]) {
              if (c1[3] != c1[15]) {
                // Если нет конфликта и файл обновился на устройстве
                decision[i][j] = 1;
                c1[3] = c1[15];
                uploadBooks.push([b1, c1]);
              } else {
                // Если нет конфликта и файл не обновлялся
                decision[i][j] = 0;
              }
            } else if (b1[3] == b1[15]) {
              // Если нет конфликта и файл обновился на сервере
              decision[i][j] = 0;
              downloadBooks.push([b0, c0]);
            } else {
              // Если есть конфликт                           TODO TODO
              //log('Конфликт в книге:', b0[1] + '/' + b1[1] + ' - ' + c0[1] + '/' + c1[1]);
              if (c0[3] > c1[3]) {
                // Сохраняется более свежий файл!
                decision[i][j] = 0;
                downloadBooks.push([b0, c0]);
              } else {
                decision[i][j] = 1;
                c1[3] = c1[15];
                uploadBooks.push([b1, c1]);
              }
            }
          }
        } else if (c0) {
          // Если файл есть только на сервере
          //log('Download', c0)
          c0[16] = mdaStringReplaceChar(c0[16], 0, 0);
          decision[i][j] = 0;
          //downloadBooks.push([b0, c0]);
        } else {
          // Если файл есть только на устройстве
          //log('Upload', c1)
          decision[i][j] = 1;
          c1[3] = c1[15];
          uploadBooks.push([b1, c1]);
        }

      }

    }

    let connectionLost = false;

    //log('uploadBooks', uploadBooks);
    //log('downloadBooks', downloadBooks);

    for (let i = 0; i < uploadBooks.length; i++) {
      let name = uploadBooks[i][0][0] + '_' + uploadBooks[i][1][0];
      let dataText = localStorage.getItem(name);
      let condition = await dbUploadStringArrays(dataText, '', name, dbx);
      if (!condition) {
        connectionLost = true;
      }
    }
    //log('connectionLost on upload', await connectionLost);
    //connectionLost = false;
    for (let i = 0; i < downloadBooks.length; i++) {
      let name = downloadBooks[i][0][0] + '_' + downloadBooks[i][1][0];
      let dataText = await dbDownloadStringArrays('', name, dbx);
      if (dataText == null) {
        connectionLost = true;
      } else {
        localStorage.setItem(name, dataText);
      }
    }

    log('connectionLost', connectionLost);

    let rawBac = [];

    for (let i = 0; i < comp.length; i++) {
      rawBac[i] = [];
      for (let j = 0; j < comp[i].length; j++) {
        rawBac[i][j] = comp[i][j][decision[i][j]];
      }
    }

    log('rawBac', rawBac);

    bac = rawBac;

    saveBac(true, true);

    // if (!connectionLost) {
    //   bac = rawBac;
    // } else {
    //   //location.reload();
    // }
  }
}

async function saveBac(toLocal, toGlobal) {
  let filesToSave = mdaArrayToString(mdaSaveBooksAndChapters(bac));
  //log('mdaSaveBooksAndChapters(bac)', mdaSaveBooksAndChapters(bac));
  //log('filesToSave', filesToSave);
  if (toLocal) {
    localStorage.setItem('bac', filesToSave);
  }
  if (toGlobal) {
    await dbUploadStringArrays(filesToSave, '', 'books.txt', dbx);
  }
}

async function readFiles(dbxin) {
  let rawReadedFilesOnline = await dbDownloadStringArrays('', 'books.txt', dbxin);
  if (rawReadedFilesOnline == null) {
    onlineStatus = false;
  } else {
    onlineStatus = true;
  }
  let rawReadedFilesOffline = localStorage.getItem('bac');
  //console.log('rawReadedFilesOnline:');
  //console.log('#' + rawReadedFilesOnline + '#');

  let bacon = mdaReadBooksAndChapters(mdaStringToArray(rawReadedFilesOnline));



  let bacoff = mdaReadBooksAndChapters(mdaStringToArray(rawReadedFilesOffline));

  // console.log('mdaBacCompare');
  // if ((bacon && bacoff) && (bacon.length > 0) && (bacoff.length > 0)) {
  //   console.log(mdaBacCompare(bacon, bacoff));
  // }

  // console.log('bacon:');
  // console.log(bacon);
  // console.log('bacoff');
  // console.log(bacoff);
  bac = bacon;
  // console.log('mdaStringToArray(rawReadedFilesOnline)');
  // console.log(mdaStringToArray(rawReadedFilesOnline));
  // console.log('bac');
  // console.log(bac);
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
  await updateFiles(dbx);

  // let filesToSave = mdaArrayToString(mdaSaveBooksAndChapters(bac));
  // await dbUploadStringArrays(filesToSave, '', 'books.txt', dbx);
  // localStorage.setItem('bac', filesToSave);
}


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
  //log('bac', bac);
  for (let i = 0; i < bac.length; i++) {
    createBookButton(i, parentElement, true, false);
  }
  createButton(parentElement, 'Создать книгу', 'addBook', '')
}

function hideBooks() {
  const parentElement = document.getElementById('books');
  parentElement.replaceChildren();
}

async function startBookEditing() {
  hideBooks();
  setTitle('Обновление...');
  bac[choosedBook][0][16] = mdaStringReplaceChar(bac[choosedBook][0][16], 0, 1);
  await updateFiles(dbx);
  showBook();
}

async function stopBookEditing() {
  hideBooks();
  setTitle('Обновление...');
  if (bac[choosedBook][0][3] == bac[choosedBook][0][15]) {
    bac[choosedBook][0][16] = mdaStringReplaceChar(bac[choosedBook][0][16], 0, 0);
    await updateFiles(dbx);
    showBook();
  } else {
    alert('Нельзя перестать редактировать книгу, пока она не синхронизированна с сервером!');
  }
}

async function showBook() {
  setTitle('Список глав')
  const parentElement = document.getElementById('books');
  hideBooks();
  createBookButton(choosedBook, parentElement, false);
  createButton(parentElement, 'Настройки книги', 'showBookSettings', '');
  if (bac[choosedBook][0][16][0] == '0') {
    createButton(parentElement, 'Редактировать книгу', 'startBookEditing', '');
  } else {
    createButton(parentElement, 'Перестать редактировать книгу', 'stopBookEditing', '');
  }
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
  createButton(parentElement, 'Редактировать', 'editChapter', 'choosedBook, choosedChapter');
  createButton(parentElement, 'Задать цель на день', '', '');
  createButton(parentElement, 'Задать цель на определённый срок', '', '');
  createButton(parentElement, 'Вернуться назад', 'showBook', '');
  createButton(parentElement, 'Вернуться к списку книг', 'showBooks', '');
  createButton(parentElement, 'Изменить название главы', 'changeChapterName', '');
  createButton(parentElement, 'Удалить главу', 'deleteChapter', '');
}

async function editChapter(bn, cn) {
  alert(localStorage.getItem(bac[bn][0][0] + '_' + bac[bn][cn][0]));
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

function createBookButton(i, parentElement, isClickable, showDeleted) {
  const book = bac[i][0];
  if (book[16][1] == 0) {
    const btn = document.createElement("button");
    btn.innerHTML = mdaCreateBookButtonHTML(book, i);
    btn.setAttribute('class', 'buttonBook');
    if (isClickable) {
      btn.setAttribute('onclick', 'selectBook(' + i + ')');
    }
    parentElement.appendChild(btn);
  }
}

function createChapterButton(i, parentElement, isClickable, showDeleted) {
  const chapter = bac[choosedBook][i];
  if (chapter[16][1] == 0) {
    const btn = document.createElement("button");
    btn.innerHTML = mdaCreateChapterButtonHTML(bac[choosedBook][i], i);
    btn.setAttribute('class', 'buttonBook');
    if (isClickable) {
      btn.setAttribute('onclick', 'selectChapter(' + i + ')');
    }
    parentElement.appendChild(btn);
  }
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

function deleteBook(n) {
  let confirmDelete = confirm('Вы действительно хотите удалить книгу "' + bac[n][0][1] + '"?');
  if (confirmDelete) {
    let confirmDelete = confirm('Вы точно уверены, что хотите удалить книгу "' + bac[n][0][1] + '"? Книга будет удалена навсегда!!!');
    if (confirmDelete) {
      //bac.splice(i, 1);
      mdaDeleteBook(bac[n]);
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
      //bac[choosedBook].splice(choosedChapter, 1);
      mdaDeleteChapter(bac[choosedBook][choosedChapter]);
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
    //bac[choosedBook][0][15] = (+(new Date())).toString();
    mdaCommitChanges(bac[choosedBook][0]);
    saveFiles();
    showBook();
  }
}

function changeChapterName() {
  let bName = prompt('Введите новое название главы:', '');
  if ((bName) && (bName != '')) {
    bName.replace('	', '');
    bac[choosedBook][choosedChapter][1] = bName;
    //bac[choosedBook][choosedChapter][15] = (+(new Date())).toString();
    mdaCommitChanges(bac[choosedBook][choosedChapter]);
    saveFiles();
    showChapter();
  }
}