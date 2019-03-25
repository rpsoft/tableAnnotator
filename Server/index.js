"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _config = require("./config");

var _docList = require("./docList");

var _titles = require("./titles");

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n        classify(", ")\n      "]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  sgd = pickle.load(open(\"/home/suso/ihw/tableAnnotator/Server/src/sgd_multiterm.sav\", 'rb'))\n  def classify(h):\n    d={}\n    result = sgd.predict(h)\n    for r in range(0,len(h)):\n      d[h[r]] = result[r]\n    return d\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  import pandas\n  from sklearn import model_selection\n  from sklearn.linear_model import SGDClassifier\n  import pickle\n  import sys\n  import json\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var express = require('express');

var app = express();

var html = require("html");

var fs = require('fs');

var request = require("request");

var cheerio = require('cheerio');

var _require = require('pg'),
    Pool = _require.Pool,
    Client = _require.Client; // import {PythonShell} from 'python-shell';


app.use(express.static(__dirname + '/domainParserviews')); //Store all HTML files in view folder.

app.use(express.static(__dirname + '/views')); //Store all JS and CSS in Scripts folder.

app.use(express.static(__dirname + '/dist'));
app.use(express.static(__dirname + '/images'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
var titles_obj = {};

for (var t in _titles.TITLES) {
  titles_obj[_titles.TITLES[t].pmid.split(" ")[0]] = {
    title: _titles.TITLES[t].title,
    abstract: _titles.TITLES[t].abstract
  };
} // const XmlReader = require('xml-reader');
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
  _regenerator.default.mark(function _callee8() {
    var client, result;
    return _regenerator.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return pool.connect();

          case 2:
            client = _context8.sent;
            _context8.next = 5;
            return client.query("select * from annotations order by docid desc,page asc");

          case 5:
            result = _context8.sent;
            client.release();
            return _context8.abrupt("return", result);

          case 8:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));
  return _getAnnotationResults.apply(this, arguments);
}

function getAnnotationByID(_x, _x2, _x3) {
  return _getAnnotationByID.apply(this, arguments);
} // let options = {
//   mode: 'text',
//   pythonPath: '/home/suso/anaconda3/bin/python',
//   pythonOptions: ['-u'], // get print results in real-time
//   scriptPath: '/home/suso/ihw/tableAnnotator/Server/src',
// };
//
//
// let pyshell = new PythonShell('/home/suso/ihw/tableAnnotator/Server/src/classifier.py');
//
// // sends a message to the Python script via stdin
// pyshell.on('message', function (message) {
//   // received a message sent from the Python script (a simple "print" statement)
//   console.log(message);
// });
//
// pyshell.send('hello');


function _getAnnotationByID() {
  _getAnnotationByID = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee9(docid, page, user) {
    var client, result;
    return _regenerator.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return pool.connect();

          case 2:
            client = _context9.sent;
            _context9.next = 5;
            return client.query('select * from annotations where docid=$1 AND page=$2 AND "user"=$3 order by docid desc,page asc', [docid, page, user]);

          case 5:
            result = _context9.sent;
            client.release();
            return _context9.abrupt("return", result);

          case 8:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));
  return _getAnnotationByID.apply(this, arguments);
}

var assert = require('assert');

var pythonBridge = require('python-bridge');

var python = pythonBridge({
  python: 'python3'
});
python.ex(_templateObject());
python.ex(_templateObject2()); //
// let words = ["male","Infliximab","female"]
//
// //
// python`classify(["male", "female", "male", "male"])`.then(x => console.log(x));
// //
// python.end();
//
//
// let python = pythonBridge({
//     python: 'python3'
// });
//
// python`classify(["male", "female", "male", "male"])`.then(x => console.log(x));
// python.end();
//

function classify(_x4) {
  return _classify.apply(this, arguments);
}

