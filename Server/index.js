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
var ops_counter = 0;
var available_documents = {};
var abs_index = []; // Postgres configuration.

var pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ihw_annotator',
  password: 'melacome86',
  port: 5432
}); //NODE R CONFIGURATION.

var R = require("r-script");

function prepareAvailableDocuments() {
  console.log("DLEN: " + _docList.DOCS.length); // Preparing the variable to hold all data records.

  for (var d in _docList.DOCS) {
    var docfile = _docList.DOCS[d];
    var fileElements = docfile.split("_");
    var docid = fileElements[0];
    var page = fileElements[1].split(".")[0];
    var extension = fileElements[1].split(".")[1];

    if (available_documents[docid]) {
      var prev_data = available_documents[docid];
      prev_data.pages[prev_data.pages.length] = page;
      prev_data.abs_pos[prev_data.abs_pos.length] = abs_index.length;
      prev_data.maxPage = page > prev_data.maxPage ? page : prev_data.maxPage;
      available_documents[docid] = prev_data;
    } else {
      available_documents[docid] = {
        abs_pos: [abs_index.length],
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
}

function getAnnotationResults() {
  return _getAnnotationResults.apply(this, arguments);
}

function _getAnnotationResults() {
  _getAnnotationResults = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee6() {
    var client, result;
    return _regenerator.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return pool.connect();

          case 2:
            client = _context6.sent;
            _context6.next = 5;
            return client.query("select * from annotations order by docid desc,page asc");

          case 5:
            result = _context6.sent;
            client.release();
            return _context6.abrupt("return", result);

          case 8:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));
  return _getAnnotationResults.apply(this, arguments);
}

function getAnnotationByID(_x, _x2, _x3) {
  return _getAnnotationByID.apply(this, arguments);
}

function _getAnnotationByID() {
  _getAnnotationByID = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee7(docid, page, user) {
    var client, result;
    return _regenerator.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return pool.connect();

          case 2:
            client = _context7.sent;
            _context7.next = 5;
            return client.query('select * from annotations where docid=$1 AND page=$2 AND "user"=$3 order by docid desc,page asc', [docid, page, user]);

          case 5:
            result = _context7.sent;
            client.release();
            return _context7.abrupt("return", result);

          case 8:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));
  return _getAnnotationByID.apply(this, arguments);
}

function insertAnnotation(_x4, _x5, _x6, _x7, _x8, _x9) {
  return _insertAnnotation.apply(this, arguments);
} // preinitialisation of components if needed.


function _insertAnnotation() {
  _insertAnnotation = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee8(docid, page, user, annotation, corrupted, tableType) {
    var client, done;
    return _regenerator.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return pool.connect();

          case 2:
            client = _context8.sent;
            _context8.next = 5;
            return client.query('INSERT INTO annotations VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT (docid, page,"user") DO UPDATE SET annotation = $4, corrupted = $5, "tableType" = $6 ;', [docid, page, user, annotation, corrupted, tableType]).then(function (result) {
              return console.log(result);
            }).catch(function (e) {
              return console.error(e.stack);
            }).then(function () {
              return client.release();
            });

          case 5:
            done = _context8.sent;
            console.log("Awaiting done: " + ops_counter++); // await client.end()

            console.log("DONE: " + ops_counter++);

          case 8:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this);
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
app.get('/api/allMetaData', function (req, res) {
  res.send({
    abs_index: abs_index,
    total: _docList.DOCS.length,
    available_documents: available_documents
  });
});
app.get('/api/rscript',
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(req, res) {
    var result;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            try {
              result = R("./src/tableScript.R");
              debugger;
              result = result.data("hello world", 20).callSync();
              res.send(JSON.stringify(result));
            } catch (e) {
              debugger;
              res.send("FAIL: " + e);
            }

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x10, _x11) {
    return _ref.apply(this, arguments);
  };
}());
app.get('/api/annotationPreview',
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2(req, res) {
    var annotations, page, user, final_annotations, r, ann, existing, final_annotations_array, result, entry, toreturn;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;

            if (!(req.query && req.query.docid && req.query.docid.length > 0)) {
              _context2.next = 10;
              break;
            }

            page = req.query.page && req.query.page.length > 0 ? req.query.page : 1;
            user = req.query.user && req.query.user.length > 0 ? req.query.user : "";
            console.log(user + "  -- " + JSON.stringify(req.query));
            _context2.next = 7;
            return getAnnotationByID(req.query.docid, page, user);

          case 7:
            annotations = _context2.sent;
            _context2.next = 11;
            break;

          case 10:
            res.send({
              state: "badquery: " + JSON.stringify(req.query)
            });

          case 11:
            final_annotations = {};
            /**
            * There are multiple versions of the annotations. When calling reading the results from the database, here we will return only the latest/ most complete version of the annotation.
            * Independently from the author of it. Completeness here measured as the result with the highest number of annotations and the highest index number (I.e. Newest, but only if it has more information/annotations).
            * May not be the best in some cases.
            *
            */

            for (r in annotations.rows) {
              ann = annotations.rows[r];
              existing = final_annotations[ann.docid + "_" + ann.page];

              if (existing) {
                if (ann.N > existing.N && ann.annotation.annotations.length >= existing.annotation.annotations.length) {
                  final_annotations[ann.docid + "_" + ann.page] = ann;
                }
              } else {
                // Didn't exist so add it.
                final_annotations[ann.docid + "_" + ann.page] = ann;
              }
            } // console.log("FINAL: " +JSON.stringify(final_annotations))


            final_annotations_array = [];

            for (r in final_annotations) {
              ann = final_annotations[r];
              final_annotations_array[final_annotations_array.length] = ann;
            } // console.log("FINAL2: " +JSON.stringify(final_annotations_array))


            if (final_annotations_array.length > 0) {
              result = R("./src/tableScript.R");
              entry = final_annotations_array[0];
              entry.annotation = entry.annotation.annotations.map(function (v, i) {
                var ann = v;
                ann.content = Object.keys(ann.content).join(";");
                ann.qualifiers = Object.keys(ann.qualifiers).join(";");
                return ann;
              });
              console.log("ENTRY:: " + JSON.stringify(entry));
              result = result.data(entry).callSync(); // console.log(JSON.stringify(result))

              toreturn = {
                "state": "good",
                result: result
              };
              res.send(toreturn);
            } else {
              res.send({
                "state": "empty"
              });
            }

            _context2.next = 21;
            break;

          case 18:
            _context2.prev = 18;
            _context2.t0 = _context2["catch"](0);
            res.send({
              "state": "failed"
            });

          case 21:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 18]]);
  }));

  return function (_x12, _x13) {
    return _ref2.apply(this, arguments);
  };
}());
app.get('/api/abs_index', function (req, res) {
  var output = "";

  for (var i in abs_index) {
    output = output + i + "," + abs_index[i].docid + "," + abs_index[i].page + "\n";
  }

  res.send(output);
});
app.get('/api/totalTables', function (req, res) {
  res.send({
    total: _docList.DOCS.length
  });
});
app.get('/api/getTable', function (req, res) {
  //debugger
  // try{
  if (req.query && req.query.docid && req.query.page && available_documents[req.query.docid] && available_documents[req.query.docid].pages.indexOf(req.query.page) > -1) {
    var docid = req.query.docid + "_" + req.query.page + ".xlsx"; // console.log("GET TABLE CALLED0: "+"HTML_TABLES/"+docid+"_files")
    //
    // if (!fs.existsSync("HTML_TABLES/"+docid+"_files")) {
    //     docid = req.query.docid + "_" + req.query.page;
    // }
    //
    //

    var htmlFolder = "HTML_TABLES/" + docid + "_files/";
    var htmlFile = "sheet001.html";
    console.log("GET TABLE CALLED: " + htmlFolder + htmlFile);

    if (!fs.existsSync(htmlFolder + htmlFile)) {
      docid = req.query.docid + "_" + req.query.page;
      htmlFolder = "HTML_TABLES/" + docid + "_files/";
      htmlFile = "sheet001.htm";
      console.log("GET TABLE CALLED Corrected: " + htmlFolder + htmlFile);
    }

    console.log("GET TABLE CALLED: " + htmlFile);
    fs.readFile(htmlFolder + htmlFile, "utf8", function (err, data) {
      fs.readFile(htmlFolder + "stylesheet.css", "utf8", function (err, data_ss) {
        var tablePage = cheerio.load(data);
        tablePage("col").removeAttr('style');
        var actual_table = tablePage("table").parent().html();
        var ss = "<style>" + data_ss + " td {width: auto;} tr:hover {background: aliceblue} col{width:100pt} </style>";
        var formattedPage = "<div>" + ss + "</head>" + actual_table + "</div>";
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
app.get('/api/getAnnotations',
/*#__PURE__*/
function () {
  var _ref3 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3(req, res) {
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.t0 = res;
            _context3.next = 3;
            return getAnnotationResults();

          case 3:
            _context3.t1 = _context3.sent;

            _context3.t0.send.call(_context3.t0, _context3.t1);

          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function (_x14, _x15) {
    return _ref3.apply(this, arguments);
  };
}());
app.get('/api/getAnnotationByID',
/*#__PURE__*/
function () {
  var _ref4 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee4(req, res) {
    var page, user, annotations, final_annotations, r, ann, existing, final_annotations_array, entry;
    return _regenerator.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!(req.query && req.query.docid && req.query.docid.length > 0)) {
              _context4.next = 13;
              break;
            }

            page = req.query.page && req.query.page.length > 0 ? req.query.page : 1;
            user = req.query.user && req.query.user.length > 0 ? req.query.user : "";
            _context4.next = 5;
            return getAnnotationByID(req.query.docid, page, user);

          case 5:
            annotations = _context4.sent;
            final_annotations = {};
            /**
            * There are multiple versions of the annotations. When calling reading the results from the database, here we will return only the latest/ most complete version of the annotation.
            * Independently from the author of it. Completeness here measured as the result with the highest number of annotations and the highest index number (I.e. Newest, but only if it has more information/annotations).
            * May not be the best in some cases.
            *
            */

            for (r in annotations.rows) {
              ann = annotations.rows[r];
              existing = final_annotations[ann.docid + "_" + ann.page];

              if (existing) {
                if (ann.N > existing.N && ann.annotation.annotations.length >= existing.annotation.annotations.length) {
                  final_annotations[ann.docid + "_" + ann.page] = ann;
                }
              } else {
                // Didn't exist so add it.
                final_annotations[ann.docid + "_" + ann.page] = ann;
              }
            }

            final_annotations_array = [];

            for (r in final_annotations) {
              ann = final_annotations[r];
              final_annotations_array[final_annotations_array.length] = ann;
            }

            if (final_annotations_array.length > 0) {
              entry = final_annotations_array[0];
              res.send(entry);
            } else {
              res.send({});
            }

            _context4.next = 14;
            break;

          case 13:
            res.send({
              error: "failed request"
            });

          case 14:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function (_x16, _x17) {
    return _ref4.apply(this, arguments);
  };
}());
app.get('/api/recordAnnotation',
/*#__PURE__*/
function () {
  var _ref5 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee5(req, res) {
    return _regenerator.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            console.log(JSON.stringify(req.query));

            if (!(req.query && req.query.docid.length > 0 && req.query.page.length > 0 && req.query.user.length > 0 && req.query.annotation.length > 0)) {
              _context5.next = 4;
              break;
            }

            _context5.next = 4;
            return insertAnnotation(req.query.docid, req.query.page, req.query.user, {
              annotations: JSON.parse(req.query.annotation)
            }, req.query.corrupted, req.query.tableType);

          case 4:
            //insertAnnotation("a doucment",2, "a user", {})
            res.send("saved annotation: " + JSON.stringify(req.query));

          case 5:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function (_x18, _x19) {
    return _ref5.apply(this, arguments);
  };
}());
app.listen(_config.PORT, function () {
  console.log('Express Server running on port ' + _config.PORT + ' ' + new Date().toISOString());
});