"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

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

var bodyParser = require('body-parser');

var html = require("html");

var fs = require('fs');

var request = require("request");

var cheerio = require('cheerio');

var _require = require('pg'),
    Pool = _require.Pool,
    Client = _require.Client,
    Query = _require.Query;

var csv = require('csv-parser');

var CsvReadableStream = require('csv-reader');

var fs = require('fs');

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

var cors = require('cors'); // var whitelist = ['http://sephirhome.ddns.net:7532', 'http://sephirhome.ddns.net:7531','http://localhost:7531']


app.use(cors()); // var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
//
//
//
// app.options('*', cors(corsOptions))
// use it before all route definitions

app.use(cors("*")); // import {PythonShell} from 'python-shell';

app.use(express.static(__dirname + '/domainParserviews')); //Store all HTML files in view folder.

app.use(express.static(__dirname + '/views')); //Store all JS and CSS in Scripts folder.

app.use(express.static(__dirname + '/dist'));
app.use(express.static(__dirname + '/images'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
var titles_obj = {};
Object.defineProperty(Array.prototype, 'flat', {
  value: function value() {
    var depth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    return this.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) && depth > 1 ? toFlatten.flat(depth - 1) : toFlatten);
    }, []);
  }
});

for (var t in _titles.TITLES) {
  titles_obj[_titles.TITLES[t].pmid.split(" ")[0]] = {
    title: _titles.TITLES[t].title,
    abstract: _titles.TITLES[t].abstract
  };
}

var ops_counter = 0;
var available_documents = {};
var abs_index = [];
var tables_folder = "HTML_TABLES";
var tables_folder_deleted = "HTML_TABLES_DELETED";
var cssFolder = "HTML_STYLES";
var DOCS = [];
var clusterTerms = {};
var msh_categories_csv = [];
var msh_categories = {};
fs.createReadStream('pmid_msh_label.csv').pipe(csv({
  separator: ';'
})).on('data', function (data) {
  return msh_categories_csv.push(data);
}).on('end', function () {
  var catIndex = msh_categories_csv.reduce(function (acc, item) {
    acc[item.mesh_broad_label] = item.pmid.split("&");
    return acc;
  }, {});
  var pmids_w_cat = msh_categories_csv.reduce(function (acc, item) {
    var pmids = item.pmid.split("&");
    acc = (0, _toConsumableArray2.default)(acc).concat([pmids]);
    return acc;
  }, []).flat();
  var allcats = Object.keys(catIndex);
  allcats.push("NA");
  catIndex["NA"] = [];
  msh_categories = {
    catIndex: catIndex,
    allcats: allcats,
    pmids_w_cat: pmids_w_cat
  };
});

function CUIData() {
  return _CUIData.apply(this, arguments);
}

function _CUIData() {
  _CUIData = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee49() {
    var semtypes, cui_def, cui_concept, actual_results;
    return _regenerator.default.wrap(function _callee49$(_context49) {
      while (1) {
        switch (_context49.prev = _context49.next) {
          case 0:
            semtypes = new Promise(function (resolve, reject) {
              var inputStream = fs.createReadStream('cui_def.csv', 'utf8');
              var result = {};
              inputStream.pipe(new CsvReadableStream({
                parseNumbers: true,
                parseBooleans: true,
                trim: true,
                skipHeader: true
              })).on('data', function (row) {
                //console.log('A row arrived: ', row);
                row[4].split(";").map(function (st) {
                  result[st] = result[st] ? result[st] + 1 : 1;
                });
              }).on('end', function (data) {
                resolve(result);
              });
            });
            _context49.next = 3;
            return semtypes;

          case 3:
            semtypes = _context49.sent;
            cui_def = new Promise(function (resolve, reject) {
              var inputStream = fs.createReadStream('cui_def.csv', 'utf8');
              var result = {};
              inputStream.pipe(new CsvReadableStream({
                parseNumbers: true,
                parseBooleans: true,
                trim: true,
                skipHeader: true
              })).on('data', function (row) {
                //console.log('A row arrived: ', row);
                result[row[0]] = {
                  "matchedText": row[1],
                  "preferred": row[2],
                  "hasMSH": row[3],
                  "semTypes": row[4]
                };
              }).on('end', function (data) {
                resolve(result);
              });
            });
            _context49.next = 7;
            return cui_def;

          case 7:
            cui_def = _context49.sent;
            cui_concept = new Promise(function (resolve, reject) {
              var inputStream = fs.createReadStream('cui_concept.csv', 'utf8');
              var result = {};
              inputStream.pipe(new CsvReadableStream({
                parseNumbers: true,
                parseBooleans: true,
                trim: true,
                skipHeader: true
              })).on('data', function (row) {
                //console.log('A row arrived: ', row);
                result[row[0]] = row[1];
              }).on('end', function (data) {
                resolve(result);
              });
            });
            _context49.next = 11;
            return cui_concept;

          case 11:
            cui_concept = _context49.sent;
            actual_results = new Promise(function (resolve, reject) {
              var inputStream = fs.createReadStream('Feb2020_allresults.csv', 'utf8');
              var result = {};
              inputStream.pipe(new CsvReadableStream({
                parseNumbers: true,
                parseBooleans: true,
                trim: true,
                skipHeader: true
              })).on('data', function (row) {
                var currentItem = result[row[1] + "_" + row[2]] || {}; // Only want one version of the annotations. There should be only one. If not, clean it up! As we have no automatic way to determine which one is best.

                if (currentItem["user"] && currentItem["user"].length > 0 && currentItem["user"] !== row[0]) {
                  currentItem = {};
                }

                currentItem["user"] = row[0];
                currentItem["minPos"] = currentItem["minPos"] && currentItem["minPos"] < row[6] ? currentItem["minPos"] : row[6];
                var currentLoc = currentItem[row[5]] ? currentItem[row[5]] : {};
                currentLoc[row[6]] = {
                  descriptors: row[7],
                  modifier: row[8]
                };
                currentItem[row[5]] = currentLoc;
                result[row[1] + "_" + row[2]] = currentItem;
              }).on('end', function (data) {
                resolve(result);
              });
            });
            _context49.next = 15;
            return actual_results;

          case 15:
            actual_results = _context49.sent;
            return _context49.abrupt("return", {
              cui_def: cui_def,
              cui_concept: cui_concept,
              actual_results: actual_results,
              semtypes: semtypes
            });

          case 17:
          case "end":
            return _context49.stop();
        }
      }
    }, _callee49, this);
  }));
  return _CUIData.apply(this, arguments);
}

function extractMMData(r) {
  try {
    r = JSON.parse(r);
    r = r.AllDocuments[0].Document.Utterances.map(function (utterances) {
      return utterances.Phrases.map(function (phrases) {
        return phrases.Mappings.map(function (mappings) {
          return mappings.MappingCandidates.map(function (candidate) {
            return {
              CUI: candidate.CandidateCUI,
              matchedText: candidate.CandidateMatched,
              preferred: candidate.CandidatePreferred,
              hasMSH: candidate.Sources.indexOf("MSH") > -1
            };
          });
        });
      });
    }).flat().flat().flat(); // This removes duplicate cuis

    r = r.reduce(function (acc, el) {
      if (acc.cuis.indexOf(el.CUI) < 0) {
        acc.cuis.push(el.CUI);
        acc.data.push(el);
      }

      ;
      return acc;
    }, {
      cuis: [],
      data: []
    }).data;
    return r;
  } catch (e) {
    return [];
  }
}

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
  return text.replace(/([^A-z0-9 ])/g, " $1 ").replace(/[0-9]+/g, ' $nmbr$ ').replace(/ +/g, " ").trim().toLowerCase();
}

function prepareAvailableDocuments(_x, _x2, _x3, _x4) {
  return _prepareAvailableDocuments.apply(this, arguments);
}

