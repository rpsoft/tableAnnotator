"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _config = require("./config");

var _docList = require("./docList");

var express = require('express');

var app = express();

var html = require("html");

var fs = require('fs');

var request = require("request");

var cheerio = require('cheerio');

var _require = require('pg'),
    Pool = _require.Pool,
    Client = _require.Client;

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
var pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ihw_annotator',
  password: 'melacome86',
  port: 5432
});

function prepareAvailableDocuments() {
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
  }
} // async function connectDB(){
//
//   var client = await pool.connect()
//   var result = await client.query({
//     rowMode: 'array',
//     text: 'SELECT * FROM annotations;'
//   })
//
//   console.log("rows: "+ result.rows) // [1, 2]
//   await client.end()
//
// }


function insertAnnotation(_x, _x2, _x3, _x4) {
  return _insertAnnotation.apply(this, arguments);
} // preinitialisation of components if needed.


function _insertAnnotation() {
  _insertAnnotation = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(docid, page, user, annotation) {
    var client, done;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return pool.connect();

          case 2:
            client = _context.sent;
            _context.next = 5;
            return client.query('INSERT INTO annotations VALUES($1,$2,$3,$4)', [docid, page, user, annotation]);

          case 5:
            done = _context.sent;
            _context.next = 8;
            return client.end();

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _insertAnnotation.apply(this, arguments);
}

function main() {
  // prepare available_documents variable
  prepareAvailableDocuments();
}

main();
app.get('/', function (req, res) {
  res.send("this is home");
});
app.get('/api/abs_index', function (req, res) {
  res.send(abs_index);
});
app.get('/api/totalTables', function (req, res) {
  res.send({
    total: _docList.DOCS.length
  });
});
app.get('/api/getTable', function (req, res) {
  //debugger
  // try{
  console.log("GET TABLE CALLED");

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
app.get('/api/getAvailableTables', function (req, res) {
  res.send(available_documents);
});
app.get('/api/getAnnotation', function (req, res) {
  res.send("annotaion");
});
app.get('/api/recordAnnotation', function (req, res) {
  console.log(req.query); //insertAnnotation("a doucment",2, "a user", {})

  res.send("saved annotation: " + req.query);
});
app.listen(_config.PORT, function () {
  console.log('Express Server running on port ' + _config.PORT + ' ' + new Date().toISOString());
});