function _classify() {
  _classify = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee10(terms) {
    var result;
    return _regenerator.default.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            result = new Promise(function (resolve, reject) {
              var cleanTerms = [];

              for (t in terms) {
                var term = terms[t].replace(/[/(){}\[\]\|@,;]/g, " ").replace(/[^a-z #+_]/g, "").trim().toLowerCase();

                if (term.length > 0) {
                  if (term.replace(/[^a-z]/g, "").length > 2) {
                    // na's and "to" as part of ranges matching this length. Potentially other rubbish picked up here.
                    cleanTerms[cleanTerms.length] = term;
                  }
                }
              }

              if (cleanTerms.length > 0) {
                console.log(cleanTerms);
                python(_templateObject3(), cleanTerms).then(function (x) {
                  return resolve(x);
                }).catch(python.Exception, function (e) {
                  return console.log("python error: " + e);
                });
              } else {
                resolve({});
              }
            });
            return _context10.abrupt("return", result);

          case 2:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));
  return _classify.apply(this, arguments);
}

function attempt_predictions(_x5) {
  return _attempt_predictions.apply(this, arguments);
}

function _attempt_predictions() {
  _attempt_predictions = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee12(actual_table) {
    var result;
    return _regenerator.default.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            result = new Promise(
            /*#__PURE__*/
            function () {
              var _ref8 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee11(resolve, reject) {
                var a, lines, predictions, l, currentLine, terms, c, pred_class;
                return _regenerator.default.wrap(function _callee11$(_context11) {
                  while (1) {
                    switch (_context11.prev = _context11.next) {
                      case 0:
                        _context11.prev = 0;
                        a = cheerio.load(actual_table);
                        lines = a("tr");
                        predictions = new Array(lines.length);
                        l = 0;

                      case 5:
                        if (!(l < lines.length)) {
                          _context11.next = 16;
                          break;
                        }

                        currentLine = cheerio(lines[l]);
                        terms = [];

                        for (c = 0; c < currentLine.children().length; c++) {
                          terms[terms.length] = cheerio(currentLine.children()[c]).text().trim().replace(/\n/g, " ").toLowerCase();
                        }

                        _context11.next = 11;
                        return classify(terms);

                      case 11:
                        pred_class = _context11.sent;
                        predictions[l] = {
                          pred_class: pred_class,
                          terms: terms
                        };

                      case 13:
                        l++;
                        _context11.next = 5;
                        break;

                      case 16:
                        resolve(predictions);
                        _context11.next = 22;
                        break;

                      case 19:
                        _context11.prev = 19;
                        _context11.t0 = _context11["catch"](0);
                        reject(_context11.t0);

                      case 22:
                      case "end":
                        return _context11.stop();
                    }
                  }
                }, _callee11, this, [[0, 19]]);
              }));

              return function (_x27, _x28) {
                return _ref8.apply(this, arguments);
              };
            }());
            return _context12.abrupt("return", result);

          case 2:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, this);
  }));
  return _attempt_predictions.apply(this, arguments);
}

function insertAnnotation(_x6, _x7, _x8, _x9, _x10, _x11, _x12) {
  return _insertAnnotation.apply(this, arguments);
} // preinitialisation of components if needed.