function _prepareAvailableDocuments() {
  _prepareAvailableDocuments = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee50(filter_topic, filter_type, hua, filter_group) {
    var ftop, ftyp, fgroup, type_lookup, i, filtered_docs_ttype, allAnnotations, all_annotated_docids, ordered_Splits, selected_group_docs, group_index, results;
    return _regenerator.default.wrap(function _callee50$(_context50) {
      while (1) {
        switch (_context50.prev = _context50.next) {
          case 0:
            // debugger
            ftop = filter_topic ? filter_topic : [];
            ftyp = filter_type ? filter_type : [];
            fgroup = filter_group ? filter_group : [];
            hua = hua;
            type_lookup = {
              "Baseline Characteristics": "baseline_table",
              "Results with subgroups": "result_table_subgroup",
              "Results without subgroups": "result_table_without_subgroup",
              "Other": "other_table",
              "Unassigned": "NA"
            };

            for (i = 0; i < ftyp.length; i++) {
              ftyp[i] = type_lookup[ftyp[i]];
            }

            filtered_docs_ttype = [];
            _context50.next = 9;
            return getAnnotationResults();

          case 9:
            allAnnotations = _context50.sent;
            all_annotated_docids = Array.from(new Set(allAnnotations.rows.reduce(function (acc, ann) {
              acc = acc ? acc : [];
              acc.push(ann.docid + "_" + ann.page);
              return acc;
            }, [])));

            if (ftop.length + ftyp.length > 0) {
              filtered_docs_ttype = allAnnotations.rows.reduce(function (acc, ann) {
                acc = acc ? acc : [];

                if (ann.tableType != "" && ftyp.indexOf(ann.tableType) > -1) {
                  acc.push(ann.docid + "_" + ann.page);
                }

                return acc;
              }, []);
              filtered_docs_ttype = Array.from(new Set(filtered_docs_ttype));
            }

            ordered_Splits = [["30936738_1.html", "30936738_2.html", "30936738_3.html", "30936738_4.html", "30936738_5.html", "16508926_6.html", "27744141_2.html", "27098404_1.html", "30341453_1.html", "30341453_2.html"], ["16495392fig_2.html", "24907147_2.html", "24907147_3.html", "24907147_4.html", "24907147_5.html", "27502582_2.html", "30473179_3.html", "25047021_1.html", "27165179_2.html", "29338762_2.html"], ["27493790_2.html", "29299340_2.html", "30696483_2.html", "29409133_1.html", "28968735_2.html", "28968735_3.html", "29045207_2.html", "29685860fig_1.html", "20484828_2.html", "26589819_1.html"], ["19515181_2.html", "25414932_1.html", "26833744_2.html", "26833744_3.html", "30287422_2.html", "29937431_2.html", "25881510_2.html", "25772548_2.html", "29941478fig_1.html", "30425095_1.html"], ["30425095b_1.html", "27161178_2.html", "30609212_1.html", "30609212_2.html", "19210140_2.html", "26579834_1.html", "26579834_5.html", "26580237_3.html", "27299675_1.html", "29777264fig_1.html"], ["30393950_2.html", "19614946_2.html", "19614946_3.html", "26934128_2.html", "30614616_1.html", "30571562_2.html", "26786577_2.html", "18284434_2.html", "22672586_2.html", "30851070_1.html"], ["30830724_1.html", "30830724_2.html", "25468945_2.html", "25629790_2.html", "30882238_1.html", "19508464_1.html", "19508464_2.html", "30566006fig_1.html", "30566004_2.html", "30392095_2.html"], ["19650752_2.html", "30953107_1.html", "30953107_2.html", "21545947fig_2.html", "19917888app_1.html", "19917888fig_2.html", "17384437fig_1.html", "9036306_1.html", "18371559_1.html", "27395349_2.html"], ["27354044_3.html", "26541915_6.html", "26027630fig_1.html", "30183102fig_1.html", "15639688_2.html", "17560879_2.html", "27619750_3.html", "24411003_1.html", "25743173_2.html", "25743173_3.html"], ["19166691_2.html", "27956003_2.html", "27846344fig_2.html", "25135178_2.html", "25282519_2.html", "19190658_2.html", "20670726_2.html", "22747613_2.html", "22747613_3.html", "21925996_2.html"], ["21925996_3.html", "21925996_4.html", "24067881_2.html", "22504093_2.html", "30203005_2.html", "29857145_3.html", "29857145_4.html", "29857145_5.html", "29857145_6.html", "29857145_7.html"], ["21723220_1.html", "21723220_2.html", "21723220_3.html", "16267322_2.html", "22704916_2.html", "17634459_2.html", "20491747_2.html", "29909019_2.html", "29797519_1.html", "24120253_4.html"], ["20429821_2.html", "20429821_3.html", "20429821_4.html", "21227674_2.html", "20463178_2.html", "27609408_2.html", "24966672_3.html", "30815468_1.html", "30815468_2.html", "30815468_3.html"], ["27087007_1.html", "27316465_2.html", "27316465_3.html", "27316465_4.html", "27316465_5.html", "27215749_3.html", "27715335_2.html", "18511702_2.html", "21627828_2.html", "21627828_3.html"], ["27039236_2.html", "21586508_2.html", "28558833_2.html", "28558833_3.html", "29413502_2.html", "21875546_2.html", "23040786_2.html", "28903864_2.html", "30053967fig_1.html", "20925534_2.html"], ["20925534_3.html", "29073947_2.html", "26994121_2.html", "25787199_2.html", "24727254_2.html", "26059896fig_2.html", "20385930fig_2.html", "19389561fig_2.html", "21816478_2.html", "7997016_1.html"], ["9603532_1.html", "9848888_2.html", "18479744_2.html", "24780614_3.html", "17244641_2.html", "26630143_2.html", "26304934_2.html", "19915221_2.html", "8950879_1.html", "30659410_1.html"], ["30659410_2.html", "30659410_3.html", "30465321_2.html", "30465321_3.html", "30465321_4.html", "30465321_5.html", "30465321_6.html", "26547918_2.html", "22316106_2.html", "22436129_2.html"], ["22709460_2.html", "23564919_2.html", "23683134_2.html", "24251359_3.html", "26093161_1.html", "26578849_2.html", "27103795_1.html", "27207971_1.html", "27387994_1.html", "27496855_1.html"]];
            selected_group_docs = [];

            for (i in fgroup) {
              group_index = parseInt(fgroup[i]) - 1;
              selected_group_docs = (0, _toConsumableArray2.default)(selected_group_docs).concat((0, _toConsumableArray2.default)(ordered_Splits[group_index]));
            }

            selected_group_docs = selected_group_docs.flat(); // debugger

            results = new Promise(function (resolve, reject) {
              var available_documents = {};
              var abs_index = [];
              var DOCS = [];

              var fixVersionOrder = function fixVersionOrder(a) {
                var i = a.indexOf("v");

                if (i > -1) {
                  return a.slice(0, i) + a.slice(i + 2, a.length) + a.slice(i, i + 2);
                } else {
                  return a;
                }
              };

              fs.readdir(tables_folder, function (err, items) {
                if (selected_group_docs.length > 0) {
                  DOCS = selected_group_docs;
                } else {
                  DOCS = items.sort(function (a, b) {
                    return fixVersionOrder(a).localeCompare(fixVersionOrder(b));
                  });
                } // DOCS = selected_group_docs.length > 0 ? selected_group_docs : DOCS;
                // DOCS
                // console.log(selected_group_docs)
                //
                // debugger


                DOCS = DOCS.reduce(function (acc, docfile) {
                  var docid = docfile.split("_")[0].split("v")[0];
                  var docid_V = docfile.split("_")[0];
                  var page = docfile.split("_")[1].split(".")[0]; // if ( docfile.indexOf("29937431") > -1 ){
                  //   debugger
                  // }

                  if (ftop.length + ftyp.length > 0 && msh_categories && msh_categories.catIndex) {
                    var topic_enabled = ftop.length > 0;
                    var topic_intersection = ftop.reduce(function (acc, cat) {
                      return acc || msh_categories.catIndex[cat].indexOf(docid) > -1;
                    }, false);

                    if (ftop.indexOf("NA") > -1) {
                      if (msh_categories.pmids_w_cat.indexOf(docid) < 0) {
                        topic_intersection = true;
                      }
                    }

                    var type_enabled = ftyp.length > 0;
                    var type_intersection = type_enabled && filtered_docs_ttype.length > 0 && filtered_docs_ttype.indexOf(docid_V + "_" + page) > -1;
                    var isAnnotated = all_annotated_docids.indexOf(docid_V + "_" + page) > -1;
                    var show_not_annotated = !hua;
                    var accept_docid = false; // Logic to control the filter. It depends in many variables with many controlled outcomes, so it looks a bit complicated

                    if (topic_enabled && type_enabled) {
                      accept_docid = topic_intersection ? true : accept_docid;
                      accept_docid = type_intersection || show_not_annotated && !isAnnotated ? accept_docid : false;
                    } else if (topic_enabled && !type_enabled) {
                      accept_docid = topic_intersection ? true : accept_docid;
                      accept_docid = !show_not_annotated ? isAnnotated && topic_intersection : accept_docid;
                    } else if (!topic_enabled && type_enabled) {
                      accept_docid = type_intersection || show_not_annotated && !isAnnotated ? true : false;
                    } else if (!topic_enabled && !type_enabled) {
                      accept_docid = !show_not_annotated ? isAnnotated : true;
                    } // End of filter logic.


                    if (accept_docid) {
                      acc.push(docfile);
                    }
                  } else {
                    // Default path when no filters are enabled
                    if (!hua) {
                      // The document is not annotated, so always add.
                      acc.push(docfile);
                    } else {
                      if (all_annotated_docids.indexOf(docid_V + "_" + page) > -1) {
                        acc.push(docfile);
                      }
                    }
                  }

                  return acc;
                }, []);
                DOCS = Array.from(new Set(DOCS));

                try {
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
                  } // console.log("YAY")


                  resolve({
                    available_documents: available_documents,
                    abs_index: abs_index,
                    DOCS: DOCS
                  });
                } catch (e) {
                  console.log("FAILED: " + JSON.stringify(e));
                  reject(e);
                }
              });
            });
            _context50.next = 19;
            return results;

          case 19:
            return _context50.abrupt("return", _context50.sent);

          case 20:
          case "end":
            return _context50.stop();
        }
      }
    }, _callee50, this);
  }));
  return _prepareAvailableDocuments.apply(this, arguments);
}

function getAnnotationResults() {
  return _getAnnotationResults.apply(this, arguments);
}

function _getAnnotationResults() {
  _getAnnotationResults = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee51() {
    var client, result;
    return _regenerator.default.wrap(function _callee51$(_context51) {
      while (1) {
        switch (_context51.prev = _context51.next) {
          case 0:
            _context51.next = 2;
            return pool.connect();

          case 2:
            client = _context51.sent;
            _context51.next = 5;
            return client.query("select * from annotations order by docid desc,page asc");

          case 5:
            result = _context51.sent;
            client.release();
            return _context51.abrupt("return", result);

          case 8:
          case "end":
            return _context51.stop();
        }
      }
    }, _callee51, this);
  }));
  return _getAnnotationResults.apply(this, arguments);
}

function getMetadataLabellers() {
  return _getMetadataLabellers.apply(this, arguments);
}

function _getMetadataLabellers() {
  _getMetadataLabellers = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee52() {
    var client, result;
    return _regenerator.default.wrap(function _callee52$(_context52) {
      while (1) {
        switch (_context52.prev = _context52.next) {
          case 0:
            _context52.next = 2;
            return pool.connect();

          case 2:
            client = _context52.sent;
            _context52.next = 5;
            return client.query("select distinct docid, page, labeller from metadata");

          case 5:
            result = _context52.sent;
            client.release();
            return _context52.abrupt("return", result);

          case 8:
          case "end":
            return _context52.stop();
        }
      }
    }, _callee52, this);
  }));
  return _getMetadataLabellers.apply(this, arguments);
}

function getAnnotationByID(_x5, _x6, _x7) {
  return _getAnnotationByID.apply(this, arguments);
}

function _getAnnotationByID() {
  _getAnnotationByID = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee53(docid, page, user) {
    var client, result;
    return _regenerator.default.wrap(function _callee53$(_context53) {
      while (1) {
        switch (_context53.prev = _context53.next) {
          case 0:
            _context53.next = 2;
            return pool.connect();

          case 2:
            client = _context53.sent;
            _context53.next = 5;
            return client.query('select * from annotations where docid=$1 AND page=$2 AND "user"=$3 order by docid desc,page asc', [docid, page, user]);

          case 5:
            result = _context53.sent;
            client.release();
            return _context53.abrupt("return", result);

          case 8:
          case "end":
            return _context53.stop();
        }
      }
    }, _callee53, this);
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

function classify(_x8) {
  return _classify.apply(this, arguments);
}

function _classify() {
  _classify = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee54(terms) {
    var result;
    return _regenerator.default.wrap(function _callee54$(_context54) {
      while (1) {
        switch (_context54.prev = _context54.next) {
          case 0:
            result = new Promise(function (resolve, reject) {
              var cleanTerms = [];

              for (t in terms) {
                var term = prepare_cell_text(terms[t]);

                if (term.length > 0) {
                  if (term.replace(/[^a-z]/g, "").length > 2) {
                    // na's and "to" as part of ranges matching this length. Potentially other rubbish picked up here.
                    cleanTerms[cleanTerms.length] = term;
                  }
                }
              }

              if (cleanTerms.length > 0) {
                python(_templateObject3(), cleanTerms).then(function (x) {
                  return resolve(x);
                }).catch(python.Exception, function (e) {
                  return console.log("python error: " + e);
                });
              } else {
                resolve({});
              }
            });
            return _context54.abrupt("return", result);

          case 2:
          case "end":
            return _context54.stop();
        }
      }
    }, _callee54, this);
  }));
  return _classify.apply(this, arguments);
}

function grouped_predictor(_x9) {
  return _grouped_predictor.apply(this, arguments);
}

function _grouped_predictor() {
  _grouped_predictor = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee55(terms) {
    var result;
    return _regenerator.default.wrap(function _callee55$(_context55) {
      while (1) {
        switch (_context55.prev = _context55.next) {
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
            });
            return _context55.abrupt("return", result);

          case 2:
          case "end":
            return _context55.stop();
        }
      }
    }, _callee55, this);
  }));
  return _grouped_predictor.apply(this, arguments);
}

function attempt_predictions(_x10) {
  return _attempt_predictions.apply(this, arguments);
}

function _attempt_predictions() {
  _attempt_predictions = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee57(actual_table) {
    var result;
    return _regenerator.default.wrap(function _callee57$(_context57) {
      while (1) {
        switch (_context57.prev = _context57.next) {
          case 0:
            result = new Promise(
            /*#__PURE__*/
            function () {
              var _ref49 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee56(resolve, reject) {
                var a, lines, predictions, l, currentLine, terms, cellClasses, cellClass, c, cellClassSelector, pred_class;
                return _regenerator.default.wrap(function _callee56$(_context56) {
                  while (1) {
                    switch (_context56.prev = _context56.next) {
                      case 0:
                        _context56.prev = 0;
                        a = cheerio.load(actual_table);
                        lines = a("tr");
                        predictions = new Array(lines.length);
                        l = 0;

                      case 5:
                        if (!(l < lines.length)) {
                          _context56.next = 18;
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
                        }

                        _context56.next = 13;
                        return classify(terms);

                      case 13:
                        pred_class = _context56.sent;
                        predictions[l] = {
                          pred_class: pred_class,
                          terms: terms,
                          cellClasses: cellClasses
                        };

                      case 15:
                        l++;
                        _context56.next = 5;
                        break;

                      case 18:
                        resolve(predictions);
                        _context56.next = 24;
                        break;

                      case 21:
                        _context56.prev = 21;
                        _context56.t0 = _context56["catch"](0);
                        reject(_context56.t0);

                      case 24:
                      case "end":
                        return _context56.stop();
                    }
                  }
                }, _callee56, this, [[0, 21]]);
              }));

              return function (_x126, _x127) {
                return _ref49.apply(this, arguments);
              };
            }());
            return _context57.abrupt("return", result);

          case 2:
          case "end":
            return _context57.stop();
        }
      }
    }, _callee57, this);
  }));
  return _attempt_predictions.apply(this, arguments);
}

