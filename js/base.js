var APP_KEY = 'kj5lj89k7br0v46';
var APP_SECRET = 'px68axwvij1w561';

var REFRESH_TOKEN = localStorage.getItem('dbRefreshToken');
var UID = localStorage.getItem('dbUID');

mdaBooksParams = ['', 'N', 'D', 'DS', 'LC', 'LCN', 'LTZ', 'LTF', 'LTS', 'LTDB', 'LTDE', 'LTLF', 'LTLS', 'LTDB', 'LTDE'];
mdaChaptersParams = ['', 'N', 'D', 'DS', 'UNDEF', 'UNDEF', 'LTZ', 'LTF', 'LTS', 'LTDB', 'LTDE', 'LTLF', 'LTLS', 'LTDB', 'LTDE'];

async function dbFileExists(folder, name) {
    var dbx = new Dropbox.Dropbox({
        clientId: APP_KEY,
        clientSecret: APP_SECRET,
        refreshToken: REFRESH_TOKEN
    });
    let length = 0;
    await dbx.filesSearch({ path: folder, query: name })
        .then(function (response) {
            length = response.result.matches.length;
        })
        .catch(function (error) {
            console.error(error.error || error);
        });

    if (length > 0) {
        return true;
    } else {
        return false;
    }
}

async function dbDownloadStringArray(folder, name) {
    var fileExists = await dbFileExists(folder, name);

    if (fileExists) {
        var dbx = new Dropbox.Dropbox({
            clientId: APP_KEY,
            clientSecret: APP_SECRET,
            refreshToken: REFRESH_TOKEN
        });
        let res = null;
        await dbx.filesDownload({ path: folder + '/' + name })
            .then(function (response) {
                res = response.result.fileBlob;
            })
            .catch(function (error) {
                console.error(error.error || error);
            })

        var tex = await res.text();
        var tex1 = tex.split('	');
        return tex1;
    } else {
        return null;
    }
}

async function dbUploadStringArray(data, folder, name) {
    var dbx = new Dropbox.Dropbox({
        clientId: APP_KEY,
        clientSecret: APP_SECRET,
        refreshToken: REFRESH_TOKEN
    });

    let jointData = data.join('	');
    //let newFile = new Blob(jointData, { type: "text/plain" });

    dbx.filesUpload({ path: folder + '/' + name, contents: jointData, mode: 'overwrite' })
        .then(function (response) {
            console.log('Массив строк загружен');
            console.log(response);
            return true;
        })
        .catch(function (error) {
            console.error(error.error || error);
            return false;
        });
}

function mdaFindParamI(arr, n, param) { //My Data Array
    const nparam = n.toString() + param;
    var found = false;
    let i;
    for (i = 0; i < arr.length / 2; i++) {
        if (arr[i * 2] == nparam) {
            found = true;
            break;
        }
    }
    i = i * 2;
    if (found) {
        return i;
    } else {
        return -1;
    }
}

function mdaWriteParam(arr, n, param, data) {
    const nparam = n.toString() + param;
    let i = mdaFindParamI(arr, n, param);
    if (i > -1) {
        arr[i + 1] = data;
    } else {
        i = arr.length;
        arr[i] = nparam;
        arr[i + 1] = data;
    }
}

function mdaReadBooks(arrin, arrPrms) {
    let arr, aro;
    aro = [];
    if (arrin == null) {
        return aro;
    }
    arr = arrin.slice(0);
    let l = arr.length;
    let i = 0;
    while (l > 1) {
        let laro = aro.length;
        aro.length = laro + 1;
        aro[laro] = [];
        aro[laro].length = arrPrms.length;
        let n = arr[0];
        n.replace(/\D/g, '');
        n = parseInt(n);
        for (let j = 0; j < arrPrms.length; j++) {
            let i1 = mdaFindParamI(arr, n, arrPrms[j]);
            if (i1 > -1) {
                aro[i][j] = arr[i1 + 1];
                arr.splice(i1, 2);
            }
        }
        i++;
        l = arr.length;
    }
    return aro;
}

function mdaSaveBooks(arr, arrPrms) {
    let arro = [];
    let l = arrPrms.length;
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < l; j++) {
            if ((arr[i][j]) && (arr[i][j] != '')) {
                arro.push(i.toString() + arrPrms[j]);
                arro.push(arr[i][j]);
            }
        }
    }
    console.log(arro);
    return arro;
}

function mdaAddBook(bName, books, arrPrms) {
    //console.log(books);
    let l = books.length;
    let found = false;
    k = 0;
    while (!found) {
        found = true;
        k++;
        for (let i = 0; i < l; i++) {
            if (books[i][0] == k) {
                found = false;
                break;
            }
        }
    }

    books.length = l + 1;
    books[l] = [];
    books[l].length = arrPrms.length;
    books[l][0] = k;
    books[l][1] = bName;
    books[l][2] = (+(new Date())).toString();
    //console.log(books);
}

