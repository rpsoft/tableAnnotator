"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var fs = require('fs');

var request = require("request");

var csv = require('csv-parser');

var clusterTerms = {};
var cui_freqs = {};
Object.defineProperty(Array.prototype, 'flat', {
  value: function value() {
    var depth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    return this.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) && depth > 1 ? toFlatten.flat(depth - 1) : toFlatten);
    }, []);
  }
});

function getMMatch(_x) {
  return _getMMatch.apply(this, arguments);
}

function _getMMatch() {
  _getMMatch = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2(phrase) {
    var result;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            //console.log("LOOKING FOR: "+ phrase)
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
            return _context2.abrupt("return", result);

          case 2:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return _getMMatch.apply(this, arguments);
}

function extractMMData(r) {
  try {
    r = JSON.parse(r);
    debugger;
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

fs.createReadStream('./CLUSTERS/all_terms_June_2019.csv').pipe(csv()).on('data',
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(row) {
    var terms;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            terms = row.terms;
            clusterTerms[terms] = true;

          case 2:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x2) {
    return _ref.apply(this, arguments);
  };
}()).on('end', function () {
  clusterTerms = Object.keys(clusterTerms);
  console.log('read ' + clusterTerms.length + ' terms');
  getCUIS();
});

function getCUIS() {
  return _getCUIS.apply(this, arguments);
}

function _getCUIS() {
  _getCUIS = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3() {
    var csvWriter, indexWriter, CUIs, i, phrase, phrase_terms, mmdata, search_terms, mmdata_inter, csvLine, freqWriter;
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            csvWriter = fs.createWriteStream('CLUSTERS/cuis.csv', {
              flags: 'w'
            });
            csvWriter.write("terms\n");
            indexWriter = fs.createWriteStream('CLUSTERS/cuis-index.csv', {
              flags: 'w'
            });
            indexWriter.write("CUI,preferred,hasMSH\n");
            CUIs = [];
            i = 0;

          case 6:
            if (!(i < clusterTerms.length)) {
              _context3.next = 39;
              break;
            }

            phrase = clusterTerms[i];
            phrase = phrase.toLowerCase().replace(/\$nmbr\$/g, " ").replace(/[\W_]+/g, " "); // this nmbr to avoid the "gene problem"

            phrase_terms = phrase.split(" ");
            mmdata = [];

            if (!(phrase_terms.length > 25)) {
              _context3.next = 29;
              break;
            }

          case 12:
            if (!(phrase_terms.length >= 10)) {
              _context3.next = 21;
              break;
            }

            search_terms = phrase_terms.splice(0, 10);
            _context3.next = 16;
            return getMMatch(search_terms.join(" "));

          case 16:
            mmdata_inter = _context3.sent;
            mmdata_inter = extractMMData(mmdata_inter);
            mmdata = mmdata.concat(mmdata_inter);
            _context3.next = 12;
            break;

          case 21:
            if (!(phrase_terms.length > 0)) {
              _context3.next = 27;
              break;
            }

            _context3.next = 24;
            return getMMatch(phrase_terms.join(" "));

          case 24:
            mmdata_inter = _context3.sent;
            mmdata_inter = extractMMData(mmdata_inter);
            mmdata = mmdata.concat(mmdata_inter);

          case 27:
            _context3.next = 33;
            break;

          case 29:
            _context3.next = 31;
            return getMMatch(phrase);

          case 31:
            mmdata = _context3.sent;
            mmdata = extractMMData(mmdata);

          case 33:
            csvLine = clusterTerms[i].replace(/;/gi, "").replace(/,/gi, "") + "," + mmdata.map(function (c) {
              if (CUIs.indexOf(c.CUI) < 0) {
                CUIs.push(c.CUI);
                indexWriter.write(c.CUI + "," + c.preferred + "," + c.hasMSH + "\n");
              }

              if (cui_freqs[c.CUI]) {
                cui_freqs[c.CUI] = cui_freqs[c.CUI] + 1;
              } else {
                cui_freqs[c.CUI] = 1;
              }

              return c.CUI;
            }).join(";") + "," + mmdata.map(function (c) {
              return c.hasMSH;
            }).join(";") + "," + i + "/" + clusterTerms.length;
            csvWriter.write(csvLine + "\n");
            console.log(i + 1 + "/" + clusterTerms.length + " -- " + clusterTerms[i]);

          case 36:
            i++;
            _context3.next = 6;
            break;

          case 39:
            csvWriter.end();
            indexWriter.end();
            freqWriter = fs.createWriteStream('CLUSTERS/cuis-freqs.csv', {
              flags: 'w'
            });
            freqWriter.write("CUI,freq\n");
            Object.keys(cui_freqs).map(function (c) {
              return freqWriter.write(c + "," + cui_freqs[c] + "\n");
            });
            freqWriter.end();
            console.log("finished");

          case 46:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));
  return _getCUIS.apply(this, arguments);
}