function insertAnnotation(_x11, _x12, _x13, _x14, _x15, _x16, _x17) {
  return _insertAnnotation.apply(this, arguments);
}

function _insertAnnotation() {
  _insertAnnotation = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee58(docid, page, user, annotation, corrupted, tableType, corrupted_text) {
    var client, done;
    return _regenerator.default.wrap(function _callee58$(_context58) {
      while (1) {
        switch (_context58.prev = _context58.next) {
          case 0:
            _context58.next = 2;
            return pool.connect();

          case 2:
            client = _context58.sent;
            _context58.next = 5;
            return client.query('INSERT INTO annotations VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (docid, page,"user") DO UPDATE SET annotation = $4, corrupted = $5, "tableType" = $6, "corrupted_text" = $7 ;', [docid, page, user, annotation, corrupted, tableType, corrupted_text]).then(function (result) {
              return console.log("insert: " + result);
            }).catch(function (e) {
              return console.error(e.stack);
            }).then(function () {
              return client.release();
            });

          case 5:
            done = _context58.sent;

          case 6:
          case "end":
            return _context58.stop();
        }
      }
    }, _callee58, this);
  }));
  return _insertAnnotation.apply(this, arguments);
}

function refreshDocuments() {
  return _refreshDocuments.apply(this, arguments);
} // preinitialisation of components if needed.


function _refreshDocuments() {
  _refreshDocuments = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee59() {
    var res;
    return _regenerator.default.wrap(function _callee59$(_context59) {
      while (1) {
        switch (_context59.prev = _context59.next) {
          case 0:
            _context59.next = 2;
            return prepareAvailableDocuments();

          case 2:
            res = _context59.sent;
            available_documents = res.available_documents;
            abs_index = res.abs_index;
            DOCS = res.DOCS;

          case 6:
          case "end":
            return _context59.stop();
        }
      }
    }, _callee59, this);
  }));
  return _refreshDocuments.apply(this, arguments);
}

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee60() {
    return _regenerator.default.wrap(function _callee60$(_context60) {
      while (1) {
        switch (_context60.prev = _context60.next) {
          case 0:
            _context60.next = 2;
            return refreshDocuments();

          case 2:
          case "end":
            return _context60.stop();
        }
      }
    }, _callee60, this);
  }));
  return _main.apply(this, arguments);
}

main();
app.get('/api/deleteTable',
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(req, res) {
    var filename, delprom;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(req.query && req.query.docid && req.query.page)) {
              _context.next = 10;
              break;
            }

            filename = req.query.docid + "_" + req.query.page + ".html";
            delprom = new Promise(function (resolve, reject) {
              fs.rename(tables_folder + '/' + filename, tables_folder_deleted + '/' + filename, function (err) {
                if (err) {
                  reject("failed");
                }

                ;
                console.log('Move complete : ' + filename);
                resolve("done");
              });
            });
            _context.next = 5;
            return delprom;

          case 5:
            _context.next = 7;
            return refreshDocuments();

          case 7:
            res.send("table deleted");
            _context.next = 11;
            break;

          case 10:
            res.send("table not deleted");

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x18, _x19) {
    return _ref.apply(this, arguments);
  };
}());
app.get('/api/recoverTable',
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2(req, res) {
    var filename;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (req.query && req.query.docid && req.query.page) {
              filename = req.query.docid + "_" + req.query.page + ".html";
              fs.rename(tables_folder_deleted + '/' + filename, tables_folder + '/' + filename, function (err) {
                if (err) throw err;
                console.log('Move complete : ' + filename);
              });
            }

            res.send("table recovered");

          case 2:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x20, _x21) {
    return _ref2.apply(this, arguments);
  };
}());
app.get('/api/listDeletedTables',
/*#__PURE__*/
function () {
  var _ref3 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3(req, res) {
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            fs.readdir(tables_folder_deleted, function (err, items) {
              if (err) {
                res.send("failed listing " + err);
              } else {
                res.send(items);
              }
            });

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function (_x22, _x23) {
    return _ref3.apply(this, arguments);
  };
}());
app.get('/api/modifyCUIData',
/*#__PURE__*/
function () {
  var _ref4 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee5(req, res) {
    var modifyCUIData, result;
    return _regenerator.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            modifyCUIData =
            /*#__PURE__*/
            function () {
              var _ref5 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee4(cui, preferred, adminApproved, prevcui) {
                var client, result, q;
                return _regenerator.default.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        _context4.next = 2;
                        return pool.connect();

                      case 2:
                        client = _context4.sent;
                        _context4.next = 5;
                        return client.query("UPDATE cuis_index SET cui=$1, preferred=$2, admin_approved=$3 WHERE cui = $4", [cui, preferred, adminApproved, prevcui]);

                      case 5:
                        result = _context4.sent;

                        if (!(result && result.rowCount)) {
                          _context4.next = 11;
                          break;
                        }

                        q = new Query("UPDATE metadata SET cuis = array_to_string(array_replace(regexp_split_to_array(cuis, ';'), $2, $1), ';'), cuis_selected = array_to_string(array_replace(regexp_split_to_array(cuis_selected, ';'), $2, $1), ';')", [cui, prevcui]);
                        _context4.next = 10;
                        return client.query(q);

                      case 10:
                        result = _context4.sent;

                      case 11:
                        client.release();
                        return _context4.abrupt("return", result);

                      case 13:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4, this);
              }));

              return function modifyCUIData(_x26, _x27, _x28, _x29) {
                return _ref5.apply(this, arguments);
              };
            }();

            if (!(req.query && req.query.cui && req.query.preferred && req.query.adminApproved && req.query.prevcui)) {
              _context5.next = 8;
              break;
            }

            _context5.next = 4;
            return modifyCUIData(req.query.cui, req.query.preferred, req.query.adminApproved, req.query.prevcui);

          case 4:
            result = _context5.sent;
            res.send(result);
            _context5.next = 9;
            break;

          case 8:
            res.send("UPDATE failed");

          case 9:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function (_x24, _x25) {
    return _ref4.apply(this, arguments);
  };
}());
app.get('/api/cuiDeleteIndex',
/*#__PURE__*/
function () {
  var _ref6 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee7(req, res) {
    var cuiDeleteIndex;
    return _regenerator.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            cuiDeleteIndex =
            /*#__PURE__*/
            function () {
              var _ref7 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee6(cui) {
                var client, done;
                return _regenerator.default.wrap(function _callee6$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        _context6.next = 2;
                        return pool.connect();

                      case 2:
                        client = _context6.sent;
                        _context6.next = 5;
                        return client.query('delete from cuis_index where cui = $1', [cui]).then(function (result) {
                          return console.log("deleted: " + new Date());
                        }).catch(function (e) {
                          return console.error(e.stack);
                        }).then(function () {
                          return client.release();
                        });

                      case 5:
                        done = _context6.sent;

                      case 6:
                      case "end":
                        return _context6.stop();
                    }
                  }
                }, _callee6, this);
              }));

              return function cuiDeleteIndex(_x32) {
                return _ref7.apply(this, arguments);
              };
            }();

            if (!(req.query && req.query.cui)) {
              _context7.next = 7;
              break;
            }

            _context7.next = 4;
            return cuiDeleteIndex(req.query.cui);

          case 4:
            res.send("done");
            _context7.next = 8;
            break;

          case 7:
            res.send("clear failed");

          case 8:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));

  return function (_x30, _x31) {
    return _ref6.apply(this, arguments);
  };
}());
app.get('/api/getMetadataForCUI',
/*#__PURE__*/
function () {
  var _ref8 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee9(req, res) {
    var getCuiTables, meta;
    return _regenerator.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            getCuiTables =
            /*#__PURE__*/
            function () {
              var _ref9 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee8(cui) {
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
                        return client.query("select docid,page,\"user\" from metadata where cuis like $1 ", ["%" + cui + "%"]);

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

              return function getCuiTables(_x35) {
                return _ref9.apply(this, arguments);
              };
            }(); //console.log(req.query)


            if (!(req.query && req.query.cui)) {
              _context9.next = 8;
              break;
            }

            _context9.next = 4;
            return getCuiTables(req.query.cui);

          case 4:
            meta = _context9.sent;
            //console.log(meta)
            res.send(meta);
            _context9.next = 9;
            break;

          case 8:
            res.send("clear failed");

          case 9:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));

  return function (_x33, _x34) {
    return _ref8.apply(this, arguments);
  };
}());
app.get('/api/clearMetadata',
/*#__PURE__*/
function () {
  var _ref10 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee11(req, res) {
    var setMetadata;
    return _regenerator.default.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            setMetadata =
            /*#__PURE__*/
            function () {
              var _ref11 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee10(docid, page, user) {
                var client, done;
                return _regenerator.default.wrap(function _callee10$(_context10) {
                  while (1) {
                    switch (_context10.prev = _context10.next) {
                      case 0:
                        _context10.next = 2;
                        return pool.connect();

                      case 2:
                        client = _context10.sent;
                        _context10.next = 5;
                        return client.query('DELETE FROM metadata WHERE docid = $1 AND page = $2 AND "user" = $3', [docid, page, user]).then(function (result) {
                          return console.log("deleted: " + new Date());
                        }).catch(function (e) {
                          return console.error(e.stack);
                        }).then(function () {
                          return client.release();
                        });

                      case 5:
                        done = _context10.sent;

                      case 6:
                      case "end":
                        return _context10.stop();
                    }
                  }
                }, _callee10, this);
              }));

              return function setMetadata(_x38, _x39, _x40) {
                return _ref11.apply(this, arguments);
              };
            }();

            if (!(req.query && req.query.docid && req.query.page && req.query.user)) {
              _context11.next = 7;
              break;
            }

            _context11.next = 4;
            return setMetadata(req.query.docid, req.query.page, req.query.user);

          case 4:
            res.send("done");
            _context11.next = 8;
            break;

          case 7:
            res.send("clear failed");

          case 8:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, this);
  }));

  return function (_x36, _x37) {
    return _ref10.apply(this, arguments);
  };
}());
app.get('/api/setMetadata',
/*#__PURE__*/
function () {
  var _ref12 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee13(req, res) {
    var setMetadata;
    return _regenerator.default.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            setMetadata =
            /*#__PURE__*/
            function () {
              var _ref13 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee12(docid, page, concept, cuis, qualifiers, cuis_selected, qualifiers_selected, user, istitle, labeller) {
                var client, done;
                return _regenerator.default.wrap(function _callee12$(_context12) {
                  while (1) {
                    switch (_context12.prev = _context12.next) {
                      case 0:
                        _context12.next = 2;
                        return pool.connect();

                      case 2:
                        client = _context12.sent;
                        _context12.next = 5;
                        return client.query('INSERT INTO metadata(docid, page, concept, cuis, qualifiers, "user", cuis_selected, qualifiers_selected, istitle, labeller ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (docid, page, concept, "user") DO UPDATE SET cuis = $4, qualifiers = $5, cuis_selected = $7, qualifiers_selected = $8, istitle = $9, labeller = $10', [docid, page, concept, cuis, qualifiers, user, cuis_selected, qualifiers_selected, istitle, labeller]).then(function (result) {
                          return console.log("insert: " + new Date());
                        }).catch(function (e) {
                          return console.error(e.stack);
                        }).then(function () {
                          return client.release();
                        });

                      case 5:
                        done = _context12.sent;

                      case 6:
                      case "end":
                        return _context12.stop();
                    }
                  }
                }, _callee12, this);
              }));

              return function setMetadata(_x43, _x44, _x45, _x46, _x47, _x48, _x49, _x50, _x51, _x52) {
                return _ref13.apply(this, arguments);
              };
            }();

            if (!(req.query && req.query.docid && req.query.page && req.query.concept && req.query.user)) {
              _context13.next = 7;
              break;
            }

            _context13.next = 4;
            return setMetadata(req.query.docid, req.query.page, req.query.concept, req.query.cuis || "", req.query.qualifiers || "", req.query.cuis_selected || "", req.query.qualifiers_selected || "", req.query.user, req.query.istitle, req.query.labeller);

          case 4:
            res.send("done");
            _context13.next = 8;
            break;

          case 7:
            res.send("insert failed");

          case 8:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, this);
  }));

  return function (_x41, _x42) {
    return _ref12.apply(this, arguments);
  };
}());
app.get('/api/getMetadata',
/*#__PURE__*/
function () {
  var _ref14 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee15(req, res) {
    var getMetadata;
    return _regenerator.default.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            getMetadata =
            /*#__PURE__*/
            function () {
              var _ref15 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee14(docid, page, user) {
                var client, result;
                return _regenerator.default.wrap(function _callee14$(_context14) {
                  while (1) {
                    switch (_context14.prev = _context14.next) {
                      case 0:
                        _context14.next = 2;
                        return pool.connect();

                      case 2:
                        client = _context14.sent;
                        _context14.next = 5;
                        return client.query("SELECT docid, page, concept, cuis, cuis_selected, qualifiers, qualifiers_selected, \"user\",istitle, labeller FROM metadata WHERE docid = $1 AND page = $2 AND \"user\" = $3", [docid, page, user]);

                      case 5:
                        result = _context14.sent;
                        client.release();
                        return _context14.abrupt("return", result);

                      case 8:
                      case "end":
                        return _context14.stop();
                    }
                  }
                }, _callee14, this);
              }));

              return function getMetadata(_x55, _x56, _x57) {
                return _ref15.apply(this, arguments);
              };
            }();

            if (!(req.query && req.query.docid && req.query.page && req.query.user)) {
              _context15.next = 9;
              break;
            }

            _context15.t0 = res;
            _context15.next = 5;
            return getMetadata(req.query.docid, req.query.page, req.query.user);

          case 5:
            _context15.t1 = _context15.sent;

            _context15.t0.send.call(_context15.t0, _context15.t1);

            _context15.next = 10;
            break;

          case 9:
            res.send({
              error: "getMetadata_badquery"
            });

          case 10:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15, this);
  }));

  return function (_x53, _x54) {
    return _ref14.apply(this, arguments);
  };
}());
app.get('/', function (req, res) {
  res.send("this is home");
});
app.get('/api/allInfo',
/*#__PURE__*/
function () {
  var _ref16 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee16(req, res) {
    var labellers, result, available_documents_temp, abs_index_temp, DOCS_temp;
    return _regenerator.default.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            _context16.next = 2;
            return getMetadataLabellers();

          case 2:
            labellers = _context16.sent;
            labellers = labellers.rows.reduce(function (acc, item) {
              acc[item.docid + "_" + item.page] = item.labeller;
              return acc;
            }, {});

            if (!(req.query && (req.query.filter_topic || req.query.filter_type || req.query.hua || req.query.filter_group))) {
              _context16.next = 14;
              break;
            }

            _context16.next = 7;
            return prepareAvailableDocuments(req.query.filter_topic ? req.query.filter_topic.split("_") : [], req.query.filter_type ? req.query.filter_type.split("_") : [], req.query.hua ? req.query.hua == "true" : false, req.query.filter_group ? req.query.filter_group.split("_") : []);

          case 7:
            result = _context16.sent;
            available_documents_temp = result.available_documents;
            abs_index_temp = result.abs_index;
            DOCS_temp = result.DOCS;
            res.send({
              abs_index: abs_index_temp,
              total: DOCS_temp.length,
              available_documents: available_documents_temp,
              msh_categories: msh_categories,
              labellers: labellers
            });
            _context16.next = 15;
            break;

          case 14:
            res.send({
              abs_index: abs_index,
              total: DOCS.length,
              available_documents: available_documents,
              msh_categories: msh_categories,
              labellers: labellers
            });

          case 15:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16, this);
  }));

  return function (_x58, _x59) {
    return _ref16.apply(this, arguments);
  };
}());

