(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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


},{"./node-deb-version-compare/lib":3}],2:[function(require,module,exports){
'use strict';
function Version(v){
    var version = /^([0-9]*(?=:))?:(.*)/.exec(v);
    this.epoch = (version)?version[1]:0;
    version = (version && version[2])?version[2]:v;
    version =(version || '').split("-");
    this.debian = (version.length>1)?version.pop():"";
    this.upstream = version.join("-");
}
Version.prototype.compare = function(b){
  if((this.epoch>0 || b.epoch>0) && Math.sign(this.epoch-b.epoch)!=0){
    return Math.sign(this.epoch-b.epoch);
  }
  if(this.compareStrings(this.upstream,b.upstream) !=0){
    return this.compareStrings(this.upstream,b.upstream);
  }else{
    return this.compareStrings(this.debian,b.debian);
  }
}
Version.prototype.charCode = function(c){ //the lower the charcode the lower the version.
  if(c == "~")
    return 0; //tilde sort before anything
  else if(/[a-zA-Z]/.test(c))
    return c.charCodeAt(0)-"A".charCodeAt(0)+1;
  else if(/[.:+-:]/.test(c))
    return c.charCodeAt(0)+"z".charCodeAt(0)+1 //charcodes are 46..58
}

//find index of "val" in "ar".
Version.prototype.findIndex = function(ar,fn){

  for(var i = 0;i < ar.length; i++){
    if(fn(ar[i],i)){
      return i;
    }
  }
  return -1;
}

Version.prototype.compareChunk = function(a,b){
  var ca = a.split(""),cb=b.split("");
  var diff = this.findIndex(ca, function(c,index){
    if(cb[index] && c == cb[index]) return false;
    return true;
  });
  if(diff === -1){
    if(cb.length >ca.length){
      if(cb[ca.length] == "~"){
        return 1;
      }else{
        return -1;
      }
    }
    return 0; //no diff found and same length
  }else if(!cb[diff]){
    return (ca[diff] === "~")?-1:1;
  }else{
    return (this.charCode(ca[diff])>this.charCode(cb[diff]))?1:-1;
  }
}

Version.prototype.compareStrings = function(a,b){
  if(a==b) return 0;
  var parseA = /([^0-9]+|[0-9]+)/g;
  var parseB = /([^0-9]+|[0-9]+)/g;
  var ra,rb;
  while((ra=parseA.exec(a)) !== null && (rb = parseB.exec(b)) !== null ){
    if((isNaN(ra[1]) || isNaN(rb[1])) && ra[1] != rb[1] ){ //a or b is not a number and they're not equal. Note : "" IS a number so both null is impossible
      return this.compareChunk(ra[1],rb[1]);
    }else{ //both are numbers
      if(ra[1]!=rb[1]){
        return (parseInt(ra[1])>parseInt(rb[1]))?1:-1;
      }
    }
  }
  if(!ra && rb){ //rb doesn't get exec-ed when ra == null
    return (parseB.exec(b)[1].split("")[0] == "~")?1:-1
  }else if(ra && !rb){
    return (ra[1].split("")[0] == "~")?-1:1
  }else{
    return 0;
  }
}

module.exports = Version;

},{}],3:[function(require,module,exports){
const Version = require("./Version");

function compare(a,b){
  var va= new Version(a), vb = new Version(b);
  return va.compare(vb);
}

module.exports = compare;

},{"./Version":2}]},{},[1]);
