const compare = require('./node-deb-version-compare/lib');
const dataOriginOne = document.querySelector('.data-origin-One');
const dataOriginTwo = document.querySelector('.data-origin-Two');
const searchbox = document.querySelector('.search-box');
const searchbtn = document.querySelector('.search-btn');
const exportfile = document.querySelector('.export-file');
const displayarea = document.querySelector('.display-area');
const arrTemplate = {
    Packagename: '',
    Version1: '',
    Version2: '',
    compare: '',
    newVersion: '',
};

function processingData(data, packageListObj, PackagenameList) {
    data.split('\n\n')
        .forEach(item => {
            const packageItem = {};
            let packageName = '';
            let packageVersion = '';
            const PackagenameItem = {...arrTemplate};
            item
                .split('\n')
                .filter(row => row.startsWith('Package') || row.startsWith('Version'))
                .forEach(value => {
                    if (value.startsWith('Package')) {
                        packageName = value.split(':')[1];
                        PackagenameItem.Packagename = value.split(':')[1];
                    } else {
                        packageVersion = value.split(':')[1];
                    }
                    packageItem[packageName] = packageVersion;
                });
            packageListObj[packageName] = packageItem;
            PackagenameList.push(PackagenameItem);
        },
        );
}

function ajax(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(xhr.response);
                }
            }
        };
    });
}

Promise.all([ajax(dataOriginOne.value), ajax(dataOriginTwo.value)]).then(([dataOriginfileOne, dataOriginfileTwo]) => {
    const dataArrayOne = [];
    const dataArrayTwo = [];
    const packageNameListOne = [];
    const PackagenamelistTwo = [];

    processingData(dataOriginfileOne, dataArrayOne, packageNameListOne);
    processingData(dataOriginfileTwo, dataArrayTwo, PackagenamelistTwo);
    const totalPackagenamelist = [...packageNameListOne, ...PackagenamelistTwo];

    const has = {};
    const finalData = totalPackagenamelist
        .reduce((item, next) => {
            has[next.Packagename] ? '' : has[next.Packagename] = true && item.push(next);
            return item;
        }, []);
    finalData.forEach(k => {
        k.Packagename in dataArrayOne ? k.Version1 = Object.values(dataArrayOne[k.Packagename])[0] : null;
        k.Packagename in dataArrayTwo ? k.Version2 = Object.values(dataArrayTwo[k.Packagename])[0] : null;
        k.Version1 === k.Version2 ? k.compare = '匹配' : k.compare = '不匹配';
        switch (compare(k.Version1, k.Version2)) {
            case 0:
                k.newVersion = 'match';
                break;
            case -1:
                k.newVersion = k.Version2;
                break;
            case 1:
                k.newVersion = k.version1;
                break;
            default:
                k.newVersion = 'No new version number';
        }
    });

    exportfile.onclick = () => {
        let str = 'Packagename,Version1,Version2,compare,newVersion\n';
        finalData.map(item => {
            Object.keys(item).map(key => {str += `${`${item[key]}\t`},`;});
            str += '\n';
        });
        const uri = `data:text/csv;charset=utf-8,\ufeff${encodeURIComponent(str)}`;
        const link = document.createElement('a');
        link.href = uri;
        link.download = 'DataTable.csv';
        link.click();
    };

    let searchlist = {};
    searchbtn.onclick = () => {
        finalData.map(item => {
            item.Packagename === ` ${searchbox.value}` ? searchlist = item : null;
        });
        displayarea.innerHTML = '';
        displayarea.innerHTML = `<tr>${displayarea.innerHTML}<td>${searchlist.Packagename}</td>` + `<td>${searchlist.Version1}</td>` + `<td>${searchlist.Version2}</td>` + `<td>${searchlist.bijiao}</td>` + `<td>${searchlist.newVersion}</td>` + '</tr>';
    };
    
},
);