function updateClusterAnnotation(_x60, _x61, _x62, _x63, _x64) {
  return _updateClusterAnnotation.apply(this, arguments);
}

function _updateClusterAnnotation() {
  _updateClusterAnnotation = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee61(cn, concept, cuis, isdefault, cn_override) {
    var client, done;
    return _regenerator.default.wrap(function _callee61$(_context61) {
      while (1) {
        switch (_context61.prev = _context61.next) {
          case 0:
            _context61.next = 2;
            return pool.connect();

          case 2:
            client = _context61.sent;
            _context61.next = 5;
            return client.query('INSERT INTO clusters VALUES($1,$2,$3,$4,$5) ON CONFLICT (concept) DO UPDATE SET isdefault = $4, cn_override = $5;', [cn, concept, cuis, isdefault.toLowerCase() == 'true', cn_override]).then(function (result) {
              return console.log("insert: " + result);
            }).catch(function (e) {
              return console.error(e.stack);
            }).then(function () {
              return client.release();
            });

          case 5:
            done = _context61.sent;

          case 6:
          case "end":
            return _context61.stop();
        }
      }
    }, _callee61, this);
  }));
  return _updateClusterAnnotation.apply(this, arguments);
}

function getRecommendedCUIS() {
  return _getRecommendedCUIS.apply(this, arguments);
}

function _getRecommendedCUIS() {
  _getRecommendedCUIS = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee63() {
    var cuiRecommend, recommend_cuis, rec_cuis, splitConcepts;
    return _regenerator.default.wrap(function _callee63$(_context63) {
      while (1) {
        switch (_context63.prev = _context63.next) {
          case 0:
            cuiRecommend =
            /*#__PURE__*/
            function () {
              var _ref50 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee62() {
                var client, result;
                return _regenerator.default.wrap(function _callee62$(_context62) {
                  while (1) {
                    switch (_context62.prev = _context62.next) {
                      case 0:
                        _context62.next = 2;
                        return pool.connect();

                      case 2:
                        client = _context62.sent;
                        _context62.next = 5;
                        return client.query("select * from cuis_recommend");

                      case 5:
                        result = _context62.sent;
                        client.release();
                        return _context62.abrupt("return", result);

                      case 8:
                      case "end":
                        return _context62.stop();
                    }
                  }
                }, _callee62, this);
              }));

              return function cuiRecommend() {
                return _ref50.apply(this, arguments);
              };
            }();

            recommend_cuis = {};
            _context63.next = 4;
            return cuiRecommend();

          case 4:
            rec_cuis = _context63.sent.rows;

            splitConcepts = function splitConcepts(c) {
              if (c == null) {
                return [];
              }

              var ret = c[0] == ";" ? c.slice(1) : c; // remove trailing ;

              return ret.length > 0 ? ret.split(";") : [];
            };

            rec_cuis ? rec_cuis.map(function (item) {
              var cuis = splitConcepts(item.cuis);
              var rep_cuis = splitConcepts(item.rep_cuis);
              var excluded_cuis = splitConcepts(item.excluded_cuis);
              var rec_cuis = [];
              cuis.forEach(function (cui) {
                if (excluded_cuis.indexOf(cui) < 0) {
                  if (rep_cuis.indexOf(cui) < 0) {
                    rec_cuis.push(cui);
                  }
                }
              });
              recommend_cuis[item.concept] = {
                cuis: rep_cuis.concat(rec_cuis),
                cc: item.cc
              };
            }) : "";
            return _context63.abrupt("return", recommend_cuis);

          case 8:
          case "end":
            return _context63.stop();
        }
      }
    }, _callee63, this);
  }));
  return _getRecommendedCUIS.apply(this, arguments);
}

