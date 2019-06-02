"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _config = require("./config");

var _titles = require("./titles");

function _templateObject4() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n        groupedPredict(", ")\n      "]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n        classify(", ")\n      "]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  sgd = pickle.load(open(\"./src/sgd_nbmr_full.sav\", 'rb'))\n  def classify(h):\n    d={}\n    result = sgd.predict(h)\n    for r in range(0,len(h)):\n      d[h[r]] = result[r]\n    return d\n  def getTopConfidenceTerms(df):\n      df = df.sort_values(by=['confidence'], ascending=False)\n      mean = df.mean(axis=0)\n      return df[df[\"confidence\"] > mean[0]][\"classes\"].values\n  def groupedPredict( terms ):\n      result = {}\n      for t in range(0,len(terms)):\n          d = {'classes': sgd[2].classes_, 'confidence': sgd.decision_function([terms[t]])[0]}\n          df = pd.DataFrame(data=d)\n          res = getTopConfidenceTerms(df)\n          result[terms[t]] = \";\".join(res)\n      return result\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2.default)(["\n  import pandas\n  from sklearn import model_selection\n  from sklearn.linear_model import SGDClassifier\n  import pickle\n  import sys\n  import json\n  import pandas as pd\n"]);

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
    Client = _require.Client;

var csv = require('csv-parser');

var fs = require('fs'); // import {PythonShell} from 'python-shell';


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
var abs_index = [];
var tables_folder = "HTML_TABLES";
var cssFolder = "HTML_STYLES";
var DOCS = [];
var clusters = {};
fs.createReadStream('./CLUSTERS/clusters.csv').pipe(csv()).on('data', function (row) {
  var existingCluster = clusters[row.cluster];

  if (existingCluster) {
    existingCluster.push(row.term);
  } else {
    existingCluster = [row.term];
  }

  clusters[row.cluster] = existingCluster;
}).on('end', function () {
  console.log('read CSV clusters: ' + Object.keys(clusters).length);
}); // options: frequency ; grouped_predictor ;

var METHOD = "grouped_predictor"; // Postgres configuration.

var pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ihw_annotator',
  password: 'melacome86',
  port: 5432
}); //NODE R CONFIGURATION.

var R = require("r-script"); //Important to use this function for all text extracted from the tables.


function prepare_cell_text(text) {
  return text.replace(/[0-9]+/g, 'nmbr').replace(/([^A-z0-9 ])/g, " $1 ").replace(/ +/g, " ").trim().toLowerCase();
}

