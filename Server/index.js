"use strict";

var _config = require("./config");

var _docList = require("./docList");

var express = require('express');

var app = express();

var html = require("html");

var fs = require('fs');

var request = require("request");

var cheerio = require('cheerio');

app.use(express.static(__dirname + '/domainParserviews')); //Store all HTML files in view folder.

app.use(express.static(__dirname + '/views')); //Store all JS and CSS in Scripts folder.

app.use(express.static(__dirname + '/dist'));
app.use(express.static(__dirname + '/images'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
// const XmlReader = require('xml-reader');
// const xmlQuery = require('xml-query');
var available_documents = {};
var abs_index = [];

function main() {
  // Preparing the variable to hold all data records.
  for (var d in _docList.DOCS) {
    var docfile = _docList.DOCS[d];
    var fileElements = docfile.split("_");
    var docid = fileElements[0];
    var page = fileElements[1].split(".")[0];
    var extension = fileElements[1].split(".")[1];

    if (available_documents[docid]) {
      var prev_data = available_documents[docid];
      prev_data.pages[prev_data.pages.length] = page;
      prev_data.maxPage = page > prev_data.maxPage ? page : prev_data.maxPage;
      available_documents[docid] = prev_data;
    } else {
      available_documents[docid] = {
        pages: [page],
        extension: extension,
        maxPage: page
      };
    }

    abs_index[abs_index.length] = {
      docid: docid,
      page: page,
      extension: extension,
      docfile: docfile
    };
  } // console.log(abs_index)

}

main();
app.get('/', function (req, res) {
  res.send("this is home");
});
app.get('/abs_index', function (req, res) {
  res.send(abs_index);
});
app.get('/totalTables', function (req, res) {
  res.send({
    total: _docList.DOCS.length
  });
});
app.get('/getTable', function (req, res) {
  //debugger
  // try{
  if (req.query && req.query.docid && req.query.page && available_documents[req.query.docid] && available_documents[req.query.docid].pages.indexOf(req.query.page) > -1) {
    var docid = req.query.docid + "_" + req.query.page + ".xlsx";
    fs.readFile("/home/suso/ihw/tableAnnotator/Server/HTML_TABLES/" + docid + "_files/sheet001.html", "utf8", function (err, data) {
      fs.readFile("/home/suso/ihw/tableAnnotator/Server/HTML_TABLES/" + docid + "_files/stylesheet.css", "utf8", function (err, data_ss) {
        var tablePage = cheerio.load(data);
        var actual_table = tablePage("table").parent().html();
        var ss = "<style>" + data_ss + " td {width: auto;} </style>";
        var formattedPage = "<html><head>" + ss + "</head>" + actual_table + "</html>";
        res.send(formattedPage);
      });
    });
  } else {
    res.send({
      status: "wrong parameters",
      query: req.query
    });
  } // } catch (e){
  //   res.send({status: "probably page out of bounds, or document does not exist", query : req.query})
  // }

});
app.get('/getAvailableTables', function (req, res) {
  res.send(available_documents);
});
app.get('/getAnnotation', function (req, res) {
  res.send("annotaion");
});
app.get('/recordAnnotation', function (req, res) {
  res.send("saved annotation");
});
app.listen(_config.PORT, function () {
  console.log('Application Running on port ' + _config.PORT + ' ' + new Date().toISOString());
});