app.get('/api/cuiRecommend',
/*#__PURE__*/
function () {
  var _ref17 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee17(req, res) {
    var cuirec;
    return _regenerator.default.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            _context17.next = 2;
            return getRecommendedCUIS();

          case 2:
            cuirec = _context17.sent;
            res.send(cuirec);

          case 4:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17, this);
  }));

  return function (_x65, _x66) {
    return _ref17.apply(this, arguments);
  };
}());
app.get('/api/allClusterAnnotations',
/*#__PURE__*/
function () {
  var _ref18 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee19(req, res) {
    var allClusterAnnotations;
    return _regenerator.default.wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            allClusterAnnotations =
            /*#__PURE__*/
            function () {
              var _ref19 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee18() {
                var client, result;
                return _regenerator.default.wrap(function _callee18$(_context18) {
                  while (1) {
                    switch (_context18.prev = _context18.next) {
                      case 0:
                        _context18.next = 2;
                        return pool.connect();

                      case 2:
                        client = _context18.sent;
                        _context18.next = 5;
                        return client.query("select COALESCE(clusters.cn_override, clusters.cn) as cn,concept,rep_cuis,excluded_cuis,status,proposed_name from clusters,clusterdata where clusters.cn = clusterdata.cn ORDER BY cn asc,concept asc");

                      case 5:
                        result = _context18.sent;
                        client.release();
                        return _context18.abrupt("return", result);

                      case 8:
                      case "end":
                        return _context18.stop();
                    }
                  }
                }, _callee18, this);
              }));

              return function allClusterAnnotations() {
                return _ref19.apply(this, arguments);
              };
            }();

            _context19.t0 = res;
            _context19.next = 4;
            return allClusterAnnotations();

          case 4:
            _context19.t1 = _context19.sent;

            _context19.t0.send.call(_context19.t0, _context19.t1);

          case 6:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee19, this);
  }));

  return function (_x67, _x68) {
    return _ref18.apply(this, arguments);
  };
}());
app.get('/api/allMetadata',
/*#__PURE__*/
function () {
  var _ref20 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee21(req, res) {
    var allMetadataAnnotations;
    return _regenerator.default.wrap(function _callee21$(_context21) {
      while (1) {
        switch (_context21.prev = _context21.next) {
          case 0:
            allMetadataAnnotations =
            /*#__PURE__*/
            function () {
              var _ref21 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee20() {
                var client, result;
                return _regenerator.default.wrap(function _callee20$(_context20) {
                  while (1) {
                    switch (_context20.prev = _context20.next) {
                      case 0:
                        _context20.next = 2;
                        return pool.connect();

                      case 2:
                        client = _context20.sent;
                        _context20.next = 5;
                        return client.query("select * from metadata");

                      case 5:
                        result = _context20.sent;
                        client.release();
                        return _context20.abrupt("return", result);

                      case 8:
                      case "end":
                        return _context20.stop();
                    }
                  }
                }, _callee20, this);
              }));

              return function allMetadataAnnotations() {
                return _ref21.apply(this, arguments);
              };
            }();

            _context21.t0 = res;
            _context21.next = 4;
            return allMetadataAnnotations();

          case 4:
            _context21.t1 = _context21.sent;

            _context21.t0.send.call(_context21.t0, _context21.t1);

          case 6:
          case "end":
            return _context21.stop();
        }
      }
    }, _callee21, this);
  }));

  return function (_x69, _x70) {
    return _ref20.apply(this, arguments);
  };
}());
app.get('/api/allClusters',
/*#__PURE__*/
function () {
  var _ref22 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee23(req, res) {
    var getAllClusters;
    return _regenerator.default.wrap(function _callee23$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            getAllClusters =
            /*#__PURE__*/
            function () {
              var _ref23 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee22() {
                var client, result;
                return _regenerator.default.wrap(function _callee22$(_context22) {
                  while (1) {
                    switch (_context22.prev = _context22.next) {
                      case 0:
                        _context22.next = 2;
                        return pool.connect();

                      case 2:
                        client = _context22.sent;
                        _context22.next = 5;
                        return client.query("select COALESCE(cn_override , cn) as cn,  concept, cuis, isdefault, cn_override from clusters order by cn asc, concept asc");

                      case 5:
                        result = _context22.sent;
                        client.release();
                        return _context22.abrupt("return", result);

                      case 8:
                      case "end":
                        return _context22.stop();
                    }
                  }
                }, _callee22, this);
              }));

              return function getAllClusters() {
                return _ref23.apply(this, arguments);
              };
            }();

            _context23.t0 = res;
            _context23.next = 4;
            return getAllClusters();

          case 4:
            _context23.t1 = _context23.sent;

            _context23.t0.send.call(_context23.t0, _context23.t1);

          case 6:
          case "end":
            return _context23.stop();
        }
      }
    }, _callee23, this);
  }));

  return function (_x71, _x72) {
    return _ref22.apply(this, arguments);
  };
}());
app.get('/api/getCUIMods',
/*#__PURE__*/
function () {
  var _ref24 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee25(req, res) {
    var getCUIMods;
    return _regenerator.default.wrap(function _callee25$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            getCUIMods =
            /*#__PURE__*/
            function () {
              var _ref25 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee24() {
                var client, result;
                return _regenerator.default.wrap(function _callee24$(_context24) {
                  while (1) {
                    switch (_context24.prev = _context24.next) {
                      case 0:
                        _context24.next = 2;
                        return pool.connect();

                      case 2:
                        client = _context24.sent;
                        _context24.next = 5;
                        return client.query("select * from modifiers");

                      case 5:
                        result = _context24.sent;
                        client.release();
                        return _context24.abrupt("return", result);

                      case 8:
                      case "end":
                        return _context24.stop();
                    }
                  }
                }, _callee24, this);
              }));

              return function getCUIMods() {
                return _ref25.apply(this, arguments);
              };
            }();

            _context25.t0 = res;
            _context25.next = 4;
            return getCUIMods();

          case 4:
            _context25.t1 = _context25.sent;

            _context25.t0.send.call(_context25.t0, _context25.t1);

          case 6:
          case "end":
            return _context25.stop();
        }
      }
    }, _callee25, this);
  }));

  return function (_x73, _x74) {
    return _ref24.apply(this, arguments);
  };
}());
app.get('/api/setCUIMod',
/*#__PURE__*/
function () {
  var _ref26 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee27(req, res) {
    var setCUIMod;
    return _regenerator.default.wrap(function _callee27$(_context27) {
      while (1) {
        switch (_context27.prev = _context27.next) {
          case 0:
            setCUIMod =
            /*#__PURE__*/
            function () {
              var _ref27 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee26(cui, type) {
                var client, done;
                return _regenerator.default.wrap(function _callee26$(_context26) {
                  while (1) {
                    switch (_context26.prev = _context26.next) {
                      case 0:
                        _context26.next = 2;
                        return pool.connect();

                      case 2:
                        client = _context26.sent;
                        _context26.next = 5;
                        return client.query('INSERT INTO modifiers VALUES($1,$2) ON CONFLICT (cui) DO UPDATE SET type = $2;', [cui, type]).then(function (result) {
                          return console.log("insert: " + new Date());
                        }).catch(function (e) {
                          return console.error(e.stack);
                        }).then(function () {
                          return client.release();
                        });

                      case 5:
                        done = _context26.sent;

                      case 6:
                      case "end":
                        return _context26.stop();
                    }
                  }
                }, _callee26, this);
              }));

              return function setCUIMod(_x77, _x78) {
                return _ref27.apply(this, arguments);
              };
            }();

            if (!(req.query && req.query.cui && req.query.type)) {
              _context27.next = 4;
              break;
            }

            _context27.next = 4;
            return setCUIMod(req.query.cui, req.query.type);

          case 4:
          case "end":
            return _context27.stop();
        }
      }
    }, _callee27, this);
  }));

  return function (_x75, _x76) {
    return _ref26.apply(this, arguments);
  };
}());
app.get('/api/getClusterData',
/*#__PURE__*/
function () {
  var _ref28 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee29(req, res) {
    var getClusterData;
    return _regenerator.default.wrap(function _callee29$(_context29) {
      while (1) {
        switch (_context29.prev = _context29.next) {
          case 0:
            getClusterData =
            /*#__PURE__*/
            function () {
              var _ref29 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee28() {
                var client, result;
                return _regenerator.default.wrap(function _callee28$(_context28) {
                  while (1) {
                    switch (_context28.prev = _context28.next) {
                      case 0:
                        _context28.next = 2;
                        return pool.connect();

                      case 2:
                        client = _context28.sent;
                        _context28.next = 5;
                        return client.query("select * from clusterdata");

                      case 5:
                        result = _context28.sent;
                        client.release();
                        return _context28.abrupt("return", result);

                      case 8:
                      case "end":
                        return _context28.stop();
                    }
                  }
                }, _callee28, this);
              }));

              return function getClusterData() {
                return _ref29.apply(this, arguments);
              };
            }();

            _context29.t0 = res;
            _context29.next = 4;
            return getClusterData();

          case 4:
            _context29.t1 = _context29.sent;

            _context29.t0.send.call(_context29.t0, _context29.t1);

          case 6:
          case "end":
            return _context29.stop();
        }
      }
    }, _callee29, this);
  }));

  return function (_x79, _x80) {
    return _ref28.apply(this, arguments);
  };
}());
app.get('/api/setClusterData',
/*#__PURE__*/
function () {
  var _ref30 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee31(req, res) {
    var setClusterData;
    return _regenerator.default.wrap(function _callee31$(_context31) {
      while (1) {
        switch (_context31.prev = _context31.next) {
          case 0:
            console.log("Processing Request: " + JSON.stringify(req.query));

            setClusterData =
            /*#__PURE__*/
            function () {
              var _ref31 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee30(cn, rep_cuis, excluded_cuis, status, proposed_name) {
                var p_name, client, done;
                return _regenerator.default.wrap(function _callee30$(_context30) {
                  while (1) {
                    switch (_context30.prev = _context30.next) {
                      case 0:
                        p_name = proposed_name && proposed_name.length > 0 && proposed_name !== "null" ? proposed_name : "";
                        _context30.next = 3;
                        return pool.connect();

                      case 3:
                        client = _context30.sent;
                        _context30.next = 6;
                        return client.query('INSERT INTO clusterdata VALUES($1,$2,$3,$4) ON CONFLICT (cn) DO UPDATE SET rep_cuis = $2, excluded_cuis = $3, status = $4, proposed_name = $5 ;', [cn, rep_cuis, excluded_cuis, status, p_name]).then(function (result) {
                          return console.log("insert: " + JSON.stringify(result));
                        }).catch(function (e) {
                          return console.error(e.stack);
                        }).then(function () {
                          return client.release();
                        });

                      case 6:
                        done = _context30.sent;

                      case 7:
                      case "end":
                        return _context30.stop();
                    }
                  }
                }, _callee30, this);
              }));

              return function setClusterData(_x83, _x84, _x85, _x86, _x87) {
                return _ref31.apply(this, arguments);
              };
            }();

            if (!(req.query && req.query.cn && req.query.status)) {
              _context31.next = 5;
              break;
            }

            _context31.next = 5;
            return setClusterData(req.query.cn, req.query.rep_cuis || "", req.query.excluded_cuis || "", req.query.status, req.query.proposed_name);

          case 5:
            res.send("updated");

          case 6:
          case "end":
            return _context31.stop();
        }
      }
    }, _callee31, this);
  }));

  return function (_x81, _x82) {
    return _ref30.apply(this, arguments);
  };
}());
app.get('/api/recordClusterAnnotation',
/*#__PURE__*/
function () {
  var _ref32 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee32(req, res) {
    return _regenerator.default.wrap(function _callee32$(_context32) {
      while (1) {
        switch (_context32.prev = _context32.next) {
          case 0:
            console.log(JSON.stringify(req.query));

            if (!(req.query && req.query.cn.length > 0 && req.query.concept.length > 0 && req.query.cuis.length > 0 && req.query.isdefault.length > 0 && req.query.cn_override.length > 0)) {
              _context32.next = 4;
              break;
            }

            _context32.next = 4;
            return updateClusterAnnotation(req.query.cn, req.query.concept, req.query.cuis, req.query.isdefault, req.query.cn_override);

          case 4:
            res.send("saved cluster annotation: " + JSON.stringify(req.query));

          case 5:
          case "end":
            return _context32.stop();
        }
      }
    }, _callee32, this);
  }));

  return function (_x88, _x89) {
    return _ref32.apply(this, arguments);
  };
}());
app.get('/api/cuisIndex',
/*#__PURE__*/
function () {
  var _ref33 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee34(req, res) {
    var getCUISIndex;
    return _regenerator.default.wrap(function _callee34$(_context34) {
      while (1) {
        switch (_context34.prev = _context34.next) {
          case 0:
            getCUISIndex =
            /*#__PURE__*/
            function () {
              var _ref34 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee33() {
                var cuis, client, result;
                return _regenerator.default.wrap(function _callee33$(_context33) {
                  while (1) {
                    switch (_context33.prev = _context33.next) {
                      case 0:
                        cuis = {};
                        _context33.next = 3;
                        return pool.connect();

                      case 3:
                        client = _context33.sent;
                        _context33.next = 6;
                        return client.query("select * from cuis_index");

                      case 6:
                        result = _context33.sent;
                        client.release();
                        result.rows.map(function (row) {
                          cuis[row.cui] = {
                            preferred: row.preferred,
                            hasMSH: row.hasMSH,
                            userDefined: row.user_defined,
                            adminApproved: row.admin_approved
                          };
                        });
                        return _context33.abrupt("return", cuis);

                      case 10:
                      case "end":
                        return _context33.stop();
                    }
                  }
                }, _callee33, this);
              }));

              return function getCUISIndex() {
                return _ref34.apply(this, arguments);
              };
            }();

            _context34.t0 = res;
            _context34.next = 4;
            return getCUISIndex();

          case 4:
            _context34.t1 = _context34.sent;

            _context34.t0.send.call(_context34.t0, _context34.t1);

          case 6:
          case "end":
            return _context34.stop();
        }
      }
    }, _callee34, this);
  }));

  return function (_x90, _x91) {
    return _ref33.apply(this, arguments);
  };
}());
app.get('/api/cuisIndexAdd',
/*#__PURE__*/
function () {
  var _ref35 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee36(req, res) {
    var insertCUI;
    return _regenerator.default.wrap(function _callee36$(_context36) {
      while (1) {
        switch (_context36.prev = _context36.next) {
          case 0:
            console.log(JSON.stringify(req.query));

            insertCUI =
            /*#__PURE__*/
            function () {
              var _ref36 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee35(cui, preferred, hasMSH) {
                var client, done;
                return _regenerator.default.wrap(function _callee35$(_context35) {
                  while (1) {
                    switch (_context35.prev = _context35.next) {
                      case 0:
                        _context35.next = 2;
                        return pool.connect();

                      case 2:
                        client = _context35.sent;
                        _context35.next = 5;
                        return client.query('INSERT INTO cuis_index(cui,preferred,"hasMSH",user_defined,admin_approved) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (cui) DO UPDATE SET preferred = $2, "hasMSH" = $3, user_defined = $4, admin_approved = $5', [cui, preferred, hasMSH, true, false]).then(function (result) {
                          return console.log("insert: " + new Date());
                        }).catch(function (e) {
                          return console.error(e.stack);
                        }).then(function () {
                          return client.release();
                        });

                      case 5:
                        done = _context35.sent;

                      case 6:
                      case "end":
                        return _context35.stop();
                    }
                  }
                }, _callee35, this);
              }));

              return function insertCUI(_x94, _x95, _x96) {
                return _ref36.apply(this, arguments);
              };
            }();

            if (!(req.query && req.query.cui.length > 0 && req.query.preferred.length > 0 && req.query.hasMSH.length > 0)) {
              _context36.next = 5;
              break;
            }

            _context36.next = 5;
            return insertCUI(req.query.cui, req.query.preferred, req.query.hasMSH);

          case 5:
            res.send("saved annotation: " + JSON.stringify(req.query));

          case 6:
          case "end":
            return _context36.stop();
        }
      }
    }, _callee36, this);
  }));

  return function (_x92, _x93) {
    return _ref35.apply(this, arguments);
  };
}());