function prepareAvailableDocuments() {
  // console.log("preparing filed")
  fs.readdir(tables_folder, function (err, items) {
    DOCS = items;

    for (var d in DOCS) {
      var docfile = DOCS[d];
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

    console.log("DLEN: " + DOCS.length);
  });
}

function getAnnotationResults() {
  return _getAnnotationResults.apply(this, arguments);
}

function _getAnnotationResults() {
  _getAnnotationResults = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee9() {
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
            return client.query("select * from annotations order by docid desc,page asc");

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
  return _getAnnotationResults.apply(this, arguments);
}

function getAnnotationByID(_x, _x2, _x3) {
  return _getAnnotationByID.apply(this, arguments);
}

function _getAnnotationByID() {
  _getAnnotationByID = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee10(docid, page, user) {
    var client, result;
    return _regenerator.default.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return pool.connect();

          case 2:
            client = _context10.sent;
            _context10.next = 5;
            return client.query('select * from annotations where docid=$1 AND page=$2 AND "user"=$3 order by docid desc,page asc', [docid, page, user]);

          case 5:
            result = _context10.sent;
            client.release();
            return _context10.abrupt("return", result);

          case 8:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));
  return _getAnnotationByID.apply(this, arguments);
}

var assert = require('assert');

var pythonBridge = require('python-bridge');

var python = pythonBridge({
  python: 'python3'
});
python.ex(_templateObject());
console.log(process.cwd()); //   sgd = pickle.load(open("./src/sgd_multiterm.sav", 'rb'))
//   sgd = pickle.load(open("./src/sgd_l_svm_char.sav", 'rb'))

python.ex(_templateObject2());

function classify(_x4) {
  return _classify.apply(this, arguments);
}

function _classify() {
  _classify = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee11(terms) {
    var result;
    return _regenerator.default.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            result = new Promise(function (resolve, reject) {
              var cleanTerms = [];

              for (t in terms) {
                //var term = terms[t].replace(/[/(){}\[\]\|@,;]/g, " ").replace(/[^a-z #+_]/g,"").trim().toLowerCase()
                var term = prepare_cell_text(terms[t]);

                if (term.length > 0) {
                  if (term.replace(/[^a-z]/g, "").length > 2) {
                    // na's and "to" as part of ranges matching this length. Potentially other rubbish picked up here.
                    cleanTerms[cleanTerms.length] = term;
                  }
                }
              }

              if (cleanTerms.length > 0) {
                //console.log(cleanTerms)
                //  debugger
                python(_templateObject3(), cleanTerms).then(function (x) {
                  return resolve(x);
                }).catch(python.Exception, function (e) {
                  return console.log("python error: " + e);
                });
              } else {
                resolve({});
              }
            });
            return _context11.abrupt("return", result);

          case 2:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, this);
  }));
  return _classify.apply(this, arguments);
}

function grouped_predictor(_x5) {
  return _grouped_predictor.apply(this, arguments);
}

function _grouped_predictor() {
  _grouped_predictor = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee12(terms) {
    var result;
    return _regenerator.default.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            result = new Promise(function (resolve, reject) {
              if (terms.length > 0) {
                python(_templateObject4(), [terms]).then(function (x) {
                  return resolve(x);
                }).catch(python.Exception, function (e) {
                  return console.log("python error: " + e);
                });
              } else {
                resolve({});
              }
            }); //debugger

            return _context12.abrupt("return", result);

          case 2:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, this);
  }));
  return _grouped_predictor.apply(this, arguments);
}

function attempt_predictions(_x6) {
  return _attempt_predictions.apply(this, arguments);
}

function _attempt_predictions() {
  _attempt_predictions = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee14(actual_table) {
    var result;
    return _regenerator.default.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            result = new Promise(
            /*#__PURE__*/
            function () {
              var _ref9 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee13(resolve, reject) {
                var a, lines, predictions, l, currentLine, terms, cellClasses, cellClass, c, cellClassSelector, pred_class;
                return _regenerator.default.wrap(function _callee13$(_context13) {
                  while (1) {
                    switch (_context13.prev = _context13.next) {
                      case 0:
                        _context13.prev = 0;
                        a = cheerio.load(actual_table);
                        lines = a("tr");
                        predictions = new Array(lines.length);
                        l = 0;

                      case 5:
                        if (!(l < lines.length)) {
                          _context13.next = 18;
                          break;
                        }

                        currentLine = cheerio(lines[l]);
                        terms = [];
                        cellClasses = [];
                        cellClass = "";

                        for (c = 0; c < currentLine.children().length; c++) {
                          terms[terms.length] = cheerio(currentLine.children()[c]).text().trim().replace(/\n/g, " ").toLowerCase();
                          cellClassSelector = cheerio(currentLine.children()[c]).children()[0];

                          if (cellClassSelector) {
                            cellClass = cellClassSelector.attribs.class || "";
                          }

                          cellClasses[cellClasses.length] = cellClass;
                        } // debugger


                        _context13.next = 13;
                        return classify(terms);

                      case 13:
                        pred_class = _context13.sent;
                        predictions[l] = {
                          pred_class: pred_class,
                          terms: terms,
                          cellClasses: cellClasses
                        };

                      case 15:
                        l++;
                        _context13.next = 5;
                        break;

                      case 18:
                        resolve(predictions);
                        _context13.next = 24;
                        break;

                      case 21:
                        _context13.prev = 21;
                        _context13.t0 = _context13["catch"](0);
                        reject(_context13.t0);

                      case 24:
                      case "end":
                        return _context13.stop();
                    }
                  }
                }, _callee13, this, [[0, 21]]);
              }));

              return function (_x33, _x34) {
                return _ref9.apply(this, arguments);
              };
            }());
            return _context14.abrupt("return", result);

          case 2:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14, this);
  }));
  return _attempt_predictions.apply(this, arguments);
}

