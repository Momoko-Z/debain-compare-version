(function () { function r(e, n, t) { function o(i, f) { if (!n[i]) { if (!e[i]) { var c = "function" == typeof require && require; if (!f && c) return c(i, !0); if (u) return u(i, !0); var a = new Error("Cannot find module '" + i + "'"); throw a.code = "MODULE_NOT_FOUND", a } var p = n[i] = { exports: {} }; e[i][0].call(p.exports, function (r) { var n = e[i][1][r]; return o(n || r) }, p, p.exports, r, e, n, t) } return n[i].exports } for (var u = "function" == typeof require && require, i = 0; i < t.length; i++)o(t[i]); return o } return r })()({
  1: [function (require, module, exports) {
    var compare = require("./node-deb-version-compare");
    var btn = document.getElementById("test");
    var xianshi = document.getElementById("xianshi");
    var sear = document.getElementById("search");
    var shuju1 = document.getElementById("shuju1");
    var shuju2 = document.getElementById("shuju2");
    var box2 = document.getElementById("box2");
    var daochu = document.getElementById("daochu");
    var yuan1 = document.getElementById("yuan1");
    var yuan2 = document.getElementById("yuan2");
    let arr = [];
    let arr1 = [];
    let arr3 = [];
    let arr4 = [];
    let arrdatalist = [];
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else {
      xhr = new ActiveXObject();
    }
    //发送要求

    yuan1.onclick = function (e) {
      xhr.open("GET", shuju1.value, true);
      //发送
      xhr.send();
      //服务器响应
      xhr.onreadystatechange = function () {
        console.log(xhr.readyState)
        console.log(xhr.status)
        if (xhr.readyState == 4 && xhr.status == 200){
          data = xhr.responseText;
          const arr2 = data.split('\n\n');
          arr2.forEach((item) => {
            let list = {}
            const arr3 = item.split('\n')
            arr3.forEach((value) => {
              list[value.split(':')[0]] = value.split(':')[1]
            })
            arr.push(list)
          })
          alert('数据源1查询成功')
          for (let i = 0; i < arr.length; i++) {
            arr3.push({
              package: arr[i].Package,
              Version1: arr[i].Version
            })
          }
        }else if(xhr.readyState == 4 && xhr.status == 0){
          alert("数据源1查询失败")
        }
      }
    }
    yuan2.onclick = function (e) {
      xhr.open("GET", shuju2.value, true);
      //发送
      xhr.send();
      //服务器响应
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200 ) {
          data = xhr.responseText;
          const arr2 = data.split('\n\n');
          arr2.forEach((item) => {
            let list = {}
            const arr3 = item.split('\n')
            arr3.forEach((value) => {
              list[value.split(':')[0]] = value.split(':')[1]
            })
            arr1.push(list)

          })
          alert('数据源2查询成功')
          for (let i = 0; i < arr1.length; i++) {
            arr4.push({
              package: arr1[i].Package,
              Version1: arr1[i].Version
            })

          }
        }else if(xhr.readyState == 4 && xhr.status == 0){
          alert("数据源1查询失败")
        }
      }
    }
    xianshi.onclick = function (e) {
      let packagename = [];
      for (var i = 0; i < arr3.length; i++) {
        packagename.push(arr3[i].package)
      }
      for (var i = 0; i < arr4.length; i++) {
        if (packagename.includes(arr4[i].package) == false) {
          packagename.push(arr4[i].package)
        }
      }
      for (var i = 0; i < packagename.length; i++) {
        let arrlist = {
          package: '',
          Version1: '',
          Version2: '',
          bijiao: '',
          newVersion: ""
        }
        arrlist.package = packagename[i]
        for (var j = 0; j < arr3.length; j++) {
          if (packagename[i] == arr3[j].package) {
            arrlist.Version1 = arr3[j].Version1
          }
        }
        for (var k = 0; k < arr4.length; k++) {
          if (packagename[i] == arr4[k].package) {
            arrlist.Version2 = arr4[k].Version1
          }
        }
        if (arrlist.Version1 == arrlist.Version2) {
          arrlist.bijiao = "匹配"
        } else {
          arrlist.bijiao = "不匹配"
        }

        if (compare(arrlist.Version1, arrlist.Version2) == 0) {
          arrlist.newVersion = "版本号一致"
        }
        else if (compare(arrlist.Version1, arrlist.Version2) == -1) {
          arrlist.newVersion = arrlist.Version2
        }
        else if (compare(arrlist.Version1, arrlist.Version2) == 1) {
          arrlist.newVersion = arrlist.Version1
        }
        else {
          arrlist.newVersion = "无新版本号"
        }
        arrdatalist.push(arrlist)
      }
      console.log(arrdatalist)

      for (var i = 0; i < 10; i++) {
        box2.innerHTML = "<tr>" + box2.innerHTML + "<td>" + arrdatalist[i].package + "</td>" + "<td>" + arrdatalist[i].Version1 + "</td>" + "<td>" + arrdatalist[i].Version2 + "</td>" + "<td>" + arrdatalist[i].bijiao + "</td>" + "<td>" + arrdatalist[i].newVersion + "</td>" + "</tr>"
      }

    }
    btn.onclick = function (e) {
      let searlist = {}
      for (var i = 0; i < arrdatalist.length; i++) {
        if (arrdatalist[i].package == " " + sear.value) {
          searlist = arrdatalist[i]
        }
      }
      box2.innerHTML = ""
      box2.innerHTML = "<tr>" + box2.innerHTML + "<td>" + searlist.package + "</td>" + "<td>" + searlist.Version1 + "</td>" + "<td>" + searlist.Version2 + "</td>" + "<td>" + searlist.bijiao + "</td>" + "<td>" + searlist.newVersion + "</td>" + "</tr>"
    };
    daochu.onclick = function (e) {
      let str = `包名,数据源1,数据源2,对比结果,新版本号\n`;
      // 增加\t为了不让表格显示科学计数法或者其他格式
      for (let i = 0; i < arrdatalist.length; i++) {
        for (const key in arrdatalist[i]) {
          str += `${arrdatalist[i][key] + '\t'},`;
        }
        str += '\n';
      }
      // encodeURIComponent解决中文乱码
      const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
      // 通过创建a标签实现
      const link = document.createElement("a");
      link.href = uri;
      // 对下载的文件命名
      link.download = "数据表.csv";
      link.click();
    }
  }, { "./node-deb-version-compare": 3 }], 2: [function (require, module, exports) {
    'use strict';
    function Version(v) {
      var version = /^([0-9]*(?=:))?:(.*)/.exec(v);
      this.epoch = (version) ? version[1] : 0;
      version = (version && version[2]) ? version[2] : v;
      version = (version || '').split("-");
      this.debian = (version.length > 1) ? version.pop() : "";
      this.upstream = version.join("-");
    }
    Version.prototype.compare = function (b) {
      if ((this.epoch > 0 || b.epoch > 0) && Math.sign(this.epoch - b.epoch) != 0) {
        return Math.sign(this.epoch - b.epoch);
      }
      if (this.compareStrings(this.upstream, b.upstream) != 0) {
        return this.compareStrings(this.upstream, b.upstream);
      } else {
        return this.compareStrings(this.debian, b.debian);
      }
    }
    Version.prototype.charCode = function (c) { //the lower the charcode the lower the version.
      if (c == "~")
        return 0; //tilde sort before anything
      else if (/[a-zA-Z]/.test(c))
        return c.charCodeAt(0) - "A".charCodeAt(0) + 1;
      else if (/[.:+-:]/.test(c))
        return c.charCodeAt(0) + "z".charCodeAt(0) + 1 //charcodes are 46..58
    }

    //find index of "val" in "ar".
    Version.prototype.findIndex = function (ar, fn) {

      for (var i = 0; i < ar.length; i++) {
        if (fn(ar[i], i)) {
          return i;
        }
      }
      return -1;
    }

    Version.prototype.compareChunk = function (a, b) {
      var ca = a.split(""), cb = b.split("");
      var diff = this.findIndex(ca, function (c, index) {
        if (cb[index] && c == cb[index]) return false;
        return true;
      });
      if (diff === -1) {
        if (cb.length > ca.length) {
          if (cb[ca.length] == "~") {
            return 1;
          } else {
            return -1;
          }
        }
        return 0; //no diff found and same length
      } else if (!cb[diff]) {
        return (ca[diff] === "~") ? -1 : 1;
      } else {
        return (this.charCode(ca[diff]) > this.charCode(cb[diff])) ? 1 : -1;
      }
    }

    Version.prototype.compareStrings = function (a, b) {
      if (a == b) return 0;
      var parseA = /([^0-9]+|[0-9]+)/g;
      var parseB = /([^0-9]+|[0-9]+)/g;
      var ra, rb;
      while ((ra = parseA.exec(a)) !== null && (rb = parseB.exec(b)) !== null) {
        if ((isNaN(ra[1]) || isNaN(rb[1])) && ra[1] != rb[1]) { //a or b is not a number and they're not equal. Note : "" IS a number so both null is impossible
          return this.compareChunk(ra[1], rb[1]);
        } else { //both are numbers
          if (ra[1] != rb[1]) {
            return (parseInt(ra[1]) > parseInt(rb[1])) ? 1 : -1;
          }
        }
      }
      if (!ra && rb) { //rb doesn't get exec-ed when ra == null
        return (parseB.exec(b)[1].split("")[0] == "~") ? 1 : -1
      } else if (ra && !rb) {
        return (ra[1].split("")[0] == "~") ? -1 : 1
      } else {
        return 0;
      }
    }

    module.exports = Version;

  }, {}], 3: [function (require, module, exports) {
    const Version = require("./Version");

    function compare(a, b) {
      var va = new Version(a), vb = new Version(b);
      return va.compare(vb);
    }

    module.exports = compare;

  }, { "./Version": 2 }]
}, {}, [1]);