function allPredictions() {
  return _allPredictions.apply(this, arguments);
}

function _allPredictions() {
  _allPredictions = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee64() {
    var cui_data, header, createCsvWriter, csvWriter, count, docid, page, data, ac_res, cols, rows, annotation_cols, annotation_rows, cuirec, cleanTerm, getSemanticTypes, csvData;
    return _regenerator.default.wrap(function _callee64$(_context64) {
      while (1) {
        switch (_context64.prev = _context64.next) {
          case 0:
            _context64.next = 2;
            return CUIData();

          case 2:
            cui_data = _context64.sent;
            header = [{
              id: 'docid',
              title: 'docid'
            }, {
              id: 'page',
              title: 'page'
            }, {
              id: 'concept',
              title: 'concept'
            }, {
              id: 'clean_concept',
              title: 'clean_concept'
            }, {
              id: 'original',
              title: 'original'
            }, {
              id: 'onlyNumbers',
              title: 'onlyNumbers'
            }, {
              id: 'pos_start',
              title: 'pos_start'
            }, {
              id: 'pos_middle',
              title: 'pos_middle'
            }, {
              id: 'pos_end',
              title: 'pos_end'
            }, {
              id: 'inRow',
              title: 'inRow'
            }, {
              id: 'inCol',
              title: 'inCol'
            }, {
              id: 'is_bold',
              title: 'is_bold'
            }, {
              id: 'is_italic',
              title: 'is_italic'
            }, {
              id: 'is_indent',
              title: 'is_indent'
            }, {
              id: 'is_empty_row',
              title: 'is_empty_row'
            }, {
              id: 'is_empty_row_p',
              title: 'is_empty_row_p'
            }, {
              id: 'cuis',
              title: 'cuis'
            }, {
              id: 'semanticTypes',
              title: 'semanticTypes'
            }, {
              id: 'label',
              title: 'label'
            }];
            Object.keys(cui_data.cui_def).map(function (c) {
              header.push({
                id: c,
                title: c
              });
            });
            Object.keys(cui_data.semtypes).map(function (s) {
              header.push({
                id: s,
                title: s
              });
            });
            createCsvWriter = require('csv-writer').createObjectCsvWriter;
            csvWriter = createCsvWriter({
              path: 'prediction_data.csv',
              header: header
            }); //
            // debugger
            // const records = [
            //     {name: 'Bob',  lang: 'French, English'},
            //     {name: 'Mary', lang: 'English'}
            // ];

            count = 1;
            _context64.t0 = _regenerator.default.keys(available_documents);

          case 10:
            if ((_context64.t1 = _context64.t0()).done) {
              _context64.next = 50;
              break;
            }

            docid = _context64.t1.value;
            _context64.t2 = _regenerator.default.keys(available_documents[docid].pages);

          case 13:
            if ((_context64.t3 = _context64.t2()).done) {
              _context64.next = 48;
              break;
            }

            page = _context64.t3.value;
            console.log(docid + "  --  " + page + "  --  " + count + " / " + DOCS.length);
            page = available_documents[docid].pages[page];
            _context64.next = 19;
            return readyTableData(docid, page);

          case 19:
            data = _context64.sent;
            ac_res = cui_data.actual_results;

            if (ac_res[docid + "_" + page]) {
              _context64.next = 23;
              break;
            }

            return _context64.abrupt("continue", 13);

          case 23:
            // if (! (docid == "16351668" && page == 2) ){
            //    continue
            // }
            //
            // debugger
            // These are predicted, using the SGDClassifier
            cols = data.predicted.cols.reduce(function (acc, e) {
              acc[e.c] = {
                descriptors: e.descriptors.join(";"),
                modifier: e.unique_modifier
              };
              return acc;
            }, {});
            rows = data.predicted.rows.reduce(function (acc, e) {
              acc[e.c] = {
                descriptors: e.descriptors.join(";"),
                modifier: e.unique_modifier
              };
              return acc;
            }, {});
            _context64.prev = 25;
            // These are manually annotated
            annotation_cols = Object.keys(ac_res[docid + "_" + page].Col).reduce(function (acc, e) {
              acc[e - 1] = ac_res[docid + "_" + page].Col[e];
              return acc;
            }, {});
            annotation_rows = Object.keys(ac_res[docid + "_" + page].Row).reduce(function (acc, e) {
              acc[e - 1] = ac_res[docid + "_" + page].Row[e];
              return acc;
            }, {});
            _context64.next = 34;
            break;

          case 30:
            _context64.prev = 30;
            _context64.t4 = _context64["catch"](25);
            console.log("skipping: " + docid + "_" + page);
            return _context64.abrupt("continue", 13);

          case 34:
            // Now we use the manual annotations here to build our dataset, to train the classifiers.
            cols = annotation_cols;
            rows = annotation_rows;
            _context64.next = 38;
            return getRecommendedCUIS();

          case 38:
            cuirec = _context64.sent;

            cleanTerm = function cleanTerm(term) {
              term = term.toLowerCase().replace(/[^A-z0-9 ]/gi, " ").replace(/[0-9]+/gi, " $nmbr$ ").replace(/ +/gi, " ").trim();
              return term;
            };

            getSemanticTypes = function getSemanticTypes(cuis, cui_data) {
              if (!cuis) {
                return [];
              }

              var semType = [];
              cuis.split(";").map(function (cui) {
                semType.push(cui_data.cui_def[cui].semTypes.split(";"));
              });
              return semType.flat();
            }; //


            count = count + 1; // if ( count > 10 ){
            //    return ""
            // }
            //
            // debugger

            csvData = data.predicted.predictions.map(function (row_el, row) {
              return row_el.terms.map(function (term, col) {
                var clean_concept = cleanTerm(term);
                var row_terms = data.predicted.predictions[row].terms; // debugger;

                var toReturn = {
                  docid: docid,
                  page: page,
                  concept: prepare_cell_text(term),
                  clean_concept: clean_concept,
                  original: term,
                  onlyNumbers: term.replace(/[^a-z]/g, " ").replace(/ +/g, " ").trim() == "",
                  // row: row,
                  // col: col,
                  pos_start: row == 0 ? 1 : "",
                  pos_middle: row > 0 && row < data.predicted.predictions.length - 1 ? 1 : "",
                  pos_end: row == data.predicted.predictions.length - 1 ? 1 : "",
                  // isCharacteristic_name: cols[col] && cols[col].descriptors.indexOf("characteristic_name") > -1 ? 1 : 0,
                  // isCharacteristic_level: cols[col] && cols[col].descriptors.indexOf("characteristic_level") > -1 ? 1 : 0,
                  // isOutcome: cols[col] && cols[col].descriptors.indexOf("outcomes") > -1 ? 1 : 0,
                  inRow: rows[row] ? 1 : "",
                  inCol: cols[col] ? 1 : "",
                  is_bold: data.predicted.predictions[row].cellClasses[col].indexOf("bold") > -1 ? 1 : "",
                  is_italic: data.predicted.predictions[row].cellClasses[col].indexOf("italic") > -1 ? 1 : "",
                  is_indent: data.predicted.predictions[row].cellClasses[col].indexOf("indent") > -1 ? 1 : "",
                  is_empty_row: row_terms[0] == row_terms.join("") ? 1 : "",
                  is_empty_row_p: row_terms.length > 2 && row_terms[0] + row_terms[row_terms.length - 1] == row_terms.join("") ? 1 : "",
                  // this one is a crude estimation of P values structure. Assume the row has P value if multiple columns are detected but only first and last are populated.
                  label: cols[col] ? cols[col].descriptors : rows[row] ? rows[row].descriptors : "",
                  cuis: cui_data.cui_concept[clean_concept],
                  semanticTypes: getSemanticTypes(cui_data.cui_concept[clean_concept], cui_data).join(";") // cui_def, cui_concept

                };

                if (cui_data.cui_concept[clean_concept]) {
                  cui_data.cui_concept[clean_concept].split(";").map(function (cui) {
                    toReturn[cui] = 1;
                  });
                }

                getSemanticTypes(cui_data.cui_concept[clean_concept], cui_data).map(function (semType) {
                  toReturn[semType] = 1;
                });
                return toReturn;
              });
            });
            csvData = csvData.flat().filter(function (el) {
              return el.onlyNumbers == false;
            });
            _context64.next = 46;
            return csvWriter.writeRecords(csvData) // returns a promise
            .then(function () {
              console.log('...Done');
            });

          case 46:
            _context64.next = 13;
            break;

          case 48:
            _context64.next = 10;
            break;

          case 50:
            return _context64.abrupt("return", {});

          case 51:
          case "end":
            return _context64.stop();
        }
      }
    }, _callee64, this, [[25, 30]]);
  }));
  return _allPredictions.apply(this, arguments);
}

app.get('/api/allPredictions',
/*#__PURE__*/
function () {
  var _ref37 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee37(req, res) {
    var allP;
    return _regenerator.default.wrap(function _callee37$(_context37) {
      while (1) {
        switch (_context37.prev = _context37.next) {
          case 0:
            console.log("getting all predictions");
            _context37.next = 3;
            return allPredictions();

          case 3:
            allP = _context37.sent;
            res.send(allP);

          case 5:
          case "end":
            return _context37.stop();
        }
      }
    }, _callee37, this);
  }));

  return function (_x97, _x98) {
    return _ref37.apply(this, arguments);
  };
}()); // Generates the results table live preview, connecting to the R API.