function insertAnnotation(_x7, _x8, _x9, _x10, _x11, _x12, _x13) {
  return _insertAnnotation.apply(this, arguments);
} // preinitialisation of components if needed.


function _insertAnnotation() {
  _insertAnnotation = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee15(docid, page, user, annotation, corrupted, tableType, corrupted_text) {
    var client, done;
    return _regenerator.default.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            _context15.next = 2;
            return pool.connect();

          case 2:
            client = _context15.sent;
            _context15.next = 5;
            return client.query('INSERT INTO annotations VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (docid, page,"user") DO UPDATE SET annotation = $4, corrupted = $5, "tableType" = $6, "corrupted_text" = $7 ;', [docid, page, user, annotation, corrupted, tableType, corrupted_text]).then(function (result) {
              return console.log("insert: " + result);
            }).catch(function (e) {
              return console.error(e.stack);
            }).then(function () {
              return client.release();
            });

          case 5:
            done = _context15.sent;
            console.log("Awaiting done: " + ops_counter++); // await client.end()

            console.log("DONE: " + ops_counter++);

          case 8:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15, this);
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
    total: DOCS.length,
    available_documents: available_documents
  });
});
app.get('/api/allClusters', function (req, res) {
  res.send(clusters);
});
app.get('/api/allPredictions',
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(req, res) {
    var predictions, a, p, page, docid, data, c, col, r, row;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log("getting all predictions");
            predictions = "user,docid,page,corrupted,tableType,location,number,content,qualifiers\n";
            _context.t0 = _regenerator.default.keys(available_documents);

          case 3:
            if ((_context.t1 = _context.t0()).done) {
              _context.next = 20;
              break;
            }

            a = _context.t1.value;
            _context.t2 = _regenerator.default.keys(available_documents[a].pages);

          case 6:
            if ((_context.t3 = _context.t2()).done) {
              _context.next = 18;
              break;
            }

            p = _context.t3.value;
            console.log(a + "  --  " + p);
            page = available_documents[a].pages[p];
            docid = a;
            _context.next = 13;
            return readyTableData(docid, page);

          case 13:
            data = _context.sent;

            for (c in data.predicted.cols) {
              col = data.predicted.cols[c];
              predictions += ["auto_" + METHOD, docid, page, false, "na", "Col", parseInt(col.c) + 1, col.descriptors.join(";"), col.unique_modifier.split(" ").join(";")].join(",") + "\n";
            }

            for (r in data.predicted.rows) {
              row = data.predicted.rows[r];
              predictions += ["auto_" + METHOD, docid, page, false, "na", "Row", parseInt(row.c) + 1, row.descriptors.join(";"), row.unique_modifier.split(" ").join(";")].join(",") + "\n";
            }

            _context.next = 6;
            break;

          case 18:
            _context.next = 3;
            break;

          case 20:
            res.send(predictions);

          case 21:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x14, _x15) {
    return _ref.apply(this, arguments);
  };
}());
app.get('/api/rscript',
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2(req, res) {
    var result;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            try {
              result = R("./src/tableScript.R");
              result = result.data("hello world", 20).callSync();
              res.send(JSON.stringify(result));
            } catch (e) {
              res.send("FAIL: " + e);
            }

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x16, _x17) {
    return _ref2.apply(this, arguments);
  };
}());
app.get('/api/annotationPreview',
/*#__PURE__*/
function () {
  var _ref3 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3(req, res) {
    var annotations, page, user, final_annotations, r, ann, existing, final_annotations_array, result, entry, toreturn;
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;

            if (!(req.query && req.query.docid && req.query.docid.length > 0)) {
              _context3.next = 10;
              break;
            }

            page = req.query.page && req.query.page.length > 0 ? req.query.page : 1;
            user = req.query.user && req.query.user.length > 0 ? req.query.user : "";
            console.log(user + "  -- " + JSON.stringify(req.query));
            _context3.next = 7;
            return getAnnotationByID(req.query.docid, page, user);

          case 7:
            annotations = _context3.sent;
            _context3.next = 11;
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

            _context3.next = 21;
            break;

          case 18:
            _context3.prev = 18;
            _context3.t0 = _context3["catch"](0);
            res.send({
              "state": "failed"
            });

          case 21:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 18]]);
  }));

  return function (_x18, _x19) {
    return _ref3.apply(this, arguments);
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
    total: DOCS.length
  });
});
app.get('/api/classify',
/*#__PURE__*/
function () {
  var _ref4 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee4(req, res) {
    return _regenerator.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!(req.query && req.query.terms)) {
              _context4.next = 8;
              break;
            }

            console.log(req.query.terms);
            _context4.t0 = res;
            _context4.next = 5;
            return classify(req.query.terms.split(","));

          case 5:
            _context4.t1 = _context4.sent;
            _context4.t2 = {
              results: _context4.t1
            };

            _context4.t0.send.call(_context4.t0, _context4.t2);

          case 8:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function (_x20, _x21) {
    return _ref4.apply(this, arguments);
  };
}());

