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

function prepareAvailableDocuments(_x, _x2, _x3, _x4, _x5) {
  return _prepareAvailableDocuments.apply(this, arguments);
}

function _prepareAvailableDocuments() {
  _prepareAvailableDocuments = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee50(filter_topic, filter_type, hua, filter_group, filter_labelgroup) {
    var ftop, ftyp, fgroup, flgroup, type_lookup, i, filtered_docs_ttype, allAnnotations, all_annotated_docids, ordered_Splits, ordered_docs_to_label, exclude_pmids, with_corrupted_text, allLabelled, selected_group_docs, group_index, selected_label_docs, label_index, results;
    return _regenerator.default.wrap(function _callee50$(_context50) {
      while (1) {
        switch (_context50.prev = _context50.next) {
          case 0:
            // debugger
            ftop = filter_topic ? filter_topic : [];
            ftyp = filter_type ? filter_type : [];
            fgroup = filter_group ? filter_group : [];
            flgroup = filter_labelgroup ? filter_labelgroup : [];
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
            _context50.next = 10;
            return getAnnotationResults();

          case 10:
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

            ordered_Splits = [["30936738_1.html", "30936738_2.html", "30936738_3.html", "30936738_4.html", "30936738_5.html", "16508926_6.html", "27744141_2.html", "27098404_1.html", "30341453_1.html", "30341453_2.html"], ["16495392fig_2.html", "24907147_2.html", "24907147_3.html", "24907147_4.html", "24907147_5.html", "27502582_2.html", "30473179_3.html", "25047021_1.html", "27165179_2.html", "29338762_2.html"], ["27493790_2.html", "29299340_2.html", "30696483_2.html", "29409133_1.html", "28968735_2.html", "28968735_3.html", "29045207_2.html", "29685860fig_1.html", "20484828_2.html", "26589819_1.html"], ["19515181_2.html", "25414932_1.html", "26833744_2.html", "26833744_3.html", "30287422_2.html", "29937431_2.html", "25881510_2.html", "25772548_2.html", "29941478fig_1.html", "30425095_1.html"], ["30425095b_1.html", "27161178_2.html", "30609212_1.html", "30609212_2.html", "19210140_2.html", "26579834_1.html", "26579834_5.html", "26580237_3.html", "27299675_1.html", "29777264fig_1.html"], ["30393950_2.html", "19614946_2.html", "19614946_3.html", "26934128_2.html", "30614616_1.html", "30571562_2.html", "26786577_2.html", "18284434_2.html", "22672586_2.html", "30851070_1.html"], ["30830724_1.html", "30830724_2.html", "25468945_2.html", "25629790_2.html", "30882238_1.html", "19508464_1.html", "19508464_2.html", "30566006fig_1.html", "30566004_2.html", "30392095_2.html"], ["19650752_2.html", "30953107_1.html", "30953107_2.html", "21545947fig_2.html", "19917888app_1.html", "19917888fig_2.html", "17384437fig_1.html", "9036306_1.html", "18371559_1.html", "27395349_2.html"], ["27354044_3.html", "26541915_6.html", "26027630fig_1.html", "30183102fig_1.html", "15639688_2.html", "17560879_2.html", "27619750_3.html", "24411003_1.html", "25743173_2.html", "25743173_3.html"], ["19166691_2.html", "27956003_2.html", "27846344fig_2.html", "25135178_2.html", "25282519_2.html", "19190658_2.html", "20670726_2.html", "22747613_2.html", "22747613_3.html", "21925996_2.html"], ["21925996_3.html", "21925996_4.html", "24067881_2.html", "22504093_2.html", "30203005_2.html", "29857145_3.html", "29857145_4.html", "29857145_5.html", "29857145_6.html", "29857145_7.html"], ["21723220_1.html", "21723220_2.html", "21723220_3.html", "16267322_2.html", "22704916_2.html", "17634459_2.html", "20491747_2.html", "29909019_2.html", "29797519_1.html", "24120253_4.html"], ["20429821_2.html", "20429821_3.html", "20429821_4.html", "21227674_2.html", "20463178_2.html", "27609408_2.html", "24966672_3.html", "30815468_1.html", "30815468_2.html", "30815468_3.html"], ["27087007_1.html", "27316465_2.html", "27316465_3.html", "27316465_4.html", "27316465_5.html", "27215749_3.html", "27715335_2.html", "18511702_2.html", "21627828_2.html", "21627828_3.html"], ["27039236_2.html", "21586508_2.html", "28558833_2.html", "28558833_3.html", "29413502_2.html", "21875546_2.html", "23040786_2.html", "28903864_2.html", "30053967fig_1.html", "20925534_2.html"], ["20925534_3.html", "29073947_2.html", "26994121_2.html", "25787199_2.html", "24727254_2.html", "26059896fig_2.html", "20385930fig_2.html", "19389561fig_2.html", "21816478_2.html", "7997016_1.html"], ["9603532_1.html", "9848888_2.html", "18479744_2.html", "24780614_3.html", "17244641_2.html", "26630143_2.html", "26304934_2.html", "19915221_2.html", "8950879_1.html", "30659410_1.html"], ["30659410_2.html", "30659410_3.html", "30465321_2.html", "30465321_3.html", "30465321_4.html", "30465321_5.html", "30465321_6.html", "26547918_2.html", "22316106_2.html", "22436129_2.html"], ["22709460_2.html", "23564919_2.html", "23683134_2.html", "24251359_3.html", "26093161_1.html", "26578849_2.html", "27103795_1.html", "27207971_1.html", "27387994_1.html", "27496855_1.html"]]; // Second Session docids

            ordered_Splits = [["30936738_1.html", "30936738_2.html", "30936738_3.html", "30936738_4.html", "30936738_5.html", "16508926_6.html", "27744141_2.html", "16495392fig_2.html", "24907147_2.html", "24907147_3.html"], ["24907147_4.html", "24907147_5.html", "27502582_2.html", "30473179_3.html", "25047021_1.html", "27165179_2.html", "29338762_2.html", "29299340_2.html", "30696483_2.html", "29409133_1.html"], ["28968735_2.html", "28968735_3.html", "29045207_2.html", "29685860fig_1.html", "19515181_2.html", "25414932_1.html", "26833744_2.html", "26833744_3.html", "30287422_2.html", "29937431_2.html"], ["25881510_2.html", "25772548_2.html", "30425095_1.html", "30425095b_1.html", "30609212_1.html", "30609212_2.html", "19210140_2.html", "26579834_1.html", "26579834_5.html", "26580237_3.html"], ["27299675_1.html", "30393950_2.html", "19614946_2.html", "19614946_3.html", "30614616_1.html", "26786577_2.html", "18284434_2.html", "22672586_2.html", "30830724_1.html", "30830724_2.html"], ["25468945_2.html", "25629790_2.html", "30566006fig_1.html", "30392095_2.html", "19650752_2.html", "30953107_1.html", "30953107_2.html", "21545947fig_2.html", "19917888app_1.html", "17384437fig_1.html"], ["9036306_1.html", "18371559_1.html", "26541915_6.html", "26027630fig_1.html", "15639688_2.html", "17560879_2.html", "27619750_3.html", "24411003_1.html", "25743173_2.html", "25743173_3.html"], ["19166691_2.html", "27956003_2.html", "27846344fig_2.html", "25282519_2.html", "19190658_2.html", "21925996_2.html", "21925996_3.html", "21925996_4.html", "24067881_2.html", "22504093_2.html"], ["30203005_2.html", "29857145_3.html", "29857145_4.html", "29857145_5.html", "29857145_6.html", "29857145_7.html", "16267322_2.html", "17634459_2.html", "20491747_2.html", "29909019_2.html"], ["29797519_1.html", "24120253_4.html", "21227674_2.html", "20463178_2.html", "27609408_2.html", "24966672_3.html", "30815468_1.html", "30815468_2.html", "30815468_3.html", "27087007_1.html"], ["27316465_2.html", "27316465_3.html", "27316465_4.html", "27316465_5.html", "27215749_3.html", "27715335_2.html", "18511702_2.html", "21627828_2.html", "21627828_3.html", "21586508_2.html"], ["28558833_2.html", "28558833_3.html", "29413502_2.html", "21875546_2.html", "23040786_2.html", "28903864_2.html", "30053967fig_1.html", "20925534_2.html", "20925534_3.html", "29073947_2.html"], ["26994121_2.html", "24727254_2.html", "26059896fig_2.html", "19389561fig_2.html", "21816478_2.html", "7997016_1.html", "9603532_1.html", "9848888_2.html", "18479744_2.html", "24780614_3.html"], ["17244641_2.html", "26630143_2.html", "26304934_2.html", "19915221_2.html", "8950879_1.html", "26547918_2.html", "22316106_2.html", "22436129_2.html", "22709460_2.html", "23564919_2.html"], ["23683134_2.html", "24251359_3.html", "26578849_2.html", "27103795_1.html", "27496855_1.html"]]; // var labellers = {"23529173_3":"lili","15851647_2":"David","30729456_2":"David","17113426_2":"David","12205648_2":"David","28882235_2":"lili","16508926_4":"David","28818881_2":"David","20801500_2":"lili","30882239_3":null,"30352894_1":"Elaine","30525116_2":"lili","18032739_2":"lili","19001508_2":"lili","26627989_2":"David","19917888_2":"lili","30830724_5":null,"26151264_2":"lili","17846352_2":"lili","15659722_1":"lili","21209123_2":"Elaine","15851647_3":"Vicky","11527638_1":"lili","29028981_3":"Elaine","17097378_1":"Elaine","11419425_2":"lili","27465265_2":"lili","29299340_2":"Elaine","15659722_2":"lili","23735746_2":"Elaine ","26541915_2":"lili","29146124_3":"lili","18757089_2":"lili","30248105_3":"David","8121459_2":"lili","20979470_3":"David","16380589_2":"David","28382371_2":"lili","30591006_2":null,"19717850_2":"lili","24842697_3":"lili","30609212_3":null,"22235820_3":"lili","29132880_2":"lili","17804843_2":"David","20621900_2":"lili","19683639_2":"lili","15238590_1":null,"30525116_4":"lili","23465037_2":"Elaine","17470434_2":"David","21332630_2":"Elaine","27576775_2":"lili","19336502_2":"David","30830724_3":null,"23992602_2":null,"20801495_2":"lili","17456819_2":null,"20393175_3":"Elaine","21128814_3":"lili","23964932_2":"Elaine","25681464_2":"lili","29544870_2":"lili","20883926_2":"lili","28882235_3":"lili","25465416_2":"lili","12899584_2":"David","28316279_2":"lili","28847206_2":"lili","27313282_2":"lili","28801539_3":"lili","29544870_4":"lili","18451347_2":"David","25046337_2":"David","12803733_2":"Elaine","19409693_2":"Elaine","28118533_2":"David","17292766_4":"David","29406853_2":"lili","30026335_2":"Elaine","18227370_2":"lili","17846352_3":"lili","28902593_2":"lili","12479763_1":null,"30830724_4":null,"25465417_2":"lili","24621834_2":"lili","27144849_2":"David","30614616_2":null,"14657064_2":"David","22443427_2":"lili","22443427_3":"lili","23425163_2":"lili","18972097_1":"lili","16508926_3":"David","15051694_2":null,"23216615_2":"lili","23500237_2":"lili","23726159_2":"lili","30696483_1":"Elaine","26491109_2":"lili","25728587_3":"Elaine","22490878_3":"lili","25698905_2":"lili","21216833_2":"lili","19850525_2":"lili","24842697_2":"lili","12803733_3":"Elaine","26054553_2":"David","28899222_2":"Elaine","24283598_2":"lili","17060377_3":"lili","21642014_3":"Elaine","28573499_3":"lili","26653621_2":"lili","29685860_2":"lili","22490878_1":"lili","30525116_3":"lili","27612281_2":"Elaine","12803733_5":"Elaine","23812596_2":"Elaine","20163842_2":"Elaine","30654882_1":"lili","27659566_3":"lili","26475142_3":"lili","30882239_5":null,"20925544_3":"lili","30586757_4":null,"29132879_4":"lili","26762525_2":"lili","21645018_2":"Elaine","20393175_4":"Elaine","18753638_2":"lili","22490878_2":"lili","28801539_4":"lili","19336502_3":"David","30371334_6":"lili","17398308_2":"David","29132879_3":"lili","27765312_2":"lili","29146124_2":"lili","28189475_2":"lili","28801539_2":"lili","10438259_1":"David","18227370_5":"lili","24716680_3":"lili","26762525_3":"lili","27935736_2":"lili","28467869_3":"Elaine","22085343_1":"lili","30734043_2":"lili","21871706_2":"Elaine","25182247_2":"David","18753639_3":"lili","30248105_2":"David","19447387_3":"David","27144849_4":"David","26446706_1":"lili","23529173_2":"lili","20801495_3":"lili","26052984_2":"David","12456232_2":"David","25792124_2":"lili","30465321_3":"Elaine","30026335_3":"Elaine","18674411_2":"David","19596014_2":"Elaine","26754626_2":"lili","27589414_2":"David","29544870_3":"lili","28473423_2":"Elaine","18227370_3":"lili","26471380_2":"lili","10438259_2":"David","27708114_2":"David","18667204_2":"David","30586757_6":null,"30865796_2":"lili","24664227_2":"Elaine","29028981_2":"Elaine","25728587_2":"Elaine","15028365_1":"Vicky","28246237_2":"lili","15998891_2":"Elaine","27672117_2":"David","30830724_6":null,"30882238_2":null,"28573499_2":"lili","21545947_3":"lili","19470885_2":"David","29685860_1":"lili","17304660_2":"David","20393175_2":"Elaine","19704100_2":"lili","16572114_2":"Elaine","27616196_4":null,"27959607_2":"Elaine","25002161_2":"lili","10789664_1":"David","29793629_2":"lili","19369667_2":"David","19847908_2":"David","17065671_2":"Elaine","27335114_2":"lili","18753639_2":"lili","27612281_3":"Elaine","17470824_2":"Elaine","26699168_2":"David","22396585_2":"lili","26792812_2":"Elaine","22337213_2":"lili","29307087_2":"David","27190009_2":"Elaine","20883926_3":"lili","17984166_2":"lili","25399274_2":"David","15579515_2":"David","25406305_2":"lili","26547918_2":"Elaine","26135703_2":"Elaine","20979470_2":"David","27144849_3":"David","27647847_2":"lili","29045207_2":"Elaine","17259484_2":"David","26338971_2":"lili","21128814_2":"lili","18676075_2":"lili","28382371_3":"lili","26523993_2":"lili","27418597_2":"lili","18398080_2":"lili","25354738_2":"Elaine","28968735_3":"Elaine","20484828_1":"David","29132879_2":"lili","23451835_2":"lili","23128104_2":"David","14724302_2":"David","20436046_3":"David","24184169_2":"lili","25176136_2":"lili","17292766_5":"David","26523993_3":"lili","16508926_5":"David","12456232_3":"David","22470539_2":"lili","25773268_2":"lili","16533938_2":"lili","30465321_2":"Elaine","26886418_2":"lili","19201775_2":"Elaine","24727258_2":"lili","30696483_2":"Elaine","27589414_1":"David","27576559_2":"Elaine","27144849_1":"David","12601075_2":"David","22235820_2":"lili","15028365_2":"Vicky","30586757_5":null,"18537526_2":"lili","30609212_2":null,"25637937_2":"lili","28279891_2":"lili","28801539_5":"lili","24839241_2":"Elaine","22932716_2":"lili","27046162_2":"lili","19447387_2":"David","30591006_3":null,"30465321_4":"Elaine","17634458_2":"Elaine","30667279_1":"lili","30352894_2":"Elaine ","27144849_5":"David","18000186_2":"lili","28844192_2":"lili","30248105_4":"David","30882239_4":null,"23473369_2":"lili","25698905_3":"lili","29084736_2":"lili","28300867_2":"lili","20707767_1":"Vicky","18821708_2":"David","18227370_4":"lili","30465321_5":"Elaine","24119319_2":"Elaine","19726772_2":"lili","17384437_1":null,"22335737_1":"lili","16495392_2":"David","16714187_2":"lili","28968735_2":"Elaine","28467869_2":"Elaine","19917888_3":"lili","12803733_4":"Elaine","17097378_2":"Elaine","21502549_2":"lili","26400827_3":"lili","20678878_2":"lili","18757090_2":"lili","30851070_2":null,"28975241_2":"lili","16651474_1":"lili","22576673_2":"lili","17292766_3":"David","17060377_2":"lili","22672586_2":null,"30465321_6":"Elaine","20436046_2":"David","27639327_2":"Elaine","15883637_2":"Elaine","29409133_1":"Elaine","23425163_3":"lili","20925544_2":"lili","15049402_2":"David","12243636_1":null,"12899584_1":null,"19567517_2":"Elaine","26374849_2":"lili","27046160_2":"lili","29490509_2":"Elaine","28573499_4":"lili","25455006_2":"lili","22305835_2":"lili","30851070_3":null,"15537681_2":"lili","23325525_1":"David","27659566_2":"lili"};

            ordered_docs_to_label = [["25277614_2.html", "19336502_4.html", "24001888_2.html", "28544533_2.html", "28544533_3.html", "27965257_2.html", "30564451_2.html", "18823986_2.html", "17965424_2.html", "19560810_1.html"], ["29463520_2.html", "30121827_3.html", "18821708_3.html", "26238672_1.html", "26238672_2.html", "20937671_2.html", "28405473_2.html", "28153828_2.html", "26139005_2.html", "29908670_1.html"], ["26275429_2.html", "22873530_2.html", "22052584_2.html", "25779603_2.html", "22378566_2.html", "28215362_2.html", "26097039_2.html", "26097039_3.html", "29415145_1.html", "29415145_2.html"], ["27028914_2.html", "30191421_2.html", "24339179_2.html", "29556416_2.html", "29556416_3.html", "29880010_1.html", "30522501_1.html", "30871355_3.html", "30871355_4.html", "24245566_2.html"], ["23501976_2.html", "23396280_2.html", "30165610_3.html", "23810874_2.html", "30146932_2.html", "30146931_2.html", "30146931_3.html", "30590387_2.html", "30590387_3.html", "28531241_2.html"], ["27893045_2.html", "19001024_1.html", "19125778_2.html", "27033025_2.html", "23339726_2.html", "26132939_2.html", "26132939_3.html", "26132939_4.html", "26744025_2.html", "28237263_2.html"], ["28237263_3.html", "29145215_2.html", "29145215_3.html", "22193143_2.html", "26774608_2.html", "26774608_3.html", "29064626_2.html", "28246236_2.html", "27289121_2.html", "25765696_2.html"], ["25765696_3.html", "23706759_2.html", "28753486_2.html", "28753486_3.html", "28605608_2.html", "29941478_1.html", "29941478_2.html", "29937267_2.html", "29526832_2.html", "22686416_2.html"], ["26681720_2.html", "24898834_2.html", "24898834_3.html", "23656980_2.html", "23564916_2.html", "23564916_3.html", "23564916_4.html", "30203580_2.html", "28842165_2.html", "28842165_3.html"], ["22913891_3.html", "22913891_4.html", "22913891_5.html", "22913891_6.html", "17878242_1.html", "22234149_2.html", "27252787_2.html", "28327140_2.html", "27977934_2.html", "28197834_2.html"], ["26373629_2.html", "26373629_3.html", "24918789_2.html", "26580237_2.html", "28904068_2.html", "28666775_2.html", "28666775_3.html", "28386035_1.html", "28386035_2.html", "27299675_2.html"], ["26378978_2.html", "26378978_3.html", "30586757_3.html", "29777264_1.html", "28910237_2.html", "18223031_2.html", "18223031_3.html", "28921862_3.html", "25795432_2.html", "25795432_3.html"], ["25592197_2.html", "26179619_2.html", "19688336_2.html", "18539916_1.html", "18539916_2.html", "17765963_2.html", "30571562_3.html", "22369287_2.html", "26524706_2.html", "26524706_3.html"], ["26358285_2.html", "25758769_2.html", "25552421_2.html", "25552421_3.html", "25189213_1.html", "25189213_2.html", "23992601_2.html", "23992601_3.html", "17980928_3.html", "30474818_2.html"], ["29766634_2.html", "21682834_2.html", "27484756_2.html", "23909985_2.html", "24067431_2.html", "29103664_2.html", "26121561_2.html", "22509859_1.html", "19097665_2.html", "19097665_3.html"], ["30882239_2.html", "30415602_2.html", "30547388_2.html", "30547388_3.html", "30547388_4.html", "29159457_2.html", "25852208_2.html", "20228403_2.html", "20228403_3.html", "20228403_4.html"], ["20228402_2.html", "20228402_3.html", "20228402_4.html", "29790415_1.html", "29790415_2.html", "27502307_2.html", "29748996_1.html", "27742728_2.html", "27437883_2.html", "28035868_2.html"], ["27977392_2.html", "27977392_3.html", "25271206_2.html", "27684308_2.html", "23129601_2.html", "23963895_2.html", "27295427_2.html", "28854085_2.html", "29279300_2.html", "30566006_1.html"], ["30566006_2.html", "30566004_1.html", "30354517_1.html", "30586723_2.html", "30586723_3.html", "30418475_2.html", "21428766_2.html", "18094675_2.html", "18094675_3.html", "18094675_4.html"], ["18199798_2.html", "24206457_2.html", "21332627_2.html", "21332627_3.html", "26620248_2.html", "27406394_2.html", "25352655_2.html", "25352655_3.html", "28432746_1.html", "28432746_2.html"], ["28386990_1.html", "28386990_2.html", "28386990_3.html", "30218434_1.html", "30291013_2.html", "28263812_2.html", "29664406_2.html", "29228101_2.html", "29148144_2.html", "28359411_2.html"], ["26475142_2.html", "24281137_3.html", "29431256_2.html", "28948656_2.html", "28402745_2.html", "27842179_2.html", "27395349_3.html", "27354044_2.html", "26915374_2.html", "26754626_3.html"], ["26541915_3.html", "26541915_5.html", "29661699_2.html", "20487050_2.html", "26027630_2.html", "30183102_1.html", "30183102_2.html", "19660610_2.html", "27639753_2.html", "27639753_3.html"], ["27639753_4.html", "15781429_2.html", "17560879_1.html", "22913893_2.html", "21174145_2.html", "20953684_2.html", "27619750_2.html", "28844508_2.html", "28844508_3.html", "26330422_2.html"], ["28391886_2.html", "17058629_2.html", "23040830_2.html", "15924587_2.html", "16709304_2.html", "16709304_3.html", "16709304_4.html", "29263150_2.html", "29263150_3.html", "29151034_2.html"], ["29151034_3.html", "29151034_4.html", "29151034_5.html", "28972004_1.html", "28972004_2.html", "28972004_3.html", "28231942_2.html", "29903515_2.html", "29903515_3.html", "29903515_4.html"], ["20151997_2.html", "17022864_3.html", "30336824_2.html", "30336824_3.html", "17011942_2.html", "22573644_2.html", "21815708_1.html", "21815708_2.html", "19423108_2.html", "19104004_3.html"], ["18172039_2.html", "18172039_3.html", "30415628_1.html", "28905478_1.html", "28905478_2.html", "28905478_3.html", "16116047_3.html", "16116047_4.html", "16116047_5.html", "16139123_3.html"], ["16139123_4.html", "18259029_2.html", "19139391_2.html", "16537662_2.html", "18498915_2.html", "18498915_3.html", "30175930_2.html", "25031188_2.html", "23733198_2.html", "23110471_1.html"], ["23110471_3.html", "22799613_1.html", "22799613_2.html", "20678674_2.html", "20469975_2.html", "18326958_2.html", "18615004_2.html", "18657652_2.html", "18375982_2.html", "15381674_2.html"], ["22248871_2.html", "19751115_2.html", "26066644_1.html", "23307827_2.html", "19596014_3.html", "21933100_2.html", "24120253_3.html", "26704701_2.html", "28877027_2.html", "26100349_2.html"], ["26100349_3.html", "21428765_2.html", "25045258_2.html", "23020650_2.html", "22177371_2.html", "26563670_2.html", "27796912_2.html", "28720336_2.html", "27616196_2.html", "27616196_3.html"], ["27616196_5.html", "23714653_2.html", "20418083_2.html", "20185426_2.html", "19716598_2.html", "18836213_2.html", "30290801_2.html", "30290801_3.html", "27215502_2.html", "30139780_2.html"], ["29409951_2.html", "29409951_3.html", "24966672_2.html", "28416587_2.html", "27767328_1.html", "27767328_2.html", "27767328_3.html", "27767328_4.html", "30587959_3.html", "30587959_4.html"], ["30587959_5.html", "30587959_6.html", "30584583_2.html", "30584583_3.html", "23471469_2.html", "23471469_3.html", "24156566_2.html", "25248764_2.html", "28278391_2.html", "27181606_2.html"], ["29925383_2.html", "27912982_2.html", "27912982_3.html", "27912982_4.html", "17605774_2.html", "17605774_3.html", "27993292_2.html", "27993292_3.html", "26112656_3.html", "25573406_2.html"], ["19443528_2.html", "20685748_2.html", "25490706_2.html", "25736990_2.html", "28159511_2.html", "29782217_2.html", "29782217_3.html", "24383720_2.html", "26233481_2.html", "26233481_3.html"], ["26233481_4.html", "29128192_3.html", "27609406_2.html", "22544891_2.html", "28395936_2.html", "27056586_2.html", "28848879_2.html", "28385353_2.html", "28385353_3.html", "28385353_4.html"], ["28385353_5.html", "28385353_6.html", "28385353_7.html", "24321804_2.html", "29429593_2.html", "23040786_1.html", "24253831_3.html", "24596459_2.html", "30053967_1.html", "30053967_2.html"], ["28720132_2.html", "28720132_3.html", "29713156_2.html", "29671280_2.html", "22259009_2.html", "27576774_2.html", "27046159_2.html", "26586780_2.html", "30354781_2.html", "23121439_2.html"], ["23121439_3.html", "25037988_2.html", "25037988_3.html", "24097439_2.html", "30166073_3.html", "15590586_2.html", "15590586_3.html", "15590586_4.html", "15998890_2.html", "15753114_2.html"], ["11442551_2.html", "25475110_2.html", "21673005_2.html", "18835953_2.html", "18339679_2.html", "24727254_3.html", "16801465_2.html", "19332455_2.html", "26059896_1.html", "26059896_2.html"], ["26059896_3.html", "26059896_4.html", "20385930_2.html", "20385930_3.html", "20357382_2.html", "20357382_3.html", "19389561_2.html", "19389561_3.html", "19349325_2.html", "20136164_1.html"], ["20136164_2.html", "20136164_3.html", "20136164_4.html", "20136164_5.html", "25670362_2.html", "25670362_3.html", "9892586_3.html", "9892586_4.html", "9841303_2.html", "23473396_2.html"], ["25161043_2.html", "15451146_2.html", "15337732_2.html", "27581531_2.html", "20400762_1.html", "24780614_2.html", "28844990_2.html", "18499565_2.html", "19850249_1.html", "19850249_2.html"], ["19850248_2.html", "19850248_3.html", "21060071_2.html", "25175921_2.html", "25175921_3.html", "30302940_4.html", "28939567_2.html", "16214597_2.html", "16214597_3.html", "16905022_2.html"], ["26762481_2.html", "25775052_2.html", "25775052_3.html", "25775052_4.html", "25775052_5.html", "27043082_2.html", "26321103_2.html", "19332467_2.html", "20582594_2.html", "21545942_2.html"], ["26271059_2.html", "21780946_2.html", "29447769_2.html", "24247616_2.html", "24247616_3.html", "15758000_2.html", "25523533_2.html", "24076283_2.html", "20200926_2.html", "27612281_4.html"], ["27612281_5.html", "27612281_6.html", "19776408_2.html", "28827011_2.html", "28924103_2.html", "26486868_2.html", "25657183_2.html", "16537663_2.html", "19717844_2.html", "19966341_2.html"], ["20194881_2.html", "20370912_2.html", "21059484_2.html", "21147728_2.html", "21576658_2.html", "21576658_3.html", "22084332_2.html", "22700854_2.html", "23271794_2.html", "23271794_3.html"], ["23743976_2.html", "23770182_1.html", "23770182_2.html", "23770182_3.html", "23991658_2.html", "23991658_3.html", "24251359_2.html", "24323795_2.html", "24842985_2.html", "25769357_2.html"], ["25769357_3.html", "26065986_2.html", "26093161_2.html", "26179767_2.html", "27358434_2.html", "27609678_2.html", "27807306_2.html", "28213368_2.html", "28302288_2.html", "28520924_2.html"], ["28520924_3.html", "28666993_2.html", "28689179_2.html", "29248859_2.html", "30012318_3.html"]];
            ordered_docs_to_label = [["25277614_2.html", "19336502_4.html", "24001888_2.html", "27965257_2.html", "30564451_2.html", "18823986_2.html", "17965424_2.html", "19560810_1.html", "29463520_2.html", "30121827_3.html"], ["18821708_3.html", "20937671_2.html", "28405473_2.html", "28153828_2.html", "26139005_2.html", "29908670_1.html", "26275429_2.html", "22873530_2.html", "22052584_2.html", "25779603_2.html"], ["22378566_2.html", "28215362_2.html", "26097039_2.html", "26097039_3.html", "29415145_1.html", "29415145_2.html", "27028914_2.html", "24339179_2.html", "29556416_2.html", "29556416_3.html"], ["29880010_1.html", "30522501_1.html", "30871355_3.html", "30871355_4.html", "24245566_2.html", "23396280_2.html", "30165610_3.html", "23810874_2.html", "30146932_2.html", "30146931_2.html"], ["30146931_3.html", "30590387_2.html", "30590387_3.html", "27893045_2.html", "19125778_2.html", "27033025_2.html", "23339726_2.html", "26132939_2.html", "26132939_3.html", "26132939_4.html"], ["28237263_2.html", "28237263_3.html", "29145215_2.html", "29145215_3.html", "26774608_2.html", "26774608_3.html", "29064626_2.html", "28246236_2.html", "27289121_2.html", "23706759_2.html"], ["28753486_2.html", "28753486_3.html", "28605608_2.html", "29937267_2.html", "29526832_2.html", "22686416_2.html", "26681720_2.html", "24898834_2.html", "24898834_3.html", "23656980_2.html"], ["23564916_2.html", "23564916_3.html", "23564916_4.html", "28842165_2.html", "28842165_3.html", "22913891_3.html", "22913891_4.html", "22913891_5.html", "22913891_6.html", "17878242_1.html"], ["22234149_2.html", "27252787_2.html", "28327140_2.html", "27977934_2.html", "28197834_2.html", "26373629_2.html", "26373629_3.html", "24918789_2.html", "26580237_2.html", "28904068_2.html"], ["28666775_2.html", "28666775_3.html", "28386035_1.html", "28386035_2.html", "27299675_2.html", "26378978_2.html", "26378978_3.html", "30586757_3.html", "28910237_2.html", "18223031_2.html"], ["18223031_3.html", "28921862_3.html", "25795432_2.html", "25795432_3.html", "25592197_2.html", "26179619_2.html", "18539916_1.html", "18539916_2.html", "17765963_2.html", "22369287_2.html"], ["26358285_2.html", "25189213_1.html", "25189213_2.html", "23992601_2.html", "23992601_3.html", "17980928_3.html", "30474818_2.html", "29766634_2.html", "21682834_2.html", "27484756_2.html"], ["23909985_2.html", "24067431_2.html", "29103664_2.html", "26121561_2.html", "19097665_2.html", "19097665_3.html", "30882239_2.html", "30415602_2.html", "30547388_2.html", "30547388_3.html"], ["30547388_4.html", "29159457_2.html", "25852208_2.html", "20228403_2.html", "20228403_3.html", "20228403_4.html", "20228402_2.html", "20228402_3.html", "20228402_4.html", "29790415_1.html"], ["29790415_2.html", "27502307_2.html", "29748996_1.html", "27742728_2.html", "27437883_2.html", "28035868_2.html", "27977392_2.html", "27977392_3.html", "25271206_2.html", "27684308_2.html"], ["23129601_2.html", "23963895_2.html", "27295427_2.html", "28854085_2.html", "29279300_2.html", "30566006_1.html", "30566006_2.html", "30586723_2.html", "30586723_3.html", "30418475_2.html"], ["21428766_2.html", "18094675_2.html", "18094675_3.html", "18094675_4.html", "18199798_2.html", "24206457_2.html", "26620248_2.html", "27406394_2.html", "25352655_2.html", "25352655_3.html"], ["28432746_1.html", "28432746_2.html", "28386990_1.html", "28386990_2.html", "28386990_3.html", "30218434_1.html", "30291013_2.html", "28263812_2.html", "29228101_2.html", "29148144_2.html"], ["28359411_2.html", "26475142_2.html", "24281137_3.html", "28402745_2.html", "27842179_2.html", "26915374_2.html", "26754626_3.html", "26541915_3.html", "26541915_5.html", "20487050_2.html"], ["26027630_2.html", "19660610_2.html", "27639753_2.html", "27639753_3.html", "27639753_4.html", "15781429_2.html", "17560879_1.html", "22913893_2.html", "21174145_2.html", "20953684_2.html"], ["27619750_2.html", "28844508_2.html", "28844508_3.html", "26330422_2.html", "28391886_2.html", "23040830_2.html", "15924587_2.html", "16709304_2.html", "16709304_3.html", "16709304_4.html"], ["29263150_2.html", "29263150_3.html", "28972004_1.html", "28972004_2.html", "28972004_3.html", "17022864_3.html", "30336824_2.html", "30336824_3.html", "17011942_2.html", "21815708_1.html"], ["21815708_2.html", "19423108_2.html", "19104004_3.html", "18172039_2.html", "18172039_3.html", "30415628_1.html", "28905478_1.html", "28905478_2.html", "28905478_3.html", "19139391_2.html"], ["16537662_2.html", "18498915_2.html", "18498915_3.html", "30175930_2.html", "25031188_2.html", "23733198_2.html", "23110471_1.html", "23110471_3.html", "20678674_2.html", "20469975_2.html"], ["18326958_2.html", "18615004_2.html", "18657652_2.html", "18375982_2.html", "15381674_2.html", "19751115_2.html", "26066644_1.html", "23307827_2.html", "19596014_3.html", "21933100_2.html"], ["24120253_3.html", "28877027_2.html", "26100349_2.html", "26100349_3.html", "21428765_2.html", "25045258_2.html", "23020650_2.html", "22177371_2.html", "26563670_2.html", "27616196_2.html"], ["27616196_3.html", "27616196_5.html", "23714653_2.html", "20185426_2.html", "18836213_2.html", "30290801_2.html", "30290801_3.html", "27215502_2.html", "30139780_2.html", "29409951_2.html"], ["29409951_3.html", "24966672_2.html", "28416587_2.html", "27767328_1.html", "27767328_2.html", "27767328_3.html", "27767328_4.html", "30587959_3.html", "30587959_4.html", "30587959_5.html"], ["30587959_6.html", "30584583_2.html", "30584583_3.html", "23471469_2.html", "23471469_3.html", "24156566_2.html", "25248764_2.html", "28278391_2.html", "27181606_2.html", "29925383_2.html"], ["17605774_2.html", "17605774_3.html", "27993292_2.html", "27993292_3.html", "26112656_3.html", "25573406_2.html", "19443528_2.html", "20685748_2.html", "25490706_2.html", "25736990_2.html"], ["28159511_2.html", "29782217_2.html", "29782217_3.html", "24383720_2.html", "26233481_2.html", "26233481_3.html", "26233481_4.html", "27609406_2.html", "22544891_2.html", "28395936_2.html"], ["27056586_2.html", "28848879_2.html", "28385353_2.html", "28385353_3.html", "28385353_4.html", "28385353_5.html", "28385353_6.html", "28385353_7.html", "24321804_2.html", "29429593_2.html"], ["23040786_1.html", "24253831_3.html", "24596459_2.html", "30053967_1.html", "30053967_2.html", "28720132_2.html", "28720132_3.html", "29713156_2.html", "29671280_2.html", "22259009_2.html"], ["27576774_2.html", "27046159_2.html", "26586780_2.html", "30354781_2.html", "23121439_2.html", "23121439_3.html", "25037988_2.html", "25037988_3.html", "24097439_2.html", "30166073_3.html"], ["15590586_2.html", "15590586_3.html", "15590586_4.html", "15998890_2.html", "15753114_2.html", "11442551_2.html", "25475110_2.html", "21673005_2.html", "18835953_2.html", "18339679_2.html"], ["24727254_3.html", "19332455_2.html", "26059896_1.html", "26059896_2.html", "26059896_3.html", "26059896_4.html", "20357382_2.html", "20357382_3.html", "19389561_2.html", "19389561_3.html"], ["20136164_1.html", "20136164_2.html", "20136164_3.html", "20136164_4.html", "20136164_5.html", "25670362_2.html", "25670362_3.html", "9892586_3.html", "9892586_4.html", "9841303_2.html"], ["23473396_2.html", "25161043_2.html", "15451146_2.html", "15337732_2.html", "27581531_2.html", "20400762_1.html", "24780614_2.html", "28844990_2.html", "18499565_2.html", "19850249_1.html"], ["19850249_2.html", "19850248_2.html", "19850248_3.html", "21060071_2.html", "25175921_2.html", "25175921_3.html", "16214597_2.html", "16214597_3.html", "16905022_2.html", "25775052_2.html"], ["25775052_3.html", "25775052_4.html", "25775052_5.html", "27043082_2.html", "26321103_2.html", "19332467_2.html", "20582594_2.html", "21545942_2.html", "26271059_2.html", "21780946_2.html"], ["24247616_2.html", "24247616_3.html", "15758000_2.html", "25523533_2.html", "24076283_2.html", "20200926_2.html", "27612281_4.html", "27612281_5.html", "27612281_6.html", "19776408_2.html"], ["28827011_2.html", "26486868_2.html", "16537663_2.html", "19717844_2.html", "19966341_2.html", "20194881_2.html", "20370912_2.html", "21147728_2.html", "21576658_2.html", "21576658_3.html"], ["22700854_2.html", "23271794_2.html", "23271794_3.html", "23770182_1.html", "23770182_2.html", "23770182_3.html", "23991658_2.html", "23991658_3.html", "24251359_2.html", "24842985_2.html"], ["26065986_2.html", "27358434_2.html", "27807306_2.html", "28302288_2.html", "28666993_2.html", "29248859_2.html", "30012318_3.html"]];
            ordered_docs_to_label = [["25277614_2.html", "30564451_2.html", "19560810_1.html", "18821708_3.html", "28405473_2.html", "22378566_2.html", "26097039_2.html", "26097039_3.html", "29880010_1.html", "30522501_1.html"], ["30165610_3.html", "30590387_2.html", "30590387_3.html", "29145215_2.html", "27289121_2.html", "29937267_2.html", "22686416_2.html", "24898834_2.html", "24898834_3.html", "23656980_2.html"], ["23564916_2.html", "28842165_2.html", "17878242_1.html", "28327140_2.html", "26373629_2.html", "26373629_3.html", "28666775_2.html", "28386035_2.html", "27299675_2.html", "30586757_3.html"], ["28910237_2.html", "28921862_3.html", "25795432_2.html", "25795432_3.html", "25592197_2.html", "26179619_2.html", "18539916_1.html", "27484756_2.html", "24067431_2.html", "29103664_2.html"], ["30882239_2.html", "30547388_2.html", "30547388_3.html", "30547388_4.html", "29159457_2.html", "20228403_2.html", "20228403_3.html", "20228403_4.html", "20228402_2.html", "20228402_3.html"], ["20228402_4.html", "29790415_1.html", "27437883_2.html", "25271206_2.html", "29279300_2.html", "30566006_1.html", "30418475_2.html", "18094675_4.html", "24206457_2.html", "28432746_2.html"], ["28386990_1.html", "30218434_1.html", "28263812_2.html", "29228101_2.html", "24281137_3.html", "26915374_2.html", "26754626_3.html", "26541915_3.html", "26541915_5.html", "20487050_2.html"], ["19660610_2.html", "27639753_4.html", "21174145_2.html", "20953684_2.html", "27619750_2.html", "17022864_3.html", "17011942_2.html", "21815708_1.html", "21815708_2.html", "19423108_2.html"], ["18172039_2.html", "28905478_1.html", "25031188_2.html", "23110471_1.html", "15381674_2.html", "23307827_2.html", "19596014_3.html", "24120253_3.html", "21428765_2.html", "26563670_2.html"], ["27616196_2.html", "27616196_3.html", "20185426_2.html", "30290801_3.html", "29409951_2.html", "29409951_3.html", "24966672_2.html", "27767328_1.html", "27767328_2.html", "27767328_3.html"], ["27767328_4.html", "30587959_3.html", "30587959_4.html", "30587959_6.html", "23471469_2.html", "24156566_2.html", "25248764_2.html", "28278391_2.html", "17605774_2.html", "17605774_3.html"], ["26112656_3.html", "19443528_2.html", "28159511_2.html", "22544891_2.html", "24321804_2.html", "29429593_2.html", "24253831_3.html", "30053967_2.html", "28720132_3.html", "15998890_2.html"], ["18339679_2.html", "26059896_1.html", "19389561_2.html", "25670362_2.html", "25670362_3.html", "23473396_2.html", "18499565_2.html", "19850249_1.html", "19332467_2.html", "20582594_2.html"], ["24247616_3.html", "19776408_2.html", "28827011_2.html", "26486868_2.html", "16537663_2.html", "22700854_2.html", "23271794_2.html", "23271794_3.html", "23991658_3.html", "24251359_2.html"], ["27807306_2.html", "28302288_2.html"]];
            exclude_pmids = ["19508464", "30659410", "30571562", "27576559", "12205648", "16139123", "26589819", "22747613", "27672117", "25135178", "29143919", "26524706", "22193143", "30465321", "16278257", "21332627", "27912982", "20723849", "28720336", "22084332", "20883926", "23812596", "11937179", "22396585", "19349325", "26093161", "18537526", "25681464", "28300867", "27046160", "30302940", "30851070", "28948656", "26523993", "17058629", "11104295", "22704916", "30191421", "27395349", "18676075", "22490878", "16801465", "29941478", "19001024", "29431256", "27039236", "22432932", "30203580", "19447387", "19716598", "12803733", "25765696", "20801495", "30882238", "19917888", "27609678", "23117723", "30354517", "28520924", "27796912", "18000186", "18370800", "22573644", "23279632", "25787199", "19688336", "26238672", "29406853", "29903515", "20436046", "20484828", "23501976", "27098404", "29777264", "21059484", "27387994", "15734614", "28679611", "22932716", "30566004", "29447769", "24323795", "25552421", "27493790", "16116047", "28231942", "19704100", "20707767", "27708114", "27267268", "30341453", "29661699", "20151997", "28924103", "25657183", "21723220", "21939839", "29307087", "30183102", "27589414", "28531241", "27448534", "27161178", "24742013", "28801539", "27207971", "20670726", "28213368", "27502866", "25758769", "17060377", "17065671", "17392541", "19793357", "24842697", "23219284", "20429821", "26934128", "21502969", "21680990", "22913890", "23672632", "30425195", "26039935", "30729456", "25354738", "29743836", "30200078", "29128192", "25406305", "23743976", "22248871", "26179767", "27600862", "27313282", "26704701", "27482610", "27354044", "12409542", "23529173", "20385930", "20418083", "29151034", "18259029", "26762525", "28939567", "26762481", "22470539", "28637881", "18813219", "28544533", "15811979", "29664406", "22799613", "17846352", "22509859", "26744025", "28689179", "25769357", "15103313", "26400827"];
            with_corrupted_text = allAnnotations.rows.reduce(function (acc, tab) {
              if (tab.corrupted_text.trim().length > 0 && tab.corrupted_text.trim() != 'undefined') {
                acc[tab.docid + "_" + tab.page + ".html"] = tab.corrupted_text;
              }

              return acc;
            }, {}); // var docs_w_issues = ordered_docs_to_label.flat().filter( tab => {return Object.keys(with_corrupted_text).indexOf(tab) > -1 } )
            //

            allLabelled = ["21128814_2", "12899584_1", "26446706_1", "25465417_2", "18972097_1", "27144849_1", "17304660_2", "10438259_2", "20484828_1", "19847908_2", "26792812_2", "21871706_2", "15851647_3", "22576673_2", "30734043_2", "27647847_2", "29685860_2", "15659722_2", "17984166_2", "12479763_1", "15051694_2", "15049402_2", "28473423_2", "24119319_2", "25681464_2", "15537681_2", "25792124_2", "23726159_2", "18398080_2", "29793629_2", "27589414_2", "18227370_4", "18757090_2", "19704100_2", "20801495_2", "20801500_2", "23564916_3", "17470434_2", "18227370_5", "19001508_2", "19717850_2", "20883926_2", "21216833_2", "22235820_2", "28968735_2", "17384437_1", "26699168_2", "19470885_2", "23992602_2", "21128814_3", "26491109_2", "27659566_2", "30371334_6", "12803733_2", "15998891_2", "25775052_3", "26338971_2", "23500237_2", "27659566_3", "16651474_1", "18676075_2", "29045207_2", "27046160_2", "18821708_2", "18537526_2", "15238590_1", "30586757_6", "20979470_3", "14724302_2", "27959607_2", "30352894_2", "12456232_2", "19336502_2", "27046162_2", "18753639_2", "26886418_2", "28382371_2", "21502549_2", "27576775_2", "28573499_2", "17456819_2", "29299340_2", "15883637_2", "10789664_1", "30586757_5", "27708114_2", "26135703_2", "21332630_2", "22305835_2", "28382371_3", "29409133_1", "19369667_2", "22335737_1", "27765312_2", "28573499_3", "28189475_2", "16380589_2", "16508926_3", "28844192_2", "28573499_4", "28801539_2", "30465321_3", "29941478_2", "28818881_2", "25046337_2", "30465321_4", "20707767_1", "8121459_2", "27418597_2", "24664227_2", "30465321_5", "23325525_1", "16508926_4", "28300867_2", "18753638_2", "28801539_3", "30865796_2", "25352655_3", "23216615_2", "28316279_2", "10438259_1", "12243636_1", "30830724_5", "29132879_2", "23473369_2", "12803733_5", "23735746_2", "15579515_2", "30586757_4", "26054553_2", "30696483_1", "15028365_1", "28968735_3", "12456232_3", "27190009_2", "30830724_6", "28882235_2", "16508926_5", "17097378_1", "26471380_2", "28882235_3", "29490509_2", "30591006_2", "23812596_2", "29406853_2", "19336502_3", "19409693_2", "29132879_3", "20136164_5", "29307087_2", "12205648_2", "25175921_2", "23451835_2", "30465321_2", "30882239_5", "30882239_4", "30851070_2", "30830724_4", "21642014_3", "22337213_2", "30465321_6", "22672586_2", "30882239_3", "17097378_2", "30609212_2", "23425163_2", "27612281_2", "20163842_2", "19567517_2", "27465265_2", "30696483_2", "27616196_4", "20436046_2", "17804843_2", "27144849_5", "17113426_2", "18753639_3", "20393175_3", "30851070_3", "27576559_2", "24839241_2", "28801539_4", "28902593_2", "30830724_3", "25354738_2", "29132879_4", "28801539_5", "17846352_2", "23425163_3", "23465037_2", "30882238_2", "30614616_2", "27612281_3", "28432746_1", "27672117_2", "19726772_2", "28847206_2", "29132880_2", "27935736_2", "17634458_2", "25698905_2", "17292766_3", "24184169_2", "20979470_2", "29937267_2", "20678878_2", "28246237_2", "27335114_2", "30654882_1", "19683639_2", "28467869_2", "28467869_3", "29028981_3", "28279891_2", "22443427_2", "27144849_2", "30667279_1", "29146124_2", "11527638_1", "18000186_2", "18757089_2", "28753486_3", "29431256_2", "25698905_3", "26400827_3", "12803733_4", "18227370_2", "22443427_3", "17292766_4", "20925544_2", "21545947_3", "22235820_3", "22396585_2", "22470539_2", "22490878_1", "22490878_2", "22490878_3", "24283598_2", "17398308_2", "24621834_2", "24716680_3", "11419425_2", "28975241_2", "26523993_2", "15659722_1", "20883926_3", "30525116_2", "19850525_2", "26523993_3", "17846352_3", "18227370_3", "19917888_2", "20801495_3", "17292766_5", "26653621_2", "20925544_3", "23529173_2", "30525116_3", "25773268_2", "29544870_2", "30525116_4", "29146124_3", "16714187_2", "22932716_2", "29544870_3", "25399274_2", "16533938_2", "29084736_2", "29544870_4", "22085343_1", "29685860_1", "27144849_4", "26151264_2", "26762525_2", "18032739_2", "25465416_2", "26762525_3", "20621900_2", "27313282_2", "19917888_3", "12601075_2", "23529173_3", "26052984_2", "17060377_2", "30609212_3", "30591006_3", "28118533_2", "15028365_2", "30729456_2", "26547918_2", "27589414_1", "26627989_2", "27639327_2", "29028981_2", "12803733_3", "16572114_2", "17259484_2", "16495392_2", "23964932_2", "21645018_2", "25728587_2", "19201775_2", "19596014_2", "25182247_2", "19447387_2", "28899222_2", "30248105_2", "30248105_3", "30248105_4", "30026335_2", "27144849_3", "19447387_3", "18674411_2", "24727258_2", "25728587_3", "30026335_3", "23128104_2", "17470824_2", "30352894_1", "20436046_3", "27767328_4", "29925383_2", "29671280_2", "18451347_2", "20393175_4", "21209123_2", "17065671_2", "14657064_2", "15851647_2", "12899584_2", "28753486_2", "18667204_2", "17060377_3", "29429593_2", "23307827_2", "25037988_2", "20357382_2", "28844990_2", "25775052_2", "24842697_3", "24842697_2", "25002161_2", "25176136_2", "25406305_2", "25455006_2", "23040786_1", "25637937_2", "26374849_2", "26475142_3", "26541915_2", "20393175_2", "27993292_2", "27767328_1", "25775052_4", "26754626_2", "25277614_2", "22259009_2", "21673005_2", "15590586_2", "24383720_2", "25037988_3", "25175921_3", "19336502_4", "24001888_2", "29263150_2", "27612281_4", "30290801_2", "19332455_2", "28544533_2", "28544533_3", "27965257_2", "30564451_2", "18823986_2", "17965424_2", "19560810_1", "15590586_3", "28153828_2", "30936738_2", "30936738_3", "30936738_4", "30936738_5", "16508926_6", "27744141_2", "27098404_1", "30341453_1", "30341453_2", "19917888app_1", "29463520_2", "30121827_3", "18821708_3", "26275429_2", "23501976_2", "23396280_2", "27893045_2", "27581531_2", "16905022_2", "26233481_2", "28237263_3", "23810874_2", "27028914_2", "25769357_3", "29145215_2", "30584583_2", "25775052_5", "15590586_4", "19125778_2", "29145215_3", "30146932_2", "22873530_2", "24253831_3", "26065986_2", "29880010_1", "19389561_3", "27616196_2", "26233481_3", "22193143_2", "30146931_2", "26586780_2", "16214597_2", "30191421_2", "22052584_2", "30146931_3", "25779603_2", "24339179_2", "26774608_2", "27033025_2", "27358434_2", "27993292_3", "28215362_2", "28520924_3", "26774608_3", "25670362_2", "23339726_2", "29556416_2", "28213368_2", "28689179_2", "28531241_2", "28520924_2", "29064626_2", "26093161_2", "29415145_1", "20400762_1", "28246236_2", "26132939_3", "26132939_2", "29415145_2", "26132939_4", "29248859_2", "25765696_3", "26744025_2", "23743976_2", "30012318_3", "23706759_2", "28237263_2", "27289121_2", "29556416_3", "25765696_2", "22913891_3", "20194881_2", "28605608_2", "24097439_2", "26233481_4", "27767328_2", "30587959_3", "11442551_2", "20370912_2", "23770182_1", "24596459_2", "24780614_2", "30584583_3", "26139005_2", "22913891_4", "21059484_2", "30871355_3", "22913891_5", "23770182_2", "30871355_4", "22913891_6", "21147728_2", "29526832_2", "21576658_2", "26373629_2", "24245566_2", "19596014_3", "24842985_2", "23473396_2", "29908670_1", "30587959_4", "18339679_2", "30053967_1", "21576658_3", "23564916_4", "29941478_1", "23770182_3", "27043082_2", "30587959_5", "28385353_4", "30166073_3", "16214597_3", "17878242_1", "30203580_2", "26373629_3", "23471469_3", "25475110_2", "28159511_2", "19850249_2", "28848879_2", "26378978_2", "26378978_3", "24918789_2", "26112656_3", "21933100_2", "25573406_2", "19688336_2", "30571562_3", "24120253_3", "30354781_2", "25670362_3", "23020650_2", "15998890_2", "26100349_2", "26321103_2", "22234149_2", "28842165_3", "28385353_2", "18539916_2", "28720132_2", "27215502_2", "28385353_3", "27609406_2", "25161043_2", "26059896_1", "26580237_2", "29777264_1", "27252787_2", "22084332_2", "28327140_2", "28904068_2", "27977934_2", "27612281_5", "28666775_2", "17765963_2", "19332467_2", "29782217_2", "15753114_2", "20685748_2", "9892586_3", "28910237_2", "27612281_6", "22369287_2", "28197834_2", "18223031_2", "18223031_3", "28666775_3", "23991658_2", "28386035_1", "26524706_2", "25795432_3", "26524706_3", "26681720_2", "30053967_2", "28278391_2", "22544891_2", "30415602_2", "21682834_2", "26358285_2", "19850248_2", "25758769_2", "25552421_2", "27484756_2", "19717844_2", "27576774_2", "26100349_3", "20582594_2", "27767328_3", "9892586_4", "25552421_3", "19966341_2", "24206457_2", "28905478_3", "28385353_5", "15451146_2", "28666993_2", "21332627_3", "21332627_2", "26620248_2", "27406394_2", "25352655_2", "28386990_1", "28386990_2", "28386990_3", "30218434_1", "28395936_2", "30566006_2", "30291013_2", "30354517_1", "30586723_2", "25045258_2", "19850248_3", "28263812_2", "30586723_3", "21428765_2", "19139391_2", "29664406_2", "29228101_2", "29148144_2", "28385353_6", "28359411_2", "26475142_2", "28948656_2", "21060071_2", "25490706_2", "28402745_2", "27842179_2", "27395349_3", "27354044_2", "26754626_3", "25189213_2", "22378566_2", "23909985_2", "23129601_2", "23963895_2", "29790415_2", "30547388_4", "27295427_2", "25189213_1", "29782217_3", "30139780_2", "27502307_2", "24247616_2", "29103664_2", "23992601_2", "21545942_2", "26121561_2", "29748996_1", "26059896_2", "23992601_3", "19097665_2", "24247616_3", "15758000_2", "24727254_3", "26271059_2", "25523533_2", "25736990_2", "29159457_2", "17980928_3", "25852208_2", "24076283_2", "27181606_2", "30474818_2", "27742728_2", "26027630_2", "28385353_7", "29766634_2", "28854085_2", "28844508_2", "19097665_3", "28035868_2", "28844508_3", "19443528_2", "27639753_3", "27977392_2", "26330422_2", "28905478_2", "9841303_2", "29790415_1", "29279300_2", "17560879_1", "30882239_2", "28720132_3", "23121439_2", "28391886_2", "28405473_2", "20200926_2", "22913893_2", "23040830_2", "29263150_3", "22177371_2", "27056586_2", "30547388_2", "27977392_3", "20953684_2", "30547388_3", "15924587_2", "27639753_2", "15781429_2", "16709304_2", "25271206_2", "21780946_2", "27684308_2", "16537662_2", "15337732_2", "18498915_2", "18498915_3", "21815708_2", "28972004_1", "20937671_2", "27046159_2", "20136164_2", "18835953_2", "19423108_2", "30175930_2", "18326958_2", "16709304_3", "20136164_1", "29713156_2", "16709304_4", "19104004_3", "18199798_2", "18615004_2", "21428766_2", "27616196_3", "28972004_2", "18094675_2", "20136164_3", "25031188_2", "23121439_3", "26059896_3", "26059896_4", "18172039_2", "18094675_3", "18657652_2", "28972004_3", "27616196_5", "18375982_2", "23733198_2", "18172039_3", "23110471_1", "17022864_3", "23110471_3", "24966672_2", "23714653_2", "20678674_2", "20469975_2", "30336824_2", "30336824_3", "26066644_1", "15381674_2", "28877027_2", "17011942_2", "19751115_2", "21815708_1", "20136164_4", "20357382_3", "18836213_2", "30415628_1", "28416587_2"];
            allLabelled = allLabelled.map(function (d) {
              return d + ".html";
            }); // debugger

            selected_group_docs = [];

            if (fgroup == "all" || fgroup.indexOf("all") > -1) {
              selected_group_docs = ordered_Splits.flat();
            } else {
              for (i in fgroup) {
                group_index = parseInt(fgroup[i]) - 1;
                selected_group_docs = (0, _toConsumableArray2.default)(selected_group_docs).concat((0, _toConsumableArray2.default)(ordered_Splits[group_index]));
              }
            }

            selected_label_docs = [];

            if (flgroup == "all" || flgroup.indexOf("all") > -1) {
              selected_label_docs = ordered_docs_to_label.flat();
            } else {
              for (i in flgroup) {
                label_index = parseInt(flgroup[i]) - 1;
                selected_label_docs = (0, _toConsumableArray2.default)(selected_label_docs).concat((0, _toConsumableArray2.default)(ordered_docs_to_label[label_index]));
              }
            }

            selected_group_docs = selected_group_docs.flat();
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
                var label_filters = flgroup; //var labelled = Object.keys(labellers);

                var unannotated = ordered_Splits; // debugger

                if (selected_group_docs.length > 0) {
                  DOCS = selected_group_docs;
                }

                if (selected_label_docs.length > 0) {
                  DOCS = selected_label_docs;
                } // debugger


                if (DOCS.length < 1) {
                  DOCS = items.sort(function (a, b) {
                    return fixVersionOrder(a).localeCompare(fixVersionOrder(b));
                  });
                } // DOCS = selected_group_docs.length > 0 ? selected_group_docs : DOCS;
                // DOCS
                // console.log(selected_group_docs)
                //


                DOCS = DOCS.sort(function (a, b) {
                  a = a.match(/([\w\W]*)_([0-9]*).html/);
                  b = b.match(/([\w\W]*)_([0-9]*).html/);
                  var st_a = {
                    docid: a[1],
                    page: a[2]
                  };
                  var st_b = {
                    docid: b[1],
                    page: b[2] // debugger

                  };
                  var dd = st_a.docid.localeCompare(st_b.docid);
                  return dd == 0 ? parseInt(st_a.page) - parseInt(st_b.page) : dd;
                }); // debugger

                DOCS = DOCS.reduce(function (acc, docfile) {
                  var file_parts = docfile.match(/([\w\W]*)_([0-9]*).html/);
                  var docid = file_parts[1];
                  var docid_V = file_parts[1];
                  var page = file_parts[2]; //debugger
                  // if ( docfile.indexOf("29937431") > -1 ){
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
                    var fileElements = docfile.match(/([\w\W]*)_([0-9]*).html/);
                    var docid = fileElements[1];
                    var page = fileElements[2]; //.split(".")[0]

                    var extension = ".html"; //fileElements[1].split(".")[1]

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
            _context50.next = 30;
            return results;

          case 30:
            return _context50.abrupt("return", _context50.sent);

          case 31:
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

function getAnnotationByID(_x6, _x7, _x8) {
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

function classify(_x9) {
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

function grouped_predictor(_x10) {
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

function attempt_predictions(_x11) {
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

              return function (_x127, _x128) {
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

function insertAnnotation(_x12, _x13, _x14, _x15, _x16, _x17, _x18) {
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

  return function (_x19, _x20) {
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

  return function (_x21, _x22) {
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

  return function (_x23, _x24) {
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

              return function modifyCUIData(_x27, _x28, _x29, _x30) {
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

  return function (_x25, _x26) {
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

              return function cuiDeleteIndex(_x33) {
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

  return function (_x31, _x32) {
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

              return function getCuiTables(_x36) {
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

  return function (_x34, _x35) {
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

              return function setMetadata(_x39, _x40, _x41) {
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

  return function (_x37, _x38) {
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

              return function setMetadata(_x44, _x45, _x46, _x47, _x48, _x49, _x50, _x51, _x52, _x53) {
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

  return function (_x42, _x43) {
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

              return function getMetadata(_x56, _x57, _x58) {
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

  return function (_x54, _x55) {
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

            if (!(req.query && (req.query.filter_topic || req.query.filter_type || req.query.hua || req.query.filter_group || req.query.filter_labelgroup))) {
              _context16.next = 14;
              break;
            }

            _context16.next = 7;
            return prepareAvailableDocuments(req.query.filter_topic ? req.query.filter_topic.split("_") : [], req.query.filter_type ? req.query.filter_type.split("_") : [], req.query.hua ? req.query.hua == "true" : false, req.query.filter_group ? req.query.filter_group.split("_") : [], req.query.filter_labelgroup ? req.query.filter_labelgroup.split("_") : []);

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

  return function (_x59, _x60) {
    return _ref16.apply(this, arguments);
  };
}());

function updateClusterAnnotation(_x61, _x62, _x63, _x64, _x65) {
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

  return function (_x66, _x67) {
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

  return function (_x68, _x69) {
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

  return function (_x70, _x71) {
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

  return function (_x72, _x73) {
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

  return function (_x74, _x75) {
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

              return function setCUIMod(_x78, _x79) {
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

  return function (_x76, _x77) {
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

  return function (_x80, _x81) {
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

              return function setClusterData(_x84, _x85, _x86, _x87, _x88) {
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

  return function (_x82, _x83) {
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

  return function (_x89, _x90) {
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

  return function (_x91, _x92) {
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

              return function insertCUI(_x95, _x96, _x97) {
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

  return function (_x93, _x94) {
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

  return function (_x98, _x99) {
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

  return function (_x100, _x101) {
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

  return function (_x102, _x103) {
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

function getMMatch(_x104) {
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

  return function (_x105, _x106) {
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
  // debugger
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

  return function (_x107, _x108) {
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

  return function (_x109, _x110) {
    return _ref42.apply(this, arguments);
  };
}());

function readyTableData(_x111, _x112, _x113) {
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
                      var tablePage, spaceRow, htmlHeader, findHeader, possible_tags_for_title, t, htmlHeaderText, actual_table, colum_with_numbers, styles, formattedPage, predictions, terms_matrix, preds_matrix, class_matrix, content_type_matrix, max_col, l, getTopDescriptors, cleanModifier, col_top_descriptors, c, content_types_in_column, unique_modifiers_in_column, u, unique_modifier, column_data, column_terms, k, allfreqs, all_terms, descriptors, row_top_descriptors, r, content_types_in_row, row_data, row_terms, predicted;
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

                              styles = actual_table.indexOf('<style type="text/css">.indent0') > -1 ? "" : "<style>" + data_ss + "</style>";
                              formattedPage = actual_table.indexOf("tr:hover" < 0) ? "<div>" + styles + actual_table + "</div>" : actual_table; // var formattedPage = "<div>"+actual_table+"</div>"

                              _context66.next = 35;
                              return attempt_predictions(actual_table);

                            case 35:
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
                                modifier = modifier ? modifier : ""; //prevent blow up

                                return modifier.replace("firstCol", "empty_row").replace("firstLastCol", "empty_row_with_p_value").replace("indent0", "indent").replace("indent1", "indent").replace("indent2", "indent").replace("indent3", "indent").replace("indent4", "indent").trim();
                              }; //Estimate column predictions.


                              col_top_descriptors = [];
                              c = 0;

                            case 46:
                              if (!(c < max_col)) {
                                _context66.next = 76;
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
                                _context66.next = 50;
                                break;
                              }

                              return _context66.abrupt("continue", 73);

                            case 50:
                              unique_modifiers_in_column = class_matrix.map(function (x) {
                                return x[c];
                              }).map(cleanModifier).filter(function (v, i, a) {
                                return a.indexOf(v) === i;
                              });
                              _context66.t3 = _regenerator.default.keys(unique_modifiers_in_column);

                            case 52:
                              if ((_context66.t4 = _context66.t3()).done) {
                                _context66.next = 73;
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
                                  if (word && word.length > 0) {
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
                              _context66.next = _context66.t5 === "grouped_predictor" ? 61 : 69;
                              break;

                            case 61:
                              all_terms = column_terms[unique_modifier] ? column_terms[unique_modifier].join(" ") : "";

                              if (!(column_terms[unique_modifier] && all_terms && column_terms[unique_modifier].length > 1 && all_terms.length > 0)) {
                                _context66.next = 68;
                                break;
                              }

                              _context66.next = 65;
                              return grouped_predictor(all_terms);

                            case 65:
                              descriptors = _context66.sent;
                              descriptors = descriptors[all_terms].split(";");
                              col_top_descriptors[col_top_descriptors.length] = {
                                descriptors: descriptors,
                                c: c,
                                unique_modifier: unique_modifier
                              };

                            case 68:
                              return _context66.abrupt("break", 71);

                            case 69:
                              descriptors = getTopDescriptors(3, column_data.freqs, ["arms", "undefined"]);
                              if (descriptors.length > 0) col_top_descriptors[col_top_descriptors.length] = {
                                descriptors: descriptors,
                                c: c,
                                unique_modifier: unique_modifier
                              };

                            case 71:
                              _context66.next = 52;
                              break;

                            case 73:
                              c++;
                              _context66.next = 46;
                              break;

                            case 76:
                              // Estimate row predictions
                              row_top_descriptors = []; // debugger

                              _context66.t6 = _regenerator.default.keys(preds_matrix);

                            case 78:
                              if ((_context66.t7 = _context66.t6()).done) {
                                _context66.next = 101;
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
                                _context66.next = 83;
                                break;
                              }

                              return _context66.abrupt("continue", 78);

                            case 83:
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
                              _context66.next = _context66.t8 === "grouped_predictor" ? 89 : 97;
                              break;

                            case 89:
                              all_terms = row_terms.join(" ");

                              if (!(row_terms.length > 1)) {
                                _context66.next = 96;
                                break;
                              }

                              _context66.next = 93;
                              return grouped_predictor(all_terms);

                            case 93:
                              descriptors = _context66.sent;
                              descriptors = descriptors[all_terms].split(";");
                              row_top_descriptors[row_top_descriptors.length] = {
                                descriptors: descriptors,
                                c: r,
                                unique_modifier: ""
                              };

                            case 96:
                              return _context66.abrupt("break", 99);

                            case 97:
                              descriptors = getTopDescriptors(3, row_data.freqs, ["undefined"]);
                              if (descriptors.length > 0) row_top_descriptors[row_top_descriptors.length] = {
                                descriptors: descriptors,
                                c: r,
                                unique_modifier: ""
                              };

                            case 99:
                              _context66.next = 78;
                              break;

                            case 101:
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

                            case 103:
                            case "end":
                              return _context66.stop();
                          }
                        }
                      }, _callee66, this, [[0, 7]]);
                    }));

                    return function (_x129, _x130) {
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

  return function (_x114, _x115) {
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

  return function (_x116, _x117) {
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

              return function deleteAnnotation(_x120, _x121, _x122) {
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

  return function (_x118, _x119) {
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

  return function (_x123, _x124) {
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

  return function (_x125, _x126) {
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