function _insertAnnotation() {
  _insertAnnotation = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee13(docid, page, user, annotation, corrupted, tableType, corrupted_text) {
    var client, done;
    return _regenerator.default.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.next = 2;
            return pool.connect();

          case 2:
            client = _context13.sent;
            _context13.next = 5;
            return client.query('INSERT INTO annotations VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (docid, page,"user") DO UPDATE SET annotation = $4, corrupted = $5, "tableType" = $6, "corrupted_text" = $7 ;', [docid, page, user, annotation, corrupted, tableType, corrupted_text]).then(function (result) {
              return console.log("insert: " + result);
            }).catch(function (e) {
              return console.error(e.stack);
            }).then(function () {
              return client.release();
            });

          case 5:
            done = _context13.sent;
            console.log("Awaiting done: " + ops_counter++); // await client.end()

            console.log("DONE: " + ops_counter++);

          case 8:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, this);
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
              result = R("./src/tableScript.R"); // debugger

              result = result.data("hello world", 20).callSync();
              res.send(JSON.stringify(result));
            } catch (e) {
              // debugger
              res.send("FAIL: " + e);
            }

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x13, _x14) {
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

  return function (_x15, _x16) {
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
app.get('/api/classify',
/*#__PURE__*/
function () {
  var _ref3 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3(req, res) {
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!(req.query && req.query.terms)) {
              _context3.next = 8;
              break;
            }

            console.log(req.query.terms);
            _context3.t0 = res;
            _context3.next = 5;
            return classify(req.query.terms.split(","));

          case 5:
            _context3.t1 = _context3.sent;
            _context3.t2 = {
              results: _context3.t1
            };

            _context3.t0.send.call(_context3.t0, _context3.t2);

          case 8:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function (_x17, _x18) {
    return _ref3.apply(this, arguments);
  };
}());
app.get('/api/getTable', function (req, res) {
  //debugger
  try {
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
        fs.readFile(htmlFolder + "stylesheet.css", "utf8",
        /*#__PURE__*/
        function () {
          var _ref4 = (0, _asyncToGenerator2.default)(
          /*#__PURE__*/
          _regenerator.default.mark(function _callee4(err2, data_ss) {
            var tablePage, spaceRow, headerNodes, maxOUT, htmlHeader, h, headText, textLimit, actual_table, ss, formattedPage, predictions, preds_matrix, max_col, l, getTopDescriptors, col_top_descriptors, c, column_data, k, allfreqs, descriptors, row_top_descriptors, r, row_data, predicted;
            return _regenerator.default.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    _context4.prev = 0;
                    tablePage = cheerio.load(data);
                    tablePage("col").removeAttr('style');

                    if (tablePage) {
                      _context4.next = 6;
                      break;
                    }

                    res.send({
                      htmlHeader: "",
                      formattedPage: "",
                      title: ""
                    });
                    return _context4.abrupt("return");

                  case 6:
                    _context4.next = 13;
                    break;

                  case 8:
                    _context4.prev = 8;
                    _context4.t0 = _context4["catch"](0);
                    console.log(JSON.stringify(_context4.t0) + " -- " + JSON.stringify(data));
                    res.send({
                      htmlHeader: "",
                      formattedPage: "",
                      title: ""
                    });
                    return _context4.abrupt("return");

                  case 13:
                    spaceRow = -1;
                    headerNodes = [];
                    maxOUT = 0;

                  case 16:
                    if (!true) {
                      _context4.next = 25;
                      break;
                    }

                    if (!(cheerio(tablePage("table").find("tr")[0]).text().trim().length < 1)) {
                      _context4.next = 20;
                      break;
                    }

                    cheerio(tablePage("table").find("tr")[0]).remove();
                    return _context4.abrupt("break", 25);

                  case 20:
                    headerNodes.push(cheerio(tablePage("table").find("tr")[0]).remove());

                    if (!(maxOUT++ > 10)) {
                      _context4.next = 23;
                      break;
                    }

                    return _context4.abrupt("break", 25);

                  case 23:
                    _context4.next = 16;
                    break;

                  case 25:
                    htmlHeader = "";

                    for (h in headerNodes) {
                      // cheerio(headerNodes[h]).css("font-size","20px");
                      headText = cheerio(headerNodes[h]).text().trim();
                      textLimit = 400;
                      htmlHeader = htmlHeader + '<tr ><td style="font-size:20px; font-weight:bold; white-space: normal;">' + (headText.length > textLimit ? headText.slice(0, textLimit - 1) + " [...] " : headText) + "</td></tr>";
                    }

                    htmlHeader = "<table>" + htmlHeader + "</table>";
                    actual_table = tablePage("table").parent().html();
                    ss = "<style>" + data_ss + " td {width: auto;} tr:hover {background: aliceblue} td:hover {background: #82c1f8} col{width:100pt} </style>";
                    formattedPage = "<div>" + ss + "</head>" + actual_table + "</div>";
                    _context4.next = 33;
                    return attempt_predictions(actual_table);

                  case 33:
                    predictions = _context4.sent;
                    /// this should really go into a function.
                    preds_matrix = predictions.map(function (e) {
                      return e.terms.map(function (term) {
                        return e.pred_class[term.replace(/[/(){}\[\]\|@,;]/g, " ").replace(/[^a-z #+_]/g, "").trim()];
                      });
                    }); // hell of a line!

                    debugger;
                    max_col = 0;

                    for (l = 0; l < preds_matrix.length; l++) {
                      max_col = max_col > preds_matrix[l].length ? max_col : preds_matrix[l].length;
                    }

                    getTopDescriptors = function getTopDescriptors(N, freqs, ignore) {
                      var orderedKeys = Object.keys(freqs).sort(function (a, b) {
                        return a > b;
                      });

                      for (var i in ignore) {
                        var toRemove = orderedKeys.indexOf(ignore[i]);
                        if (toRemove > -1) orderedKeys.splice(toRemove, 1);
                      }

                      var limit = orderedKeys.length < N ? orderedKeys.length : N;
                      return orderedKeys.slice(0, limit);
                    }; //Estimate column predictions.


                    debugger;
                    col_top_descriptors = {};

                    for (c = 0; c < max_col; c++) {
                      column_data = preds_matrix.map(function (x) {
                        return x[c];
                      }).reduce(function (countMap, word) {
                        countMap.freqs[word] = ++countMap.freqs[word] || 1;
                        var max = countMap["max"] || 0;
                        countMap["max"] = max < countMap.freqs[word] ? countMap.freqs[word] : max;
                        countMap["total"] = ++countMap["total"] || 1;
                        return countMap;
                      }, {
                        total: 0,
                        freqs: {}
                      });

                      for (k in column_data.freqs) {
                        // to qualify for a row descriptor the frequency should at least be half of the length of the column headings.
                        if (column_data.freqs[undefined] == column_data.max || column_data.freqs[k] == 1) {
                          allfreqs = column_data.freqs;
                          delete allfreqs[k];
                          column_data.freqs = allfreqs;
                        }
                      }

                      descriptors = getTopDescriptors(3, column_data.freqs, ["arms", "undefined"]);
                      if (descriptors.length > 0) col_top_descriptors[c] = descriptors;
                    } // Estimate row predictions


                    row_top_descriptors = {}; // debugger

                    for (r in preds_matrix) {
                      row_data = preds_matrix[r].reduce(function (countMap, word) {
                        countMap.freqs[word] = ++countMap.freqs[word] || 1;
                        var max = countMap["max"] || 0;
                        countMap["max"] = max < countMap.freqs[word] ? countMap.freqs[word] : max;
                        countMap["total"] = ++countMap["total"] || 1;
                        return countMap;
                      }, {
                        total: 0,
                        freqs: {}
                      });

                      for (k in row_data.freqs) {
                        // to qualify for a row descriptor the frequency should at least be half of the length of the column headings.
                        if (row_data.freqs[undefined] == row_data.max || row_data.freqs[k] == 1) {
                          allfreqs = row_data.freqs;
                          delete allfreqs[k];
                          row_data.freqs = allfreqs;
                        }
                      }

                      descriptors = getTopDescriptors(3, row_data.freqs, ["undefined"]);
                      if (descriptors.length > 0) row_top_descriptors[r] = descriptors;
                    }

                    predicted = {
                      cols: col_top_descriptors,
                      rows: row_top_descriptors
                    };
                    res.send({
                      status: "good",
                      htmlHeader: htmlHeader,
                      formattedPage: formattedPage,
                      title: titles_obj[req.query.docid.split(" ")[0]],
                      predicted: predicted
                    });

                  case 46:
                  case "end":
                    return _context4.stop();
                }
              }
            }, _callee4, this, [[0, 8]]);
          }));

          return function (_x19, _x20) {
            return _ref4.apply(this, arguments);
          };
        }());
      });
    } else {
      res.send({
        status: "wrong parameters",
        query: req.query
      });
    }
  } catch (e) {
    res.send({
      status: "probably page out of bounds, or document does not exist",
      query: req.query
    });
  }
});
app.get('/api/getAvailableTables', function (req, res) {
  res.send(available_documents);
});
app.get('/api/getAnnotations',
/*#__PURE__*/
function () {
  var _ref5 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee5(req, res) {
    return _regenerator.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.t0 = res;
            _context5.next = 3;
            return getAnnotationResults();

          case 3:
            _context5.t1 = _context5.sent;

            _context5.t0.send.call(_context5.t0, _context5.t1);

          case 5:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function (_x21, _x22) {
    return _ref5.apply(this, arguments);
  };
}());
app.get('/api/getAnnotationByID',
/*#__PURE__*/
function () {
  var _ref6 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee6(req, res) {
    var page, user, annotations, final_annotations, r, ann, existing, final_annotations_array, entry;
    return _regenerator.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (!(req.query && req.query.docid && req.query.docid.length > 0)) {
              _context6.next = 13;
              break;
            }

            page = req.query.page && req.query.page.length > 0 ? req.query.page : 1;
            user = req.query.user && req.query.user.length > 0 ? req.query.user : "";
            _context6.next = 5;
            return getAnnotationByID(req.query.docid, page, user);

          case 5:
            annotations = _context6.sent;
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

            _context6.next = 14;
            break;

          case 13:
            res.send({
              error: "failed request"
            });

          case 14:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function (_x23, _x24) {
    return _ref6.apply(this, arguments);
  };
}());
app.get('/api/recordAnnotation',
/*#__PURE__*/
function () {
  var _ref7 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee7(req, res) {
    return _regenerator.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            console.log(JSON.stringify(req.query));

            if (!(req.query && req.query.docid.length > 0 && req.query.page.length > 0 && req.query.user.length > 0 && req.query.annotation.length > 0)) {
              _context7.next = 4;
              break;
            }

            _context7.next = 4;
            return insertAnnotation(req.query.docid, req.query.page, req.query.user, {
              annotations: JSON.parse(req.query.annotation)
            }, req.query.corrupted, req.query.tableType, req.query.corrupted_text);

          case 4:
            //insertAnnotation("a doucment",2, "a user", {})
            res.send("saved annotation: " + JSON.stringify(req.query));

          case 5:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));

  return function (_x25, _x26) {
    return _ref7.apply(this, arguments);
  };
}());
app.listen(_config.PORT, function () {
  console.log('Express Server running on port ' + _config.PORT + ' ' + new Date().toISOString());
});