app.get('/api/annotationPreview',
/*#__PURE__*/
function () {
  var _ref38 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee38(req, res) {
    var annotations, page, user, final_annotations, r, ann, existing, final_annotations_array, entry;
    return _regenerator.default.wrap(function _callee38$(_context38) {
      while (1) {
        switch (_context38.prev = _context38.next) {
          case 0:
            _context38.prev = 0;

            if (!(req.query && req.query.docid && req.query.docid.length > 0)) {
              _context38.next = 10;
              break;
            }

            page = req.query.page && req.query.page.length > 0 ? req.query.page : 1;
            user = req.query.user && req.query.user.length > 0 ? req.query.user : "";
            console.log(user + "  -- " + JSON.stringify(req.query));
            _context38.next = 7;
            return getAnnotationByID(req.query.docid, page, user);

          case 7:
            annotations = _context38.sent;
            _context38.next = 11;
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
            }

            final_annotations_array = [];

            for (r in final_annotations) {
              ann = final_annotations[r];
              final_annotations_array[final_annotations_array.length] = ann;
            }

            if (final_annotations_array.length > 0) {
              entry = final_annotations_array[0];
              entry.annotation = entry.annotation.annotations.map(function (v, i) {
                var ann = v;
                ann.content = Object.keys(ann.content).join(";");
                ann.qualifiers = Object.keys(ann.qualifiers).join(";");
                return ann;
              });
              request({
                url: 'http://localhost:6666/preview',
                method: "POST",
                json: {
                  anns: entry
                }
              }, function (error, response, body) {
                res.send({
                  "state": "good",
                  result: body.tableResult,
                  "anns": body.ann
                });
              });
            } else {
              res.send({
                "state": "empty"
              });
            }

            _context38.next = 21;
            break;

          case 18:
            _context38.prev = 18;
            _context38.t0 = _context38["catch"](0);
            res.send({
              "state": "failed"
            });

          case 21:
          case "end":
            return _context38.stop();
        }
      }
    }, _callee38, this, [[0, 18]]);
  }));

  return function (_x99, _x100) {
    return _ref38.apply(this, arguments);
  };
}());
app.get('/api/formattedResults',
/*#__PURE__*/
function () {
  var _ref39 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee39(req, res) {
    var results, finalResults, r, ann, existing, finalResults_array, formattedRes;
    return _regenerator.default.wrap(function _callee39$(_context39) {
      while (1) {
        switch (_context39.prev = _context39.next) {
          case 0:
            _context39.next = 2;
            return getAnnotationResults();

          case 2:
            results = _context39.sent;

            if (results) {
              finalResults = {};
              /**
              * There are multiple versions of the annotations. When calling reading the results from the database, here we will return only the latest/ most complete version of the annotation.
              * Independently from the author of it. Completeness here measured as the result with the highest number of annotations and the highest index number (I.e. Newest, but only if it has more information/annotations).
              * May not be the best in some cases.
              *
              */

              for (r in results.rows) {
                ann = results.rows[r];
                existing = finalResults[ann.docid + "_" + ann.page];

                if (existing) {
                  if (ann.N > existing.N && ann.annotation.annotations.length >= existing.annotation.annotations.length) {
                    finalResults[ann.docid + "_" + ann.page] = ann;
                  }
                } else {
                  // Didn't exist so add it.
                  finalResults[ann.docid + "_" + ann.page] = ann;
                }
              }

              finalResults_array = [];

              for (r in finalResults) {
                ann = finalResults[r];
                finalResults_array[finalResults_array.length] = ann;
              }

              formattedRes = '"user","docid","page","corrupted_text","tableType","location","number","content","qualifiers"\n';
              finalResults_array.map(function (value, i) {
                value.annotation.annotations.map(function (ann, j) {
                  try {
                    formattedRes = formattedRes + '"' + value.user + '","' + value.docid + '","' + value.page // +'","'+value.corrupted
                    + '","' + (value.corrupted_text == "undefined" ? "" : value.corrupted_text).replace(/\"/g, "'") + '","' + value.tableType + '","' + ann.location + '","' + ann.number + '","' + Object.keys(ann.content).join(';') + '","' + Object.keys(ann.qualifiers).join(';') + '"' + "\n";
                  } catch (e) {
                    console.log("an empty annotation, no worries: " + JSON.stringify(ann));
                  }
                });
              });
              res.send(formattedRes);
            }

          case 4:
          case "end":
            return _context39.stop();
        }
      }
    }, _callee39, this);
  }));

  return function (_x101, _x102) {
    return _ref39.apply(this, arguments);
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

function getMMatch(_x103) {
  return _getMMatch.apply(this, arguments);
}

function _getMMatch() {
  _getMMatch = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee65(phrase) {
    var result;
    return _regenerator.default.wrap(function _callee65$(_context65) {
      while (1) {
        switch (_context65.prev = _context65.next) {
          case 0:
            console.log("LOOKING FOR: " + phrase);
            result = new Promise(function (resolve, reject) {
              request.post({
                headers: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                url: 'http://localhost:8080/form',
                body: "input=" + phrase + " &args=-AsI+ --JSONn -E"
              }, function (error, res, body) {
                if (error) {
                  reject(error);
                  return;
                }

                var start = body.indexOf('{"AllDocuments"');
                var end = body.indexOf("'EOT'.");
                resolve(body.slice(start, end));
              });
            });
            return _context65.abrupt("return", result);

          case 3:
          case "end":
            return _context65.stop();
        }
      }
    }, _callee65, this);
  }));
  return _getMMatch.apply(this, arguments);
}

app.get('/api/getMMatch',
/*#__PURE__*/
function () {
  var _ref40 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee40(req, res) {
    var mm_match;
    return _regenerator.default.wrap(function _callee40$(_context40) {
      while (1) {
        switch (_context40.prev = _context40.next) {
          case 0:
            _context40.prev = 0;

            if (!(req.query && req.query.phrase)) {
              _context40.next = 8;
              break;
            }

            _context40.next = 4;
            return getMMatch(req.query.phrase);

          case 4:
            mm_match = _context40.sent;
            res.send(mm_match);
            _context40.next = 9;
            break;

          case 8:
            res.send({
              status: "wrong parameters",
              query: req.query
            });

          case 9:
            _context40.next = 14;
            break;

          case 11:
            _context40.prev = 11;
            _context40.t0 = _context40["catch"](0);
            console.log(_context40.t0);

          case 14:
          case "end":
            return _context40.stop();
        }
      }
    }, _callee40, this, [[0, 11]]);
  }));

  return function (_x104, _x105) {
    return _ref40.apply(this, arguments);
  };
}());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(function (req, res, next) {
  next();
}); // POST method route

app.post('/saveTableOverride', function (req, res) {
  fs.writeFile("HTML_TABLES_OVERRIDE/" + req.body.docid + "_" + req.body.page + '.html', req.body.table, function (err) {
    if (err) throw err;
    console.log('Written replacement for: ' + req.body.docid + "_" + req.body.page + '.html');
  });
  res.send("alles gut!");
});
app.get('/api/removeOverrideTable',
/*#__PURE__*/
function () {
  var _ref41 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee41(req, res) {
    var file_exists;
    return _regenerator.default.wrap(function _callee41$(_context41) {
      while (1) {
        switch (_context41.prev = _context41.next) {
          case 0:
            if (!(req.query && req.query.docid && req.query.page)) {
              _context41.next = 8;
              break;
            }

            _context41.next = 3;
            return fs.existsSync("HTML_TABLES_OVERRIDE/" + req.query.docid + "_" + req.query.page + ".html");

          case 3:
            file_exists = _context41.sent;

            if (file_exists) {
              fs.unlink("HTML_TABLES_OVERRIDE/" + req.query.docid + "_" + req.query.page + ".html", function (err) {
                if (err) throw err;
                console.log("REMOVED : HTML_TABLES_OVERRIDE/" + req.query.docid + "_" + req.query.page + ".html");
              });
            }

            res.send({
              status: "override removed"
            });
            _context41.next = 9;
            break;

          case 8:
            res.send({
              status: "no changes"
            });

          case 9:
          case "end":
            return _context41.stop();
        }
      }
    }, _callee41, this);
  }));

  return function (_x106, _x107) {
    return _ref41.apply(this, arguments);
  };
}());
app.get('/api/classify',
/*#__PURE__*/
function () {
  var _ref42 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee42(req, res) {
    return _regenerator.default.wrap(function _callee42$(_context42) {
      while (1) {
        switch (_context42.prev = _context42.next) {
          case 0:
            if (!(req.query && req.query.terms)) {
              _context42.next = 8;
              break;
            }

            console.log(req.query.terms);
            _context42.t0 = res;
            _context42.next = 5;
            return classify(req.query.terms.split(","));

          case 5:
            _context42.t1 = _context42.sent;
            _context42.t2 = {
              results: _context42.t1
            };

            _context42.t0.send.call(_context42.t0, _context42.t2);

          case 8:
          case "end":
            return _context42.stop();
        }
      }
    }, _callee42, this);
  }));

  return function (_x108, _x109) {
    return _ref42.apply(this, arguments);
  };
}());

function readyTableData(_x110, _x111, _x112) {
  return _readyTableData.apply(this, arguments);
}

function _readyTableData() {
  _readyTableData = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee67(docid, page, method) {
    var htmlFolder, htmlFile, file_exists, result;
    return _regenerator.default.wrap(function _callee67$(_context67) {
      while (1) {
        switch (_context67.prev = _context67.next) {
          case 0:
            _context67.prev = 0;
            docid = docid + "_" + page + ".html";
            htmlFolder = tables_folder + "/";
            htmlFile = docid; //If an override file exists then use it!. Overrides are those produced by the editor.

            _context67.next = 6;
            return fs.existsSync("HTML_TABLES_OVERRIDE/" + docid);

          case 6:
            file_exists = _context67.sent;

            if (file_exists) {
              htmlFolder = "HTML_TABLES_OVERRIDE/";
            }

            console.log("LOADING FROM " + htmlFolder + " " + file_exists + "  " + "HTML_TABLES_OVERRIDE/" + docid);
            result = new Promise(function (resolve, reject) {
              try {
                fs.readFile(htmlFolder + htmlFile, "utf8", function (err, data) {
                  fs.readFile(cssFolder + "/" + "stylesheet.css", "utf8",
                  /*#__PURE__*/
                  function () {
                    var _ref51 = (0, _asyncToGenerator2.default)(
                    /*#__PURE__*/
                    _regenerator.default.mark(function _callee66(err2, data_ss) {
                      var tablePage, spaceRow, htmlHeader, findHeader, possible_tags_for_title, t, htmlHeaderText, actual_table, colum_with_numbers, formattedPage, predictions, terms_matrix, preds_matrix, class_matrix, content_type_matrix, max_col, l, getTopDescriptors, cleanModifier, col_top_descriptors, c, content_types_in_column, unique_modifiers_in_column, u, unique_modifier, column_data, column_terms, k, allfreqs, all_terms, descriptors, row_top_descriptors, r, content_types_in_row, row_data, row_terms, predicted;
                      return _regenerator.default.wrap(function _callee66$(_context66) {
                        while (1) {
                          switch (_context66.prev = _context66.next) {
                            case 0:
                              _context66.prev = 0;
                              tablePage = cheerio.load(data); // tablePage("col").removeAttr('style');

                              if (tablePage) {
                                _context66.next = 5;
                                break;
                              }

                              resolve({
                                htmlHeader: "",
                                formattedPage: "",
                                title: ""
                              });
                              return _context66.abrupt("return");

                            case 5:
                              _context66.next = 11;
                              break;

                            case 7:
                              _context66.prev = 7;
                              _context66.t0 = _context66["catch"](0);
                              // console.log(JSON.stringify(e)+" -- " + JSON.stringify(data))
                              resolve({
                                htmlHeader: "",
                                formattedPage: "",
                                title: ""
                              });
                              return _context66.abrupt("return");

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
                                  htmlHeader = htmlHeader + '<tr ><td style="font-size:20px; font-weight:bold; white-space: normal;">' + encodeURI(actualText) + "</td></tr>";
                                }

                                return {
                                  htmlHeader: htmlHeader,
                                  totalTextChars: totalTextChars
                                };
                              };

                              possible_tags_for_title = [".headers", ".caption", ".captions", ".article-table-caption"];
                              _context66.t1 = _regenerator.default.keys(possible_tags_for_title);

                            case 16:
                              if ((_context66.t2 = _context66.t1()).done) {
                                _context66.next = 23;
                                break;
                              }

                              t = _context66.t2.value;
                              htmlHeader = findHeader(tablePage, possible_tags_for_title[t]);

                              if (!(htmlHeader.totalTextChars > 0)) {
                                _context66.next = 21;
                                break;
                              }

                              return _context66.abrupt("break", 23);

                            case 21:
                              _context66.next = 16;
                              break;

                            case 23:
                              htmlHeader = "<table>" + htmlHeader.htmlHeader + "</table>";
                              htmlHeaderText = cheerio(htmlHeader).find("td").text();
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

                              formattedPage = actual_table.indexOf("tr:hover" < 0) ? "<div><style>" + data_ss + "</style>" + actual_table + "</div>" : actual_table; // var formattedPage = "<div>"+actual_table+"</div>"

                              _context66.next = 34;
                              return attempt_predictions(actual_table);

                            case 34:
                              predictions = _context66.sent;
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

                            case 45:
                              if (!(c < max_col)) {
                                _context66.next = 75;
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
                                _context66.next = 49;
                                break;
                              }

                              return _context66.abrupt("continue", 72);

                            case 49:
                              unique_modifiers_in_column = class_matrix.map(function (x) {
                                return x[c];
                              }).map(cleanModifier).filter(function (v, i, a) {
                                return a.indexOf(v) === i;
                              });
                              _context66.t3 = _regenerator.default.keys(unique_modifiers_in_column);

                            case 51:
                              if ((_context66.t4 = _context66.t3()).done) {
                                _context66.next = 72;
                                break;
                              }

                              u = _context66.t4.value;
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

                              _context66.t5 = METHOD;
                              _context66.next = _context66.t5 === "grouped_predictor" ? 60 : 68;
                              break;

                            case 60:
                              all_terms = column_terms[unique_modifier] ? column_terms[unique_modifier].join(" ") : "";

                              if (!(column_terms[unique_modifier] && all_terms && column_terms[unique_modifier].length > 1 && all_terms.length > 0)) {
                                _context66.next = 67;
                                break;
                              }

                              _context66.next = 64;
                              return grouped_predictor(all_terms);

                            case 64:
                              descriptors = _context66.sent;
                              descriptors = descriptors[all_terms].split(";");
                              col_top_descriptors[col_top_descriptors.length] = {
                                descriptors: descriptors,
                                c: c,
                                unique_modifier: unique_modifier
                              };

                            case 67:
                              return _context66.abrupt("break", 70);

                            case 68:
                              descriptors = getTopDescriptors(3, column_data.freqs, ["arms", "undefined"]);
                              if (descriptors.length > 0) col_top_descriptors[col_top_descriptors.length] = {
                                descriptors: descriptors,
                                c: c,
                                unique_modifier: unique_modifier
                              };

                            case 70:
                              _context66.next = 51;
                              break;

                            case 72:
                              c++;
                              _context66.next = 45;
                              break;

                            case 75:
                              // Estimate row predictions
                              row_top_descriptors = []; // debugger

                              _context66.t6 = _regenerator.default.keys(preds_matrix);

                            case 77:
                              if ((_context66.t7 = _context66.t6()).done) {
                                _context66.next = 100;
                                break;
                              }

                              r = _context66.t7.value;
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
                                _context66.next = 82;
                                break;
                              }

                              return _context66.abrupt("continue", 77);

                            case 82:
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
                              _context66.t8 = METHOD;
                              _context66.next = _context66.t8 === "grouped_predictor" ? 88 : 96;
                              break;

                            case 88:
                              all_terms = row_terms.join(" ");

                              if (!(row_terms.length > 1)) {
                                _context66.next = 95;
                                break;
                              }

                              _context66.next = 92;
                              return grouped_predictor(all_terms);

                            case 92:
                              descriptors = _context66.sent;
                              descriptors = descriptors[all_terms].split(";");
                              row_top_descriptors[row_top_descriptors.length] = {
                                descriptors: descriptors,
                                c: r,
                                unique_modifier: ""
                              };

                            case 95:
                              return _context66.abrupt("break", 98);

                            case 96:
                              descriptors = getTopDescriptors(3, row_data.freqs, ["undefined"]);
                              if (descriptors.length > 0) row_top_descriptors[row_top_descriptors.length] = {
                                descriptors: descriptors,
                                c: r,
                                unique_modifier: ""
                              };

                            case 98:
                              _context66.next = 77;
                              break;

                            case 100:
                              predicted = {
                                cols: col_top_descriptors,
                                rows: row_top_descriptors,
                                predictions: predictions // res.send({status: "good", htmlHeader,formattedPage, title:  titles_obj[req.query.docid.split(" ")[0]], predicted })

                              };
                              resolve({
                                status: "good",
                                htmlHeader: htmlHeader,
                                formattedPage: formattedPage,
                                title: titles_obj[docid.split("_")[0]],
                                predicted: predicted
                              });

                            case 102:
                            case "end":
                              return _context66.stop();
                          }
                        }
                      }, _callee66, this, [[0, 7]]);
                    }));

                    return function (_x128, _x129) {
                      return _ref51.apply(this, arguments);
                    };
                  }());
                });
              } catch (e) {
                reject({
                  status: "bad"
                });
              }
            });
            return _context67.abrupt("return", result);

          case 13:
            _context67.prev = 13;
            _context67.t0 = _context67["catch"](0);
            return _context67.abrupt("return", {
              status: "bad"
            });

          case 16:
          case "end":
            return _context67.stop();
        }
      }
    }, _callee67, this, [[0, 13]]);
  }));
  return _readyTableData.apply(this, arguments);
}