function readyTableData(_x22, _x23, _x24) {
  return _readyTableData.apply(this, arguments);
}

function _readyTableData() {
  _readyTableData = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee17(docid, page, method) {
    var htmlFolder, htmlFile, result;
    return _regenerator.default.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            docid = docid + "_" + page + ".html";
            htmlFolder = tables_folder + "/";
            htmlFile = docid;
            result = new Promise(function (resolve, reject) {
              try {
                fs.readFile(htmlFolder + htmlFile, "utf8", function (err, data) {
                  fs.readFile(cssFolder + "/" + "stylesheet.css", "utf8",
                  /*#__PURE__*/
                  function () {
                    var _ref10 = (0, _asyncToGenerator2.default)(
                    /*#__PURE__*/
                    _regenerator.default.mark(function _callee16(err2, data_ss) {
                      var tablePage, spaceRow, htmlHeader, findHeader, possible_tags_for_title, t, actual_table, colum_with_numbers, formattedPage, predictions, terms_matrix, preds_matrix, class_matrix, content_type_matrix, max_col, l, getTopDescriptors, cleanModifier, col_top_descriptors, c, content_types_in_column, unique_modifiers_in_column, u, unique_modifier, column_data, column_terms, k, allfreqs, all_terms, descriptors, row_top_descriptors, r, content_types_in_row, row_data, row_terms, predicted;
                      return _regenerator.default.wrap(function _callee16$(_context16) {
                        while (1) {
                          switch (_context16.prev = _context16.next) {
                            case 0:
                              _context16.prev = 0;
                              tablePage = cheerio.load(data); // tablePage("col").removeAttr('style');

                              if (tablePage) {
                                _context16.next = 5;
                                break;
                              }

                              resolve({
                                htmlHeader: "",
                                formattedPage: "",
                                title: ""
                              });
                              return _context16.abrupt("return");

                            case 5:
                              _context16.next = 11;
                              break;

                            case 7:
                              _context16.prev = 7;
                              _context16.t0 = _context16["catch"](0);
                              // console.log(JSON.stringify(e)+" -- " + JSON.stringify(data))
                              resolve({
                                htmlHeader: "",
                                formattedPage: "",
                                title: ""
                              });
                              return _context16.abrupt("return");

                            case 11:
                              spaceRow = -1;
                              htmlHeader = "";

                              findHeader = function findHeader(tablePage, tag) {
                                var totalTextChars = 0;
                                var headerNodes = [cheerio(tablePage(tag)[0]).remove()];
                                var htmlHeader = "";

                                for (var h in headerNodes) {
                                  // cheerio(headerNodes[h]).css("font-size","20px");
                                  var headText = cheerio(headerNodes[h]).text().trim();
                                  var textLimit = 400;
                                  var actualText = headText.length > textLimit ? headText.slice(0, textLimit - 1) + " [...] " : headText;
                                  totalTextChars += actualText.length;
                                  htmlHeader = htmlHeader + '<tr ><td style="font-size:20px; font-weight:bold; white-space: normal;">' + actualText + "</td></tr>";
                                }

                                return {
                                  htmlHeader: htmlHeader,
                                  totalTextChars: totalTextChars
                                };
                              };

                              possible_tags_for_title = [".headers", ".caption", ".captions", ".article-table-caption"];
                              _context16.t1 = _regenerator.default.keys(possible_tags_for_title);

                            case 16:
                              if ((_context16.t2 = _context16.t1()).done) {
                                _context16.next = 23;
                                break;
                              }

                              t = _context16.t2.value;
                              htmlHeader = findHeader(tablePage, possible_tags_for_title[t]);

                              if (!(htmlHeader.totalTextChars > 0)) {
                                _context16.next = 21;
                                break;
                              }

                              return _context16.abrupt("break", 23);

                            case 21:
                              _context16.next = 16;
                              break;

                            case 23:
                              htmlHeader = "<table>" + htmlHeader.htmlHeader + "</table>";
                              actual_table = tablePage("table").parent().html();
                              actual_table = cheerio.load(actual_table); // The following lines remove, line numbers present in some tables, as well as positions in headings derived from the excel sheets  if present.

                              colum_with_numbers = actual_table("tr > td:nth-child(1), tr > td:nth-child(2), tr > th:nth-child(1), tr > th:nth-child(2)");

                              if (colum_with_numbers.text().replace(/[0-9]/gi, "").replace(/\s+/g, "").toLowerCase() === "row/col") {
                                colum_with_numbers.remove();
                              }

                              if (actual_table("thead").text().trim().indexOf("1(A)") > -1) {
                                actual_table("thead").remove();
                              } ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


                              actual_table = actual_table.html(); // var ss = "<style>"+data_ss+" td {width: auto;} tr:hover {background: aliceblue} td:hover {background: #82c1f8} col{width:100pt} </style>"

                              formattedPage = "<div><style>" + data_ss + "</style>" + actual_table + "</div>";
                              _context16.next = 33;
                              return attempt_predictions(actual_table);

                            case 33:
                              predictions = _context16.sent;
                              terms_matrix = predictions.map(function (e) {
                                return e.terms.map(function (term) {
                                  return prepare_cell_text(term);
                                });
                              });
                              preds_matrix = predictions.map(function (e) {
                                return e.terms.map(function (term) {
                                  return e.pred_class[prepare_cell_text(term)];
                                });
                              });
                              class_matrix = predictions.map(function (e) {
                                return e.cellClasses.map(function (cellClass) {
                                  return cellClass;
                                });
                              }); // values in this matrix represent the cell contents, and can be: "text", "numeric" or ""

                              content_type_matrix = predictions.map(function (e) {
                                return e.terms.map(function (term) {
                                  var numberless_size = term.replace(/([^A-z0-9 ])/g, "").replace(/[0-9]+/g, '').replace(/ +/g, " ").trim().length;
                                  var spaceless_size = term.replace(/([^A-z0-9 ])/g, "").replace(/ +/g, " ").trim().length;
                                  return spaceless_size == 0 ? "" : numberless_size >= spaceless_size / 2 ? "text" : "numeric";
                                });
                              });
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
                              };

                              cleanModifier = function cleanModifier(modifier) {
                                // I used to .replace("firstCol","").replace("firstLastCol","") the modifier.
                                return modifier.replace("firstCol", "empty_row").replace("firstLastCol", "empty_row_with_p_value").replace("indent0", "indent").replace("indent1", "indent").replace("indent2", "indent").replace("indent3", "indent").replace("indent4", "indent").trim();
                              }; //Estimate column predictions.


                              col_top_descriptors = [];
                              c = 0;

                            case 44:
                              if (!(c < max_col)) {
                                _context16.next = 74;
                                break;
                              }

                              content_types_in_column = content_type_matrix.map(function (x, i) {
                                return [x[c], i];
                              }).reduce(function (countMap, word) {
                                switch (word[0]) {
                                  case "numeric":
                                    countMap["total_numeric"] = ++countMap["total_numeric"] || 1;
                                    break;

                                  case "text":
                                    countMap["total_text"] = ++countMap["total_text"] || 1;
                                    break;

                                  default:
                                    countMap["total_empty"] = ++countMap["total_empty"] || 1;
                                }

                                return countMap;
                              }, {
                                total_numeric: 0,
                                total_text: 0,
                                total_empty: 0
                              });

                              if (content_types_in_column.total_text >= content_types_in_column.total_numeric) {
                                _context16.next = 48;
                                break;
                              }

                              return _context16.abrupt("continue", 71);

                            case 48:
                              unique_modifiers_in_column = class_matrix.map(function (x) {
                                return x[c];
                              }).map(cleanModifier).filter(function (v, i, a) {
                                return a.indexOf(v) === i;
                              });
                              _context16.t3 = _regenerator.default.keys(unique_modifiers_in_column);

                            case 50:
                              if ((_context16.t4 = _context16.t3()).done) {
                                _context16.next = 71;
                                break;
                              }

                              u = _context16.t4.value;
                              unique_modifier = unique_modifiers_in_column[u];
                              column_data = preds_matrix.map(function (x, i) {
                                return [x[c], i];
                              }).reduce(function (countMap, word) {
                                var i = word[1];
                                word = word[0];

                                if (unique_modifier === cleanModifier(class_matrix[i][c])) {
                                  countMap.freqs[word] = ++countMap.freqs[word] || 1;
                                  var max = countMap["max"] || 0;
                                  countMap["max"] = max < countMap.freqs[word] ? countMap.freqs[word] : max;
                                  countMap["total"] = ++countMap["total"] || 1;
                                }

                                return countMap;
                              }, {
                                total: 0,
                                freqs: {}
                              });
                              column_terms = preds_matrix.map(function (x, i) {
                                return [x[c], i];
                              }).reduce(function (countMap, word) {
                                var i = word[1];
                                word = terms_matrix[i][c];

                                if (unique_modifier === cleanModifier(class_matrix[i][c])) {
                                  if (word.length > 0 && word != undefined) {
                                    if (countMap[unique_modifier]) {
                                      countMap[unique_modifier].push(word);
                                    } else {
                                      countMap[unique_modifier] = [word];
                                    }
                                  }
                                }

                                return countMap;
                              }, {});

                              for (k in column_data.freqs) {
                                // to qualify for a column descriptor the frequency should at least be half of the length of the column headings.
                                if (column_data.freqs[undefined] == column_data.max || column_data.freqs[k] == 1) {
                                  allfreqs = column_data.freqs;
                                  delete allfreqs[k];
                                  column_data.freqs = allfreqs;
                                }
                              }

                              _context16.t5 = METHOD;
                              _context16.next = _context16.t5 === "grouped_predictor" ? 59 : 67;
                              break;

                            case 59:
                              all_terms = column_terms[unique_modifier] ? column_terms[unique_modifier].join(" ") : "";

                              if (!(column_terms[unique_modifier] && all_terms && column_terms[unique_modifier].length > 1 && all_terms.length > 0)) {
                                _context16.next = 66;
                                break;
                              }

                              _context16.next = 63;
                              return grouped_predictor(all_terms);

                            case 63:
                              descriptors = _context16.sent;
                              descriptors = descriptors[all_terms].split(";");
                              col_top_descriptors[col_top_descriptors.length] = {
                                descriptors: descriptors,
                                c: c,
                                unique_modifier: unique_modifier
                              };

                            case 66:
                              return _context16.abrupt("break", 69);

                            case 67:
                              descriptors = getTopDescriptors(3, column_data.freqs, ["arms", "undefined"]);
                              if (descriptors.length > 0) col_top_descriptors[col_top_descriptors.length] = {
                                descriptors: descriptors,
                                c: c,
                                unique_modifier: unique_modifier
                              };

                            case 69:
                              _context16.next = 50;
                              break;

                            case 71:
                              c++;
                              _context16.next = 44;
                              break;

                            case 74:
                              // Estimate row predictions
                              row_top_descriptors = [];
                              _context16.t6 = _regenerator.default.keys(preds_matrix);

                            case 76:
                              if ((_context16.t7 = _context16.t6()).done) {
                                _context16.next = 99;
                                break;
                              }

                              r = _context16.t7.value;
                              content_types_in_row = content_type_matrix[r].reduce(function (countMap, word) {
                                switch (word) {
                                  case "numeric":
                                    countMap["total_numeric"] = ++countMap["total_numeric"] || 1;
                                    break;

                                  case "text":
                                    countMap["total_text"] = ++countMap["total_text"] || 1;
                                    break;

                                  default:
                                    countMap["total_empty"] = ++countMap["total_empty"] || 1;
                                }

                                return countMap;
                              }, {
                                total_numeric: 0,
                                total_text: 0,
                                total_empty: 0
                              });

                              if (content_types_in_row.total_text >= content_types_in_row.total_numeric) {
                                _context16.next = 81;
                                break;
                              }

                              return _context16.abrupt("continue", 76);

                            case 81:
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

                              row_terms = terms_matrix[r].reduce(function (allTerms, term) {
                                if (term && term.length > 0) {
                                  allTerms.push(term);
                                }

                                return allTerms;
                              }, []);
                              _context16.t8 = METHOD;
                              _context16.next = _context16.t8 === "grouped_predictor" ? 87 : 95;
                              break;

                            case 87:
                              all_terms = row_terms.join(" ");

                              if (!(row_terms.length > 1)) {
                                _context16.next = 94;
                                break;
                              }

                              _context16.next = 91;
                              return grouped_predictor(all_terms);

                            case 91:
                              descriptors = _context16.sent;
                              descriptors = descriptors[all_terms].split(";");
                              row_top_descriptors[row_top_descriptors.length] = {
                                descriptors: descriptors,
                                c: r,
                                unique_modifier: ""
                              };

                            case 94:
                              return _context16.abrupt("break", 97);

                            case 95:
                              descriptors = getTopDescriptors(3, row_data.freqs, ["undefined"]);
                              if (descriptors.length > 0) row_top_descriptors[row_top_descriptors.length] = {
                                descriptors: descriptors,
                                c: r,
                                unique_modifier: ""
                              };

                            case 97:
                              _context16.next = 76;
                              break;

                            case 99:
                              predicted = {
                                cols: col_top_descriptors,
                                rows: row_top_descriptors // res.send({status: "good", htmlHeader,formattedPage, title:  titles_obj[req.query.docid.split(" ")[0]], predicted })

                              };
                              resolve({
                                status: "good",
                                htmlHeader: htmlHeader,
                                formattedPage: formattedPage,
                                title: titles_obj[docid.split(" ")[0]],
                                predicted: predicted
                              });

                            case 101:
                            case "end":
                              return _context16.stop();
                          }
                        }
                      }, _callee16, this, [[0, 7]]);
                    }));

                    return function (_x35, _x36) {
                      return _ref10.apply(this, arguments);
                    };
                  }());
                });
              } catch (e) {
                reject(e);
              }
            });
            return _context17.abrupt("return", result);

          case 5:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17, this);
  }));
  return _readyTableData.apply(this, arguments);
}