function mdaAddChapter(cName, chapters, arrPrms) {
    //console.log(chapters);
    let l = chapters.length;
    let found = false;
    k = 0;
    while (!found) {
        found = true;
        k++;
        for (let i = 0; i < l; i++) {
            if (chapters[i][0] == k) {
                found = false;
                break;
            }
        }
    }

    chapters.length = l + 1;
    chapters[l] = [];
    chapters[l].length = arrPrms.length;
    chapters[l][0] = k;
    chapters[l][1] = cName;
    chapters[l][2] = (+(new Date())).toString();
    //console.log(chapters);
}

function mdaCreateBookButtonHTML(book, i) {
    let creationDateS = 'не задано.';
    let editDateS = 'не задано.';
    let lastChapter = '';

    if (book[2]) {
        let creationDate = new Date(parseInt(book[2]));
        creationDateS = mdaDateAddZero(creationDate.getDay()) + '.' + mdaDateAddZero(creationDate.getMonth()) + '.' + creationDate.getFullYear();
    }

    if (book[3]) {
        let editDate = new Date(parseInt(book[3]));
        editDateS = mdaDateAddZero(editDate.getDay()) + '.' + mdaDateAddZero(editDate.getMonth()) + '.' + editDate.getFullYear();
    }

    if (book[4]) {
        lastChapter = '<br>Глава ' + book[4];
        if (book[5]) {
            lastChapter += ' — ' + book[5];
        }
    }

    let todayDate = new Date();

    let ltNeededWordsS = '-';
    let ltPercentWords = 0;
    let ltPercentDayz = 0;

    if (book[6] && book[7] && book[8] && book[9] && book[10]) {
        let lt0 = parseInt(book[6]);
        let lt1 = parseInt(book[7]);
        let lt2 = parseInt(book[8]);
        let ltdb = parseInt(book[9]);
        let ltde = parseInt(book[10]);
        let ltNeededWords = lt2 - lt1;
        let ltWordsFull = lt2 - lt0;
        if (ltWordsFull == 0) {
            ltWordsFull = 10000000;
        }
        ltPercentWords = Math.ceil((lt1 - lt0) / ltWordsFull * 100);
        let ltDaysLeft = Math.ceil((ltde - todayDate) / 86400000);
        let ltDaysFull = Math.ceil((ltde - ltdb) / 86400000);
        ltPercentDayz = Math.ceil((ltDaysFull - ltDaysLeft) / ltDaysFull * 100);

        ltPercentWords = clampNumber(ltPercentWords, 0, 100);
        ltPercentDayz = clampNumber(ltPercentDayz, 0, 100);

        ltNeededWordsS = ltNeededWords;
    }

    let ltlNeededWordsS = '-';
    let ltlDaysLeftS = '-';
    let ltlPercentWords = 0;
    let ltlPercentDayz = 0;

    if (book[6] && book[11] && book[12] && book[13] && book[14]) {
        let ltl0 = parseInt(book[6]);
        let ltl1 = parseInt(book[11]);
        let ltl2 = parseInt(book[12]);
        let ltldb = parseInt(book[13]);
        let ltlde = parseInt(book[14]);
        let ltlNeededWords = ltl2 - ltl1;
        let ltlWordsFull = ltl2 - ltl0;
        if (ltlWordsFull == 0) {
            ltlWordsFull = 10000000;
        }
        ltPercentWords = Math.ceil((ltl1 - ltl0) / ltlWordsFull * 100);
        let ltlDaysLeft = Math.ceil((ltlde - todayDate) / 86400000);
        let ltlDaysFull = Math.ceil((ltlde - ltldb) / 86400000);
        ltlPercentDayz = Math.ceil((ltlDaysFull - ltlDaysLeft) / ltlDaysFull * 100);
        ltlPercentWords = clampNumber(ltlPercentWords, 0, 100);
        ltlPercentDayz = clampNumber(ltlPercentDayz, 0, 100);

        ltlNeededWordsS = ltlNeededWords;
        ltlDaysLeftS = ltlDaysLeft;
    }

    let out = '';
    out += book[1] + lastChapter;
    out += '<div class="bars"><div class="barContainer"><div class="bar1" style="width: ' + ltPercentWords + '%">';
    out += '</div><div class="bar2" style="width: ' + ltPercentDayz + '%"></div></div><div class="barnum">' + ltNeededWordsS + '</div>';
    out += '<div class="barContainer"><div class="bar1" style="width: ' + ltlPercentWords + '%"></div><div class="bar2" style="width: ' + ltlPercentDayz + '%">';
    out += '</div></div><div class="barnum">' + ltlNeededWordsS + '/' + ltlDaysLeftS + '</div></div>';
    out += '<div class="dates"><div>Созд.: ' + creationDateS + '</div><div>Ред.: ' + editDateS + '</div></div>';

    return out;
}