app.get('/api/getTable',
/*#__PURE__*/
function () {
  var _ref43 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee43(req, res) {
    var tableData;
    return _regenerator.default.wrap(function _callee43$(_context43) {
      while (1) {
        switch (_context43.prev = _context43.next) {
          case 0:
            _context43.prev = 0;

            if (!(req.query && req.query.docid && req.query.page && available_documents[req.query.docid] && available_documents[req.query.docid].pages.indexOf(req.query.page) > -1)) {
              _context43.next = 8;
              break;
            }

            _context43.next = 4;
            return readyTableData(req.query.docid, req.query.page);

          case 4:
            tableData = _context43.sent;
            res.send(tableData);
            _context43.next = 9;
            break;

          case 8:
            res.send({
              status: "wrong parameters",
              query: req.query
            });

          case 9:
            _context43.next = 15;
            break;

          case 11:
            _context43.prev = 11;
            _context43.t0 = _context43["catch"](0);
            console.log(_context43.t0);
            res.send({
              status: "probably page out of bounds, or document does not exist",
              query: req.query
            });

          case 15:
          case "end":
            return _context43.stop();
        }
      }
    }, _callee43, this, [[0, 11]]);
  }));

  return function (_x113, _x114) {
    return _ref43.apply(this, arguments);
  };
}());
app.get('/api/getAvailableTables', function (req, res) {
  res.send(available_documents);
});
app.get('/api/getAnnotations',
/*#__PURE__*/
function () {
  var _ref44 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee44(req, res) {
    return _regenerator.default.wrap(function _callee44$(_context44) {
      while (1) {
        switch (_context44.prev = _context44.next) {
          case 0:
            _context44.t0 = res;
            _context44.next = 3;
            return getAnnotationResults();

          case 3:
            _context44.t1 = _context44.sent;

            _context44.t0.send.call(_context44.t0, _context44.t1);

          case 5:
          case "end":
            return _context44.stop();
        }
      }
    }, _callee44, this);
  }));

  return function (_x115, _x116) {
    return _ref44.apply(this, arguments);
  };
}());
app.get('/api/deleteAnnotation',
/*#__PURE__*/
function () {
  var _ref45 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee46(req, res) {
    var deleteAnnotation;
    return _regenerator.default.wrap(function _callee46$(_context46) {
      while (1) {
        switch (_context46.prev = _context46.next) {
          case 0:
            deleteAnnotation =
            /*#__PURE__*/
            function () {
              var _ref46 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee45(docid, page, user) {
                var client, done;
                return _regenerator.default.wrap(function _callee45$(_context45) {
                  while (1) {
                    switch (_context45.prev = _context45.next) {
                      case 0:
                        _context45.next = 2;
                        return pool.connect();

                      case 2:
                        client = _context45.sent;
                        _context45.next = 5;
                        return client.query('DELETE FROM annotations WHERE docid = $1 AND page = $2 AND "user" = $3', [docid, page, user]).then(function (result) {
                          return console.log("Annotation deleted: " + new Date());
                        }).catch(function (e) {
                          return console.error(e.stack);
                        }).then(function () {
                          return client.release();
                        });

                      case 5:
                        done = _context45.sent;

                      case 6:
                      case "end":
                        return _context45.stop();
                    }
                  }
                }, _callee45, this);
              }));

              return function deleteAnnotation(_x119, _x120, _x121) {
                return _ref46.apply(this, arguments);
              };
            }();

            if (!(req.query && req.query.docid && req.query.page && req.query.user)) {
              _context46.next = 7;
              break;
            }

            _context46.next = 4;
            return deleteAnnotation(req.query.docid, req.query.page, req.query.user);

          case 4:
            res.send("done");
            _context46.next = 8;
            break;

          case 7:
            res.send("delete failed");

          case 8:
          case "end":
            return _context46.stop();
        }
      }
    }, _callee46, this);
  }));

  return function (_x117, _x118) {
    return _ref45.apply(this, arguments);
  };
}());
app.get('/api/getAnnotationByID',
/*#__PURE__*/
function () {
  var _ref47 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee47(req, res) {
    var page, user, annotations, final_annotations, r, ann, existing, final_annotations_array, entry;
    return _regenerator.default.wrap(function _callee47$(_context47) {
      while (1) {
        switch (_context47.prev = _context47.next) {
          case 0:
            if (!(req.query && req.query.docid && req.query.docid.length > 0)) {
              _context47.next = 13;
              break;
            }

            page = req.query.page && req.query.page.length > 0 ? req.query.page : 1;
            user = req.query.user && req.query.user.length > 0 ? req.query.user : "";
            _context47.next = 5;
            return getAnnotationByID(req.query.docid, page, user);

          case 5:
            annotations = _context47.sent;
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

            _context47.next = 14;
            break;

          case 13:
            res.send({
              error: "failed request"
            });

          case 14:
          case "end":
            return _context47.stop();
        }
      }
    }, _callee47, this);
  }));

  return function (_x122, _x123) {
    return _ref47.apply(this, arguments);
  };
}());
app.get('/api/recordAnnotation',
/*#__PURE__*/
function () {
  var _ref48 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee48(req, res) {
    return _regenerator.default.wrap(function _callee48$(_context48) {
      while (1) {
        switch (_context48.prev = _context48.next) {
          case 0:
            console.log(JSON.stringify(req.query));

            if (!(req.query && req.query.docid.length > 0 && req.query.page.length > 0 && req.query.user.length > 0 && req.query.annotation.length > 0)) {
              _context48.next = 4;
              break;
            }

            _context48.next = 4;
            return insertAnnotation(req.query.docid, req.query.page, req.query.user, {
              annotations: JSON.parse(req.query.annotation)
            }, req.query.corrupted, req.query.tableType, req.query.corrupted_text);

          case 4:
            //insertAnnotation("a doucment",2, "a user", {})
            res.send("saved annotation: " + JSON.stringify(req.query));

          case 5:
          case "end":
            return _context48.stop();
        }
      }
    }, _callee48, this);
  }));

  return function (_x124, _x125) {
    return _ref48.apply(this, arguments);
  };
}());
app.listen(_config.PORT, function () {
  console.log('Express Server running on port ' + _config.PORT + ' ' + new Date().toISOString());
}); //////////////////  Evaluation bit.
// var runDocuments = async () => {
//   console.log("getting all predictions")
//
//   var predictions = "user,docid,page,corrupted,tableType,location,number,content,qualifiers\n"
//
//   var count = 1;
//
//   for ( var a in available_documents){
//     for ( var p in available_documents[a].pages ) {
//       console.log(a+"  --  "+p+"  --  "+count+" / "+DOCS.length)
//       count = count + 1;
//
//       try {
//        var page = available_documents[a].pages[p]
//        var docid = a
//        var data = await readyTableData(docid,page)
//
//        if ( data.status == "bad" ){
//          console.log(a+"  --  "+p+"  --  "+"failed")
//          continue;
//        } else {
//          console.log("good")
//        }
//
//        debugger
//
//        for ( var c in data.predicted.cols) {
//          var col = data.predicted.cols[c]
//          predictions += ["auto_"+METHOD,docid,page,false,"na","Col",(parseInt(col.c)+1),col.descriptors.join(";"),col.unique_modifier.split(" ").join(";")].join(",")+"\n"
//        }
//
//        for ( var r in data.predicted.rows) {
//          var row = data.predicted.rows[r]
//          predictions += ["auto_"+METHOD,docid,page,false,"na","Row",(parseInt(row.c)+1),row.descriptors.join(";"),row.unique_modifier.split(" ").join(";")].join(",")+"\n"
//        }
//      } catch (e){
//        console.log("failed")
//      }
//     }
//   }
// }
//
// runDocuments();