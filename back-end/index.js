var request = require('request');
var fs = require('fs');
var express = require('express');
var server = express();
server.listen(3000);
//开始的查看参数
var pn = 30;
//总共查到的条数
var n = 1;
//关键字
var key = '城市';
//转码
var keyword = encodeURIComponent(key);
var num = 30;

server.use('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

server.use('/search', function (req, res) {
  var data = req.query;
  keyword = encodeURIComponent(data.keyword);
  num = +data.num > 0 ? +data.num : 30;
  n = 0;
  box();
  res.send({
    code: 200,
    message: '获取成功!'
  }).end();
});

function box() {
  deletes('images');
  startRequest();
};

function startRequest() {
  //百度地址
  var url = 'https://image.baidu.com/search/acjson?tn=resultjson_com&ipn=rj&ct=201326592&is=&fp=result&queryWord=' + keyword + '&cl=2&lm=-1&ie=utf-8&oe=utf-8&adpicid=&st=-1&z=&ic=0&word=' + keyword + '&s=&se=&tab=&width=&height=&face=0&istype=2&qc=&nc=1&fr=&pn=' + pn + '&rn=30';
  var obj = {
    url: url,
    method: 'get'
  };
  request(obj, function (err, res, body) {
    var body = JSON.parse(body);
    console.log(body);
    saveData(body);
    saveImage(body.data);
    if (pn < 30 * Math.ceil(num / 30)) {
      pn += 30;
      startRequest();
    }
    console.log('总共' + num + '条');
  });
}
//写入json数据
function saveData(data) {
  fs.writeFile('upload/data.json', JSON.stringify(data, null, '\t'), function (err) {
    if (err) {
      console.log('写入失败~!');
    } else {
      console.log('写入成功~!');
    }
  });
}
//保存图片
function saveImage(data) {
  for (var i = 0; i < data.length - 1; i++) {
    //正则匹配标题的正确
    var reg = /[\u4e00-\u9fa5\w]+/g;
    var a = data[i].fromPageTitleEnc.match(reg);
    var str = a.join('');
    var img_title = str + '-' + data[i].di + '.' + data[i].type;
    var img_src = data[i].middleURL;
    n++;
    if (n > num) {
      return false;
    } else {
      request(img_src).pipe(fs.createWriteStream('images/' + img_title));
    }
  };
};
//删除文件
function deletes(path) {
  //读取文件夹下的文件
  var files = fs.readdirSync(path);
  files.forEach(function (file, index) {
    var curpath = path + '/' + file;
    //删除文件夹下的文件
    fs.unlinkSync(curpath);
  });
}