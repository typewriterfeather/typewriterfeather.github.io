var APP_KEY = 'kj5lj89k7br0v46';
var APP_SECRET = 'px68axwvij1w561';

var REFRESH_TOKEN = localStorage.getItem('dbRefreshToken');
var UID = localStorage.getItem('dbUID');

mdaBooksParams = ['', 'D', 'DS', 'LC', 'LCN', 'LT1', 'LT2', 'LTD', 'LTL1', 'LTL2', 'LTD1', 'LTD2'];

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
        var tex1 = tex.split(',');
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

    let newFile = new Blob([data], { type: "octet/stream" });

    dbx.filesUpload({ path: folder + '/' + name, contents: newFile, mode: 'overwrite' })
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

function mdaReadBooks(arrin) {
    let arr, aro;
    arr = arrin.slice(0);
    aro = [];
    let l = arr.length;
    let i = 0;
    while (l > 1) {
        let laro = aro.length;
        aro.length = laro + 1;
        aro[laro] = [];
        aro[laro].length = mdaBooksParams.length;
        let n = arr[0];
        n.replace(/\D/g, '');
        n = parseInt(n);
        for (let j = 0; j < mdaBooksParams.length; j++) {
            let i1 = mdaFindParamI(arr, n, mdaBooksParams[j]);
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

function mdaSaveBooks(arr) {
    let arro = [];
    let l = mdaBooksParams.length;
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < l; j++) {
            if (arr[i][j] != null) {
                arro.push(i.toString() + mdaBooksParams[j]);
                arro.push(arr[i][j]);
            }
        }
    }
    return arro;
}