app.get('/api/getTable',
/*#__PURE__*/
function () {
  var _ref5 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee5(req, res) {
    var tableData;
    return _regenerator.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;

            if (!(req.query && req.query.docid && req.query.page && available_documents[req.query.docid] && available_documents[req.query.docid].pages.indexOf(req.query.page) > -1)) {
              _context5.next = 8;
              break;
            }

            _context5.next = 4;
            return readyTableData(req.query.docid, req.query.page);

          case 4:
            tableData = _context5.sent;
            res.send(tableData);
            _context5.next = 9;
            break;

          case 8:
            res.send({
              status: "wrong parameters",
              query: req.query
            });

          case 9:
            _context5.next = 15;
            break;

          case 11:
            _context5.prev = 11;
            _context5.t0 = _context5["catch"](0);
            console.log(_context5.t0);
            res.send({
              status: "probably page out of bounds, or document does not exist",
              query: req.query
            });

          case 15:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this, [[0, 11]]);
  }));

  return function (_x25, _x26) {
    return _ref5.apply(this, arguments);
  };
}());
app.get('/api/getAvailableTables', function (req, res) {
  res.send(available_documents);
});
app.get('/api/getAnnotations',
/*#__PURE__*/
function () {
  var _ref6 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee6(req, res) {
    return _regenerator.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.t0 = res;
            _context6.next = 3;
            return getAnnotationResults();

          case 3:
            _context6.t1 = _context6.sent;

            _context6.t0.send.call(_context6.t0, _context6.t1);

          case 5:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function (_x27, _x28) {
    return _ref6.apply(this, arguments);
  };
}());
app.get('/api/getAnnotationByID',
/*#__PURE__*/
function () {
  var _ref7 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee7(req, res) {
    var page, user, annotations, final_annotations, r, ann, existing, final_annotations_array, entry;
    return _regenerator.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            if (!(req.query && req.query.docid && req.query.docid.length > 0)) {
              _context7.next = 13;
              break;
            }

            page = req.query.page && req.query.page.length > 0 ? req.query.page : 1;
            user = req.query.user && req.query.user.length > 0 ? req.query.user : "";
            _context7.next = 5;
            return getAnnotationByID(req.query.docid, page, user);

          case 5:
            annotations = _context7.sent;
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

            _context7.next = 14;
            break;

          case 13:
            res.send({
              error: "failed request"
            });

          case 14:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));

  return function (_x29, _x30) {
    return _ref7.apply(this, arguments);
  };
}());
app.get('/api/recordAnnotation',
/*#__PURE__*/
function () {
  var _ref8 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee8(req, res) {
    return _regenerator.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            console.log(JSON.stringify(req.query));

            if (!(req.query && req.query.docid.length > 0 && req.query.page.length > 0 && req.query.user.length > 0 && req.query.annotation.length > 0)) {
              _context8.next = 4;
              break;
            }

            _context8.next = 4;
            return insertAnnotation(req.query.docid, req.query.page, req.query.user, {
              annotations: JSON.parse(req.query.annotation)
            }, req.query.corrupted, req.query.tableType, req.query.corrupted_text);

          case 4:
            //insertAnnotation("a doucment",2, "a user", {})
            res.send("saved annotation: " + JSON.stringify(req.query));

          case 5:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));

  return function (_x31, _x32) {
    return _ref8.apply(this, arguments);
  };
}());
app.listen(_config.PORT, function () {
  console.log('Express Server running on port ' + _config.PORT + ' ' + new Date().toISOString());
});