function mdaCreateChapterButtonHTML(chapter, i) {
    let creationDateS = 'не задано.';
    let editDateS = 'не задано.';
    let lastChapter = '';

    if (chapter[2]) {
        let creationDate = new Date(parseInt(chapter[2]));
        creationDateS = mdaDateAddZero(creationDate.getDay()) + '.' + mdaDateAddZero(creationDate.getMonth()) + '.' + creationDate.getFullYear();
    }

    if (chapter[3]) {
        let editDate = new Date(parseInt(chapter[3]));
        editDateS = mdaDateAddZero(editDate.getDay()) + '.' + mdaDateAddZero(editDate.getMonth()) + '.' + editDate.getFullYear();
    }

    if (chapter[4]) {
        lastChapter = '<br>Глава ' + chapter[4];
        if (chapter[5]) {
            lastChapter += ' — ' + chapter[5];
        }
    }

    let todayDate = new Date();

    let ltNeededWordsS = '-';
    let ltPercentWords = 0;
    let ltPercentDayz = 0;

    if (chapter[6] && chapter[7] && chapter[8] && chapter[9] && chapter[10]) {
        let lt0 = parseInt(chapter[6]);
        let lt1 = parseInt(chapter[7]);
        let lt2 = parseInt(chapter[8]);
        let ltdb = parseInt(chapter[9]);
        let ltde = parseInt(chapter[10]);
        let ltNeededWords = lt2 - lt1;
        let ltWordsFull = lt2 - lt0;
        if (ltWordsFull == 0) {
            ltWordsFull = 10000000;
        }
        ltPercentWords = Math.ceil((lt1 - lt0) / ltWordsFull * 100);
        let ltDaysLeft = Math.ceil((ltde - todayDate) / 86400000);
        let ltDaysFull = Math.ceil((ltde - ltdb) / 86400000);
        ltPercentDayz = Math.ceil((ltDaysFull - ltDaysLeft) / ltDaysFull * 100);

        ltPercentWords = clampNumber(ltPercentWords, 0, 100);
        ltPercentDayz = clampNumber(ltPercentDayz, 0, 100);

        ltNeededWordsS = ltNeededWords;
    }

    let ltlNeededWordsS = '-';
    let ltlDaysLeftS = '-';
    let ltlPercentWords = 0;
    let ltlPercentDayz = 0;

    if (chapter[6] && chapter[11] && chapter[12] && chapter[13] && chapter[14]) {
        let ltl0 = parseInt(chapter[6]);
        let ltl1 = parseInt(chapter[11]);
        let ltl2 = parseInt(chapter[12]);
        let ltldb = parseInt(chapter[13]);
        let ltlde = parseInt(chapter[14]);
        let ltlNeededWords = ltl2 - ltl1;
        let ltlWordsFull = ltl2 - ltl0;
        if (ltlWordsFull == 0) {
            ltlWordsFull = 10000000;
        }
        ltPercentWords = Math.ceil((ltl1 - ltl0) / ltlWordsFull * 100);
        let ltlDaysLeft = Math.ceil((ltlde - todayDate) / 86400000);
        let ltlDaysFull = Math.ceil((ltlde - ltldb) / 86400000);
        ltlPercentDayz = Math.ceil((ltlDaysFull - ltlDaysLeft) / ltlDaysFull * 100);
        ltlPercentWords = clampNumber(ltlPercentWords, 0, 100);
        ltlPercentDayz = clampNumber(ltlPercentDayz, 0, 100);

        ltlNeededWordsS = ltlNeededWords;
        ltlDaysLeftS = ltlDaysLeft;
    }

    let out = '';
    out += 'Глава ' + (i+1) + ' — ' + chapter[1] + lastChapter;
    out += '<div class="bars"><div class="barContainer"><div class="bar1" style="width: ' + ltPercentWords + '%">';
    out += '</div><div class="bar2" style="width: ' + ltPercentDayz + '%"></div></div><div class="barnum">' + ltNeededWordsS + '</div>';
    out += '<div class="barContainer"><div class="bar1" style="width: ' + ltlPercentWords + '%"></div><div class="bar2" style="width: ' + ltlPercentDayz + '%">';
    out += '</div></div><div class="barnum">' + ltlNeededWordsS + '/' + ltlDaysLeftS + '</div></div>';
    out += '<div class="dates"><div>Созд.: ' + creationDateS + '</div><div>Ред.: ' + editDateS + '</div></div>';

    return out;
}

function mdaDateAddZero(day) {
    let out = day.toString();
    if (day < 10) {
        out = '0' + out;
    }
    return out;
}

function clampNumber(val, min, max) {
    return Math.min(Math.max(val, min), max);
}