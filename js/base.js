var APP_KEY = 'kj5lj89k7br0v46';
var APP_SECRET = 'px68axwvij1w561';

var REFRESH_TOKEN = localStorage.getItem('dbRefreshToken');
console.log(REFRESH_TOKEN);
var UID = localStorage.getItem('dbUID');

mdaBooksParams = ['', 'N', 'D', 'DS', 'LC', 'LCN', 'LTZ', 'LTF', 'LTS', 'LTDB', 'LTDE', 'LTLF', 'LTLS', 'LTDB', 'LTDE', 'DD'];
mdaChaptersParams = ['', 'N', 'D', 'DS', 'UNDEF', 'UNDEF', 'LTZ', 'LTF', 'LTS', 'LTDB', 'LTDE', 'LTLF', 'LTLS', 'LTDB', 'LTDE', 'DD'];

{
    // 0  - id      id
    // 1  - N       название
    // 2  - D       дата создания
    // 3  - DS      дата последнего скачивания с сервера
    // 4  - LC      последняя редактированная глава
    // 5  - LCN     название этой главы
    // 6  - LTZ     Число слов последней главы
    // 7  - LTF     Число слов, которое было при постановке цели
    // 8  - LTS     Число слов, которое нужно набрать
    // 9  - LTDB    Дата постановки цели
    // 10 - LTDE    Дата окончания цели
    // 11 - LTLF    Тоже лоя цели, только на большее время
    // 12 - LTLS    -//-
    // 13 - LTLB    -//-
    // 14 - LTLE    -//-
    // 15 - DD      Дата последнего редактирования на устройстве
}

function structDate(date) {
    let creationDate;
    if (date != undefined) {
        creationDate = new Date(date);
    } else {
        creationDate = new Date();
    }
    let creationDateS = mdaDateAddZero(creationDate.getDate()) + '.' + mdaDateAddZero(creationDate.getMonth() + 1) + '.' + creationDate.getFullYear();
    return creationDateS;
}

function structTime(date) {
    let creationDate;
    if (date != undefined) {
        creationDate = new Date(date);
    } else {
        creationDate = new Date();
    }
    let creationDateS = mdaDateAddZero(creationDate.getHours()) + ':' + mdaDateAddZero(creationDate.getMinutes()) + ':' + mdaDateAddZero(creationDate.getSeconds());
    return creationDateS;
}

function structDateTime(date) {
    let creationDateS = structDate(date) + ' ' + structTime(date);
    return creationDateS;
}

async function dbFileExists(folder, name, dbx) {
    // var dbx = new Dropbox.Dropbox({
    //     clientId: APP_KEY,
    //     clientSecret: APP_SECRET,
    //     refreshToken: REFRESH_TOKEN
    // });
    console.log('dbFileExist dbx = ');
    console.log(dbx);
    let length = 0;
    console.log('folder = ' + folder + '; name = ' + name);
    // await dbx.filesDownload({ path: folder + '/' + name })
    //     .then(function (response) {
    //         console.log('dbFileExist response = ');
    //         console.log(response);
    //         length = 1;
    //     })
    //     .catch(function (error) {
    //         console.error(error.error || error);
    //     })
    await dbx.filesSearch({ path: folder, query: name })
        .then(async function (response) {
            console.log('dbFileExist response = ');
            console.log(response);
            length = response.result.matches.length;
        })
        .catch(async function (error) {
            console.error(error.error || error);
        });

    if (length > 0) {
        return true;
    } else {
        return false;
    }
}

async function dbDownloadStringArray(folder, name, dbxin) {
    var dbx;
    if (!dbxin) {
        console.log('Создаю DBX!');
        dbx = new Dropbox.Dropbox({
            clientId: APP_KEY,
            clientSecret: APP_SECRET,
            refreshToken: REFRESH_TOKEN
        });
    } else {
        dbx = dbxin;
    }

    let res = null;
    await dbx.filesDownload({ path: folder + '/' + name })
        .then(function (response) {
            res = response.result.fileBlob;
        })
        .catch(function (error) {
            console.error(error.error || error);
        })

    if (res == null) {
        return null;
    } else {
        var tex = await res.text();
        var tex1 = tex.split('	');
        return tex1;
    }
}

