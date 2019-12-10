"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var csv = require('csv-parser');

var fs = require('fs');

var _require = require('pg'),
    Pool = _require.Pool,
    Client = _require.Client; // Postgres configuration.


var pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ihw_annotator',
  password: 'melacome86',
  port: 5432
});
var myArgs = process.argv.slice(2);
console.log('Importing Annotations CSV file into DB: ', myArgs[0]);
var AllData = {};
var ignorables = ["NA", "undefined"];

var dataAdder = function dataAdder(acc, item) {
  // "baseline_level_1"
  // "subgroup_name"
  // "characteristic_name"
  // "characteristic_level"
  // "baseline_level_2
  // "subgroup_level"
  if (ignorables.indexOf(item) < 0) {
    if (["baseline_level_1", "subgroup_name"].indexOf(item) > -1) {
      item = "characteristic_name";
    }

    if (["baseline_level_2", "subgroup_level"].indexOf(item) > -1) {
      item = "characteristic_level";
    }

    acc[item] = true;
  }

  return acc;
};

function insertAnnotation(_x, _x2, _x3, _x4, _x5, _x6, _x7) {
  return _insertAnnotation.apply(this, arguments);
}

function _insertAnnotation() {
  _insertAnnotation = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2(docid, page, user, annotation, corrupted, tableType, corrupted_text) {
    var client, done;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return pool.connect();

          case 2:
            client = _context2.sent;
            _context2.next = 5;
            return client.query('INSERT INTO annotations VALUES($1,$2,$3,$4,$5,$6,$7);', [docid, page, user, annotation, corrupted, tableType, corrupted_text]).then(function (result) {
              return console.log("insert: " + result);
            }).catch(function (e) {
              return console.error(e.stack);
            }).then(function () {
              return client.release();
            });

          case 5:
            done = _context2.sent;

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return _insertAnnotation.apply(this, arguments);
}

fs.createReadStream(myArgs[0]).pipe(csv({
  separator: ';'
})).on('data', function (data) {
  var currentData = AllData[data.user + "_" + data.docid + "_" + data.page];

  if (!currentData) {
    currentData = {
      docid: data.docid,
      user: data.user,
      page: data.page,
      annotation: [],
      corrupted: false,
      tableType: data.tableType,
      corrupted_text: ignorables.indexOf(data.corrupted_text) > -1 ? "" : data.corrupted_text
    };
  } // "baseline_level_1"
  // "baseline_level_2
  // "characteristic_name"
  // "characteristic_level"
  // "subgroup_name"
  // "subgroup_level"
  // "arms"
  // "time/period"
  // "measures"
  // "other"
  // "p-interaction"
  // "outcomes"


  currentData.annotation.push({
    location: data.location,
    content: data.content.split(";").reduce(function (acc, item) {
      return dataAdder(acc, item);
    }, {}),
    qualifiers: data.qualifiers.split(";").reduce(function (acc, item) {
      return dataAdder(acc, item);
    }, {}),
    number: data.number
  });
  console.log(JSON.stringify(currentData));
  AllData[data.user + "_" + data.docid + "_" + data.page] = currentData;
}).on('end',
/*#__PURE__*/
(0, _asyncToGenerator2.default)(
/*#__PURE__*/
_regenerator.default.mark(function _callee() {
  var keys, i, key, currentDoc;
  return _regenerator.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log(AllData);
          keys = Object.keys(AllData);
          i = 0;

        case 3:
          if (!(i < keys.length)) {
            _context.next = 12;
            break;
          }

          key = keys[i];
          currentDoc = AllData[key];
          _context.next = 8;
          return insertAnnotation(currentDoc.docid, currentDoc.page, currentDoc.user, {
            "annotations": currentDoc.annotation
          }, currentDoc.corrupted, currentDoc.tableType, currentDoc.corrupted_text);

        case 8:
          console.log("inserted " + i + "/" + keys.length);

        case 9:
          i++;
          _context.next = 3;
          break;

        case 12:
          console.log("done");

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, this);
})));