async function dbDownloadStringArrays(folder, name, dbxin) {
    var dbx;
    if (!dbxin) {
        console.log('Создаю DBX!');
        dbx = new Dropbox.Dropbox({
            clientId: APP_KEY,
            clientSecret: APP_SECRET,
            refreshToken: REFRESH_TOKEN
        });
    } else {
        dbx = dbxin;
    }

    let res = null;
    await dbx.filesDownload({ path: folder + '/' + name })
        .then(function (response) {
            res = response.result.fileBlob;
        })
        .catch(function (error) {
            console.error(error.error || error);
        })
    if (res == null) {
        return res;
    } else {
        let tex = await res.text();
        return tex;
    }
}

function mdaStringToArray(tex) {
    if ((tex == null) || (tex == '')) {
        return [];
    } else {
        let tex1 = tex.split('			');
        let tex3 = [];
        for (let i = 0; i < tex1.length; i++) {
            let tex2 = tex1[i].split('		');
            tex3[i] = [];
            for (let j = 0; j < tex2.length; j++) {
                tex3[i][j] = tex2[j].split('	');
            }
        }
        return tex3;
    }
}

async function dbUploadStringArray(data, folder, name) {
    var dbx = new Dropbox.Dropbox({
        clientId: APP_KEY,
        clientSecret: APP_SECRET,
        refreshToken: REFRESH_TOKEN
    });

    console.log('UPLOAD DBX = ', dbx);

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

function mdaArrayToString(data) {
    if (data) {
        let jointData2 = [];
        let jointData1 = [];

        for (let i = 0; i < data.length; i++) {
            jointData2[i] = [];
            for (let j = 0; j < data[i].length; j++) {
                jointData2[i][j] = data[i][j].join('	');
            }
        }

        for (let i = 0; i < data.length; i++) {
            jointData1[i] = jointData2[i].join('		');
        }

        let jointData = jointData1.join('			');
        return jointData;
    } else {
        return null;
    }
}

async function dbUploadStringArrays(jointData, folder, name) {
    var dbx = new Dropbox.Dropbox({
        clientId: APP_KEY,
        clientSecret: APP_SECRET,
        refreshToken: REFRESH_TOKEN
    });

    console.log('UPLOAD DBX = ', dbx);

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

function mdaReadBooksAndChapters(rawReadedFiles) {
    let readedFiles = [];
    if (rawReadedFiles.length > 0) {
        for (let i = 0; i < rawReadedFiles.length; i++) {
            readedFiles[i] = [];
            readedFiles[i][0] = mdaReadRawBAC(rawReadedFiles[i][0], mdaBooksParams);
            for (let j = 1; j < rawReadedFiles[i].length; j++) {
                readedFiles[i][j] = mdaReadRawBAC(rawReadedFiles[i][j], mdaChaptersParams);
            }
        }
    }
    return readedFiles;
}

function mdaReadRawBAC(arrin, arrPrms) {
    let aro = [];
    if (arrin == null) {
        return aro;
    }
    // arr = arrin.slice(0);
    // let l = arr.length;
    let n = arrin[0];
    n = n.toString().replace(/\D/g, '');
    n = parseInt(n);
    // for (let i = 0; i < arrPrms.length; i++) {
    // let laro = aro.length;
    // aro.length = laro + 1;
    // aro[laro] = [];
    // aro[laro].length = arrPrms.length;
    for (let i = 0; i < arrPrms.length; i++) {
        let i1 = mdaFindParamI(arrin, n, arrPrms[i]);
        if (i1 > -1) {
            aro[i] = arrin[i1 + 1];
        }
    }
    //     l = arr.length;
    // }
    return aro;
}

// function mdaReadBooks(arrin, arrPrms) {
//     let arr, aro;
//     aro = [];
//     if (arrin == null) {
//         return aro;
//     }
//     arr = arrin.slice(0);
//     let l = arr.length;
//     let i = 0;
//     while (l > 1) {
//         let laro = aro.length;
//         aro.length = laro + 1;
//         aro[laro] = [];
//         aro[laro].length = arrPrms.length;
//         let n = arr[0];
//         n.replace(/\D/g, '');
//         n = parseInt(n);
//         for (let j = 0; j < arrPrms.length; j++) {
//             let i1 = mdaFindParamI(arr, n, arrPrms[j]);
//             if (i1 > -1) {
//                 aro[i][j] = arr[i1 + 1];
//                 arr.splice(i1, 2);
//             }
//         }
//         i++;
//         l = arr.length;
//     }
//     return aro;
// }

// function mdaSaveBooks(arr, arrPrms) {
//     let arro = [];
//     let l = arrPrms.length;
//     for (let i = 0; i < arr.length; i++) {
//         for (let j = 0; j < l; j++) {
//             if ((arr[i][j]) && (arr[i][j] != '')) {
//                 arro.push(i.toString() + arrPrms[j]);
//                 arro.push(arr[i][j]);
//             }
//         }
//     }
//     console.log(arro);
//     return arro;
// }

function mdaFindBookibyID(bac, id) {
    let fid = -1;
    for (let i = 0; i < bac.length; i++) {
        if (bac[i][0][0] == id) {
            fid = i;
            break;
        }
    }
    return fid;
}

function mdaFindChapteribyID(book, id) {
    let fid = -1;
    for (let i = 0; i < book.length; i++) {
        if (book[i][0] == id) {
            fid = i;
            break;
        }
    }
    return fid;
}

function mdaBacCompare(bacon, bacoff) {
    let compare = [[], [], [], []]; // 0 - сравниваемый онлайн, 1 - сравниваемый оффлайн, 3 - несравниваемый онлайн (нужно скачать), 4 - несравниваемый оффлайн (нужно загрузить)
    for (let i = 0; i < bacon.length; i++) {
        let compi = mdaFindBookibyID(bacoff, bacon[i][0][0]);
        if (compi > -1) {
            compare[0].push(bacon[i]);
            compare[1].push(bacoff[i]);
        } else {
            compare[3].push(bacon[i]);
        }
    }
    for (let i = 0; i < bacoff.length; i++) {
        let compi = mdaFindBookibyID(bacon, bacoff[i][0][0]);
        if (compi == -1) {
            compare[4].push(bacoff[i]);
        }
    }

    let comp = [];
    for (let i = 0; i < compare[0].length; i++) {
        comp[i] = [];
        let uncomp = [];
        for (let j = 0; j < compare[0][i].length; j++) {
            comp[i][j] = [];
            let compi = mdaFindChapteribyID(compare[1][i], compare[0][i][j][0]);
            if (compi > -1) {
                comp[i][j][0] = compare[0][i][j];
                comp[i][j][1] = compare[1][i][j];
            } else {
                uncomp.push(compare[0][i][j]);
            }
        }
        let l = comp[i].length;
        for (let j = 0; j < uncomp.length; j++) {
            comp[i][j + l] = [];
            comp[i][j + l][0] = uncomp[j];
        }
        uncomp = [];
        for (let j = 0; j < compare[0][i].length; j++) {
            let compi = mdaFindChapteribyID(compare[0][i], compare[1][i][j][0]);
            if (compi == -1) {
                uncomp.push(compare[1][i][j]);
            }
        }
        l = comp[i].length;
        for (let j = 0; j < uncomp.length; j++) {
            comp[i][j + l] = [];
            comp[i][j + l][1] = uncomp[j];
        }
    }

    let l = comp.length;
    for (let i = 0; i < compare[2].length; i++) {
        comp[i + l] = [];
        comp[i + l][0] = compare[2][i];
    }
    l = comp.length;
    for (let i = 0; i < compare[3].length; i++) {
        comp[i + l] = [];
        comp[i + l][0] = compare[3][i];
    }

    return comp;
}

function mdaSaveBooksAndChapters(bac) {
    let arro = null;
    if (bac.length > 0) {
        arro = [];
    }
    let lb = mdaBooksParams.length;
    let lc = mdaChaptersParams.length;
    for (let i = 0; i < bac.length; i++) {
        arro[i] = [];
        arro[i][0] = [];
        for (let k = 0; k < lb; k++) {
            if ((bac[i][0][k]) && (bac[i][0][k] != '')) {
                arro[i][0].push(i.toString() + mdaBooksParams[k]);
                arro[i][0].push(bac[i][0][k]);
            }
        }
        for (let j = 1; j < bac[i].length; j++) {
            arro[i][j] = [];
            for (let k = 0; k < lc; k++) {
                if ((bac[i][j][k]) && (bac[i][j][k] != '')) {
                    arro[i][j].push(i.toString() + mdaChaptersParams[k]);
                    arro[i][j].push(bac[i][j][k]);
                }
            }
        }
    }
    console.log(arro);
    return arro;
}

function mdaAddBook(bName, bac, arrPrms) {
    //console.log(bac);
    let l = 0;
    let found = false;
    if (bac) {
        l = bac.length;
        k = 0;
        while (!found) {
            found = true;
            k++;
            for (let i = 0; i < l; i++) {
                if (bac[i][0][0] == k) {
                    found = false;
                    break;
                }
            }
        }
    } else {
        k = 1;
        bac = [];
    }

    //bac.length = l + 1;
    bac[l] = [];
    bac[l][0] = [];
    //bac[l].length = arrPrms.length;
    bac[l][0][0] = (+(new Date())).toString();
    bac[l][0][1] = bName;
    bac[l][0][2] = bac[l][0][0];
    bac[l][0][3] = 0;
    bac[l][0][15] = bac[l][0][2];

    return k;
    //console.log(bac);
}


function mdaAddChapter(cName, book) {
    //console.log(chapters);
    l = book.length;
    book[l] = [];
    book[l].length = mdaChaptersParams.length;
    book[l][0] = (+(new Date())).toString();
    book[l][1] = cName;
    book[l][2] = book[l][0];
    book[l][3] = 0;
    book[l][15] = book[l][0];
}

function mdaCreateBookButtonHTML(book, i) {
    let creationDateS = 'не задано.';
    let creationTimeS = '';
    let editDateS = 'не задано.';
    let editTimeS = '';
    let lastChapter = '';

    if (book[2]) {
        let getDate = parseInt(book[2]);
        creationDateS = structDate(getDate) + ' ';
        creationTimeS = structTime(getDate);
    }

    if (book[3]) {
        let getDate = parseInt(book[3]);
        editDateS = structDate(getDate) + ' ';
        editTimeS = structTime(getDate);
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
    out += '<div class="dates"><div class="dates"><div>Созд.: ' + creationDateS + '</div> <div>' + creationTimeS + '</div></div><div class="dates"><div>Ред.: ' + editDateS + '</div> <div>' + editTimeS + '</div></div></div>';

    return out;
}

function mdaCreateChapterButtonHTML(chapter, i) {
    let creationDateS = 'не задано.';
    let creationTimeS = '';
    let editDateS = 'не задано.';
    let editTimeS = '';

    if (chapter[2]) {
        let getDate = parseInt(chapter[2]);
        creationDateS = structDate(getDate) + ' ';
        creationTimeS = structTime(getDate);
    }

    if (chapter[3]) {
        let getDate = parseInt(chapter[3]);
        editDateS = structDate(getDate) + ' ';
        editTimeS = structTime(getDate);
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
    out += 'Глава ' + i + ' — ' + chapter[1];
    out += '<div class="bars"><div class="barContainer"><div class="bar1" style="width: ' + ltPercentWords + '%">';
    out += '</div><div class="bar2" style="width: ' + ltPercentDayz + '%"></div></div><div class="barnum">' + ltNeededWordsS + '</div>';
    out += '<div class="barContainer"><div class="bar1" style="width: ' + ltlPercentWords + '%"></div><div class="bar2" style="width: ' + ltlPercentDayz + '%">';
    out += '</div></div><div class="barnum">' + ltlNeededWordsS + '/' + ltlDaysLeftS + '</div></div>';
    out += '<div class="dates"><div class="dates"><div>Созд.: ' + creationDateS + '</div> <div>' + creationTimeS + '</div></div><div class="dates"><div>Ред.: ' + editDateS + '</div> <div>' + editTimeS + '</div></div></div>';

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