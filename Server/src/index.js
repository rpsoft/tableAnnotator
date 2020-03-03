var express = require('express');
var app = express();

var bodyParser = require('body-parser');

var html = require("html");
var fs = require('fs');
var request = require("request");
const cheerio = require('cheerio');
const { Pool, Client, Query } = require('pg')

const csv = require('csv-parser');
const CsvReadableStream = require('csv-reader');

const fs = require('fs');

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}
var cors = require('cors');

// var whitelist = ['http://sephirhome.ddns.net:7532', 'http://sephirhome.ddns.net:7531','http://localhost:7531']

app.use(cors());

// var corsOptions = {
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
app.use(cors("*"));

// import {PythonShell} from 'python-shell';
app.use(express.static(__dirname + '/domainParserviews'));
//Store all HTML files in view folder.
app.use(express.static(__dirname + '/views'));
//Store all JS and CSS in Scripts folder.
app.use(express.static(__dirname + '/dist'));

app.use(express.static(__dirname + '/images'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

import {PORT} from "./config"
import {TITLES} from "./titles"

var titles_obj = {}

Object.defineProperty(Array.prototype, 'flat', {
    value: function(depth = 1) {
      return this.reduce(function (flat, toFlatten) {
        return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
      }, []);
    }
});

for ( var t in TITLES) {
  titles_obj[TITLES[t].pmid.split(" ")[0]] = { title: TITLES[t].title, abstract: TITLES[t].abstract }
}

var ops_counter = 0;
var available_documents = {}
var abs_index = []
var tables_folder = "HTML_TABLES"
var tables_folder_deleted = "HTML_TABLES_DELETED"
var cssFolder = "HTML_STYLES"
var DOCS = [];

var clusterTerms = {}

var msh_categories_csv = [];
var msh_categories = {}

fs.createReadStream('pmid_msh_label.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (data) => msh_categories_csv.push(data))
  .on('end', () => {

    var catIndex = msh_categories_csv.reduce(function (acc, item) {
                    acc[item.mesh_broad_label] = item.pmid.split("&");
                    return acc;
                  }, {});

    var pmids_w_cat = msh_categories_csv.reduce(function (acc, item) {
                   var pmids = item.pmid.split("&")
                   acc = [...acc,pmids]
                   return acc;
                 }, []).flat();

     var allcats = Object.keys(catIndex)

         allcats.push("NA")
         catIndex["NA"] = []
     msh_categories = {catIndex: catIndex, allcats: allcats, pmids_w_cat}
  });

async function CUIData (){

    var semtypes = new Promise( (resolve,reject) =>{

        let inputStream = fs.createReadStream('cui_def.csv', 'utf8');

        var result = {};

        inputStream
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, skipHeader: true }))
            .on('data', function (row) {
                //console.log('A row arrived: ', row);
                row[4].split(";").map( st => {
                    result[st] = result[st] ? result[st]+1 : 1
                })

            })
            .on('end', function (data) {
                resolve(result);
            });
    })

    semtypes = await semtypes

    var cui_def = new Promise( (resolve,reject) =>{

        let inputStream = fs.createReadStream('cui_def.csv', 'utf8');

        var result = {};

        inputStream
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, skipHeader: true }))
            .on('data', function (row) {
                //console.log('A row arrived: ', row);
                result[row[0]] = {"matchedText": row[1], "preferred": row[2], "hasMSH":row[3], "semTypes":row[4]}
            })
            .on('end', function (data) {
                resolve(result);
            });
    })

    cui_def = await cui_def


    var cui_concept = new Promise( (resolve,reject) =>{

        let inputStream = fs.createReadStream('cui_concept.csv', 'utf8');

        var result = {};

        inputStream
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, skipHeader: true }))
            .on('data', function (row) {
                //console.log('A row arrived: ', row);
                result[row[0]] = row[1]
            })
            .on('end', function (data) {
                resolve(result);
            });
    })

    cui_concept = await cui_concept

    var actual_results = new Promise( (resolve,reject) =>{

            let inputStream = fs.createReadStream('Feb2020_allresults.csv', 'utf8');

            var result = {};

            inputStream
                .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, skipHeader: true }))
                .on('data', function (row) {

                    var currentItem = result[row[1]+"_"+row[2]] || {}

                    // Only want one version of the annotations. There should be only one. If not, clean it up! As we have no automatic way to determine which one is best.
                    if ( (currentItem["user"] && currentItem["user"].length > 0) && (currentItem["user"] !== row[0])){
                       currentItem = {}
                    }

                    currentItem["user"] = row[0]

                    currentItem["minPos"] = currentItem["minPos"] && currentItem["minPos"] < row[6] ? currentItem["minPos"] : row[6]


                    var currentLoc = currentItem[row[5]] ? currentItem[row[5]] : {}

                    currentLoc[row[6]] = { descriptors: row[7], modifier: row[8] }

                    currentItem[row[5]] = currentLoc

                    result[row[1]+"_"+row[2]] = currentItem

                })
                .on('end', function (data) {
                    resolve(result);
                });
        })

    actual_results = await actual_results

    return { cui_def, cui_concept, actual_results, semtypes }
}

function extractMMData (r) {
  try{
    r = JSON.parse(r)
    r = r.AllDocuments[0].Document.Utterances.map(
                    utterances => utterances.Phrases.map(
                      phrases => phrases.Mappings.map(
                        mappings => mappings.MappingCandidates.map(
                          candidate => ({
                                    CUI:candidate.CandidateCUI,
                                    matchedText: candidate.CandidateMatched,
                                    preferred: candidate.CandidatePreferred,
                                    hasMSH: candidate.Sources.indexOf("MSH") > -1
                                 })
                               )
                             )
                           )
                         ).flat().flat().flat()

    // This removes duplicate cuis
    r = r.reduce( (acc,el) => {if ( acc.cuis.indexOf(el.CUI) < 0 ){acc.cuis.push(el.CUI); acc.data.push(el)}; return acc }, {cuis: [], data: []} ).data
    return r
  } catch (e){
    return []
  }
}

var METHOD = "grouped_predictor"

// Postgres configuration.
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ihw_annotator',
    password: 'melacome86',
    port: 5432,
  })

//NODE R CONFIGURATION.
const R = require("r-script");

//Important to use this function for all text extracted from the tables.
function prepare_cell_text(text){
    return text.replace(/([^A-z0-9 ])/g, " $1 ").replace(/[0-9]+/g, ' $nmbr$ ').replace(/ +/g," ").trim().toLowerCase()
}

async function prepareAvailableDocuments(filter_topic, filter_type, hua, filter_group, filter_labelgroup){

  // debugger

  var ftop = filter_topic ? filter_topic : []
  var ftyp = filter_type ? filter_type : []
  var fgroup = filter_group ? filter_group : []
  var flgroup = filter_labelgroup ? filter_labelgroup : []

  var hua = hua

  var type_lookup = {
         "Baseline Characteristics" : "baseline_table",
         "Results with subgroups" : "result_table_subgroup",
         "Results without subgroups" : "result_table_without_subgroup",
         "Other" : "other_table",
         "Unassigned" : "NA"
       }

  for ( var i = 0; i < ftyp.length; i++){
      ftyp[i] = type_lookup[ftyp[i]]
  }

  var filtered_docs_ttype = []

  var allAnnotations = await getAnnotationResults()

  var all_annotated_docids = Array.from(new Set(allAnnotations.rows.reduce( (acc,ann) => {
      acc = acc ? acc : []

      acc.push(ann.docid+"_"+ann.page);

      return acc
    }, [] )))


  if( ftop.length+ftyp.length > 0 ){

      filtered_docs_ttype = allAnnotations.rows.reduce( (acc,ann) => {
    			acc = acc ? acc : []

    			if ( ann.tableType != "" && ftyp.indexOf(ann.tableType) > -1 ){
            	acc.push(ann.docid+"_"+ann.page);
          }

    			return acc
    		}, [] )

        filtered_docs_ttype = Array.from(new Set(filtered_docs_ttype));
  }

  var ordered_Splits = [["30936738_1.html","30936738_2.html","30936738_3.html","30936738_4.html","30936738_5.html","16508926_6.html","27744141_2.html","27098404_1.html","30341453_1.html","30341453_2.html"],["16495392fig_2.html","24907147_2.html","24907147_3.html","24907147_4.html","24907147_5.html","27502582_2.html","30473179_3.html","25047021_1.html","27165179_2.html","29338762_2.html"],["27493790_2.html","29299340_2.html","30696483_2.html","29409133_1.html","28968735_2.html","28968735_3.html","29045207_2.html","29685860fig_1.html","20484828_2.html","26589819_1.html"],["19515181_2.html","25414932_1.html","26833744_2.html","26833744_3.html","30287422_2.html","29937431_2.html","25881510_2.html","25772548_2.html","29941478fig_1.html","30425095_1.html"],["30425095b_1.html","27161178_2.html","30609212_1.html","30609212_2.html","19210140_2.html","26579834_1.html","26579834_5.html","26580237_3.html","27299675_1.html","29777264fig_1.html"],["30393950_2.html","19614946_2.html","19614946_3.html","26934128_2.html","30614616_1.html","30571562_2.html","26786577_2.html","18284434_2.html","22672586_2.html","30851070_1.html"],["30830724_1.html","30830724_2.html","25468945_2.html","25629790_2.html","30882238_1.html","19508464_1.html","19508464_2.html","30566006fig_1.html","30566004_2.html","30392095_2.html"],["19650752_2.html","30953107_1.html","30953107_2.html","21545947fig_2.html","19917888app_1.html","19917888fig_2.html","17384437fig_1.html","9036306_1.html","18371559_1.html","27395349_2.html"],["27354044_3.html","26541915_6.html","26027630fig_1.html","30183102fig_1.html","15639688_2.html","17560879_2.html","27619750_3.html","24411003_1.html","25743173_2.html","25743173_3.html"],["19166691_2.html","27956003_2.html","27846344fig_2.html","25135178_2.html","25282519_2.html","19190658_2.html","20670726_2.html","22747613_2.html","22747613_3.html","21925996_2.html"],["21925996_3.html","21925996_4.html","24067881_2.html","22504093_2.html","30203005_2.html","29857145_3.html","29857145_4.html","29857145_5.html","29857145_6.html","29857145_7.html"],["21723220_1.html","21723220_2.html","21723220_3.html","16267322_2.html","22704916_2.html","17634459_2.html","20491747_2.html","29909019_2.html","29797519_1.html","24120253_4.html"],["20429821_2.html","20429821_3.html","20429821_4.html","21227674_2.html","20463178_2.html","27609408_2.html","24966672_3.html","30815468_1.html","30815468_2.html","30815468_3.html"],["27087007_1.html","27316465_2.html","27316465_3.html","27316465_4.html","27316465_5.html","27215749_3.html","27715335_2.html","18511702_2.html","21627828_2.html","21627828_3.html"],["27039236_2.html","21586508_2.html","28558833_2.html","28558833_3.html","29413502_2.html","21875546_2.html","23040786_2.html","28903864_2.html","30053967fig_1.html","20925534_2.html"],["20925534_3.html","29073947_2.html","26994121_2.html","25787199_2.html","24727254_2.html","26059896fig_2.html","20385930fig_2.html","19389561fig_2.html","21816478_2.html","7997016_1.html"],["9603532_1.html","9848888_2.html","18479744_2.html","24780614_3.html","17244641_2.html","26630143_2.html","26304934_2.html","19915221_2.html","8950879_1.html","30659410_1.html"],["30659410_2.html","30659410_3.html","30465321_2.html","30465321_3.html","30465321_4.html","30465321_5.html","30465321_6.html","26547918_2.html","22316106_2.html","22436129_2.html"],["22709460_2.html","23564919_2.html","23683134_2.html","24251359_3.html","26093161_1.html","26578849_2.html","27103795_1.html","27207971_1.html","27387994_1.html","27496855_1.html"]];

  var labellers = {"23529173_3":"lili","15851647_2":"David","30729456_2":"David","17113426_2":"David","12205648_2":"David","28882235_2":"lili","16508926_4":"David","28818881_2":"David","20801500_2":"lili","30882239_3":null,"30352894_1":"Elaine","30525116_2":"lili","18032739_2":"lili","19001508_2":"lili","26627989_2":"David","19917888_2":"lili","30830724_5":null,"26151264_2":"lili","17846352_2":"lili","15659722_1":"lili","21209123_2":"Elaine","15851647_3":"Vicky","11527638_1":"lili","29028981_3":"Elaine","17097378_1":"Elaine","11419425_2":"lili","27465265_2":"lili","29299340_2":"Elaine","15659722_2":"lili","23735746_2":"Elaine ","26541915_2":"lili","29146124_3":"lili","18757089_2":"lili","30248105_3":"David","8121459_2":"lili","20979470_3":"David","16380589_2":"David","28382371_2":"lili","30591006_2":null,"19717850_2":"lili","24842697_3":"lili","30609212_3":null,"22235820_3":"lili","29132880_2":"lili","17804843_2":"David","20621900_2":"lili","19683639_2":"lili","15238590_1":null,"30525116_4":"lili","23465037_2":"Elaine","17470434_2":"David","21332630_2":"Elaine","27576775_2":"lili","19336502_2":"David","30830724_3":null,"23992602_2":null,"20801495_2":"lili","17456819_2":null,"20393175_3":"Elaine","21128814_3":"lili","23964932_2":"Elaine","25681464_2":"lili","29544870_2":"lili","20883926_2":"lili","28882235_3":"lili","25465416_2":"lili","12899584_2":"David","28316279_2":"lili","28847206_2":"lili","27313282_2":"lili","28801539_3":"lili","29544870_4":"lili","18451347_2":"David","25046337_2":"David","12803733_2":"Elaine","19409693_2":"Elaine","28118533_2":"David","17292766_4":"David","29406853_2":"lili","30026335_2":"Elaine","18227370_2":"lili","17846352_3":"lili","28902593_2":"lili","12479763_1":null,"30830724_4":null,"25465417_2":"lili","24621834_2":"lili","27144849_2":"David","30614616_2":null,"14657064_2":"David","22443427_2":"lili","22443427_3":"lili","23425163_2":"lili","18972097_1":"lili","16508926_3":"David","15051694_2":null,"23216615_2":"lili","23500237_2":"lili","23726159_2":"lili","30696483_1":"Elaine","26491109_2":"lili","25728587_3":"Elaine","22490878_3":"lili","25698905_2":"lili","21216833_2":"lili","19850525_2":"lili","24842697_2":"lili","12803733_3":"Elaine","26054553_2":"David","28899222_2":"Elaine","24283598_2":"lili","17060377_3":"lili","21642014_3":"Elaine","28573499_3":"lili","26653621_2":"lili","29685860_2":"lili","22490878_1":"lili","30525116_3":"lili","27612281_2":"Elaine","12803733_5":"Elaine","23812596_2":"Elaine","20163842_2":"Elaine","30654882_1":"lili","27659566_3":"lili","26475142_3":"lili","30882239_5":null,"20925544_3":"lili","30586757_4":null,"29132879_4":"lili","26762525_2":"lili","21645018_2":"Elaine","20393175_4":"Elaine","18753638_2":"lili","22490878_2":"lili","28801539_4":"lili","19336502_3":"David","30371334_6":"lili","17398308_2":"David","29132879_3":"lili","27765312_2":"lili","29146124_2":"lili","28189475_2":"lili","28801539_2":"lili","10438259_1":"David","18227370_5":"lili","24716680_3":"lili","26762525_3":"lili","27935736_2":"lili","28467869_3":"Elaine","22085343_1":"lili","30734043_2":"lili","21871706_2":"Elaine","25182247_2":"David","18753639_3":"lili","30248105_2":"David","19447387_3":"David","27144849_4":"David","26446706_1":"lili","23529173_2":"lili","20801495_3":"lili","26052984_2":"David","12456232_2":"David","25792124_2":"lili","30465321_3":"Elaine","30026335_3":"Elaine","18674411_2":"David","19596014_2":"Elaine","26754626_2":"lili","27589414_2":"David","29544870_3":"lili","28473423_2":"Elaine","18227370_3":"lili","26471380_2":"lili","10438259_2":"David","27708114_2":"David","18667204_2":"David","30586757_6":null,"30865796_2":"lili","24664227_2":"Elaine","29028981_2":"Elaine","25728587_2":"Elaine","15028365_1":"Vicky","28246237_2":"lili","15998891_2":"Elaine","27672117_2":"David","30830724_6":null,"30882238_2":null,"28573499_2":"lili","21545947_3":"lili","19470885_2":"David","29685860_1":"lili","17304660_2":"David","20393175_2":"Elaine","19704100_2":"lili","16572114_2":"Elaine","27616196_4":null,"27959607_2":"Elaine","25002161_2":"lili","10789664_1":"David","29793629_2":"lili","19369667_2":"David","19847908_2":"David","17065671_2":"Elaine","27335114_2":"lili","18753639_2":"lili","27612281_3":"Elaine","17470824_2":"Elaine","26699168_2":"David","22396585_2":"lili","26792812_2":"Elaine","22337213_2":"lili","29307087_2":"David","27190009_2":"Elaine","20883926_3":"lili","17984166_2":"lili","25399274_2":"David","15579515_2":"David","25406305_2":"lili","26547918_2":"Elaine","26135703_2":"Elaine","20979470_2":"David","27144849_3":"David","27647847_2":"lili","29045207_2":"Elaine","17259484_2":"David","26338971_2":"lili","21128814_2":"lili","18676075_2":"lili","28382371_3":"lili","26523993_2":"lili","27418597_2":"lili","18398080_2":"lili","25354738_2":"Elaine","28968735_3":"Elaine","20484828_1":"David","29132879_2":"lili","23451835_2":"lili","23128104_2":"David","14724302_2":"David","20436046_3":"David","24184169_2":"lili","25176136_2":"lili","17292766_5":"David","26523993_3":"lili","16508926_5":"David","12456232_3":"David","22470539_2":"lili","25773268_2":"lili","16533938_2":"lili","30465321_2":"Elaine","26886418_2":"lili","19201775_2":"Elaine","24727258_2":"lili","30696483_2":"Elaine","27589414_1":"David","27576559_2":"Elaine","27144849_1":"David","12601075_2":"David","22235820_2":"lili","15028365_2":"Vicky","30586757_5":null,"18537526_2":"lili","30609212_2":null,"25637937_2":"lili","28279891_2":"lili","28801539_5":"lili","24839241_2":"Elaine","22932716_2":"lili","27046162_2":"lili","19447387_2":"David","30591006_3":null,"30465321_4":"Elaine","17634458_2":"Elaine","30667279_1":"lili","30352894_2":"Elaine ","27144849_5":"David","18000186_2":"lili","28844192_2":"lili","30248105_4":"David","30882239_4":null,"23473369_2":"lili","25698905_3":"lili","29084736_2":"lili","28300867_2":"lili","20707767_1":"Vicky","18821708_2":"David","18227370_4":"lili","30465321_5":"Elaine","24119319_2":"Elaine","19726772_2":"lili","17384437_1":null,"22335737_1":"lili","16495392_2":"David","16714187_2":"lili","28968735_2":"Elaine","28467869_2":"Elaine","19917888_3":"lili","12803733_4":"Elaine","17097378_2":"Elaine","21502549_2":"lili","26400827_3":"lili","20678878_2":"lili","18757090_2":"lili","30851070_2":null,"28975241_2":"lili","16651474_1":"lili","22576673_2":"lili","17292766_3":"David","17060377_2":"lili","22672586_2":null,"30465321_6":"Elaine","20436046_2":"David","27639327_2":"Elaine","15883637_2":"Elaine","29409133_1":"Elaine","23425163_3":"lili","20925544_2":"lili","15049402_2":"David","12243636_1":null,"12899584_1":null,"19567517_2":"Elaine","26374849_2":"lili","27046160_2":"lili","29490509_2":"Elaine","28573499_4":"lili","25455006_2":"lili","22305835_2":"lili","30851070_3":null,"15537681_2":"lili","23325525_1":"David","27659566_2":"lili"};


  var ordered_docs_to_label = [["25277614_2.html","19336502_4.html","24001888_2.html","28544533_2.html","28544533_3.html","27965257_2.html","30564451_2.html","18823986_2.html","17965424_2.html","19560810_1.html"],["29463520_2.html","30121827_3.html","18821708_3.html","26238672_1.html","26238672_2.html","20937671_2.html","28405473_2.html","28153828_2.html","26139005_2.html","29908670_1.html"],["26275429_2.html","22873530_2.html","22052584_2.html","25779603_2.html","22378566_2.html","28215362_2.html","26097039_2.html","26097039_3.html","29415145_1.html","29415145_2.html"],["27028914_2.html","30191421_2.html","24339179_2.html","29556416_2.html","29556416_3.html","29880010_1.html","30522501_1.html","30871355_3.html","30871355_4.html","24245566_2.html"],["23501976_2.html","23396280_2.html","30165610_3.html","23810874_2.html","30146932_2.html","30146931_2.html","30146931_3.html","30590387_2.html","30590387_3.html","28531241_2.html"],["27893045_2.html","19001024_1.html","19125778_2.html","27033025_2.html","23339726_2.html","26132939_2.html","26132939_3.html","26132939_4.html","26744025_2.html","28237263_2.html"],["28237263_3.html","29145215_2.html","29145215_3.html","22193143_2.html","26774608_2.html","26774608_3.html","29064626_2.html","28246236_2.html","27289121_2.html","25765696_2.html"],["25765696_3.html","23706759_2.html","28753486_2.html","28753486_3.html","28605608_2.html","29941478_1.html","29941478_2.html","29937267_2.html","29526832_2.html","22686416_2.html"],["26681720_2.html","24898834_2.html","24898834_3.html","23656980_2.html","23564916_2.html","23564916_3.html","23564916_4.html","30203580_2.html","28842165_2.html","28842165_3.html"],["22913891_3.html","22913891_4.html","22913891_5.html","22913891_6.html","17878242_1.html","22234149_2.html","27252787_2.html","28327140_2.html","27977934_2.html","28197834_2.html"],["26373629_2.html","26373629_3.html","24918789_2.html","26580237_2.html","28904068_2.html","28666775_2.html","28666775_3.html","28386035_1.html","28386035_2.html","27299675_2.html"],["26378978_2.html","26378978_3.html","30586757_3.html","29777264_1.html","28910237_2.html","18223031_2.html","18223031_3.html","28921862_3.html","25795432_2.html","25795432_3.html"],["25592197_2.html","26179619_2.html","19688336_2.html","18539916_1.html","18539916_2.html","17765963_2.html","30571562_3.html","22369287_2.html","26524706_2.html","26524706_3.html"],["26358285_2.html","25758769_2.html","25552421_2.html","25552421_3.html","25189213_1.html","25189213_2.html","23992601_2.html","23992601_3.html","17980928_3.html","30474818_2.html"],["29766634_2.html","21682834_2.html","27484756_2.html","23909985_2.html","24067431_2.html","29103664_2.html","26121561_2.html","22509859_1.html","19097665_2.html","19097665_3.html"],["30882239_2.html","30415602_2.html","30547388_2.html","30547388_3.html","30547388_4.html","29159457_2.html","25852208_2.html","20228403_2.html","20228403_3.html","20228403_4.html"],["20228402_2.html","20228402_3.html","20228402_4.html","29790415_1.html","29790415_2.html","27502307_2.html","29748996_1.html","27742728_2.html","27437883_2.html","28035868_2.html"],["27977392_2.html","27977392_3.html","25271206_2.html","27684308_2.html","23129601_2.html","23963895_2.html","27295427_2.html","28854085_2.html","29279300_2.html","30566006_1.html"],["30566006_2.html","30566004_1.html","30354517_1.html","30586723_2.html","30586723_3.html","30418475_2.html","21428766_2.html","18094675_2.html","18094675_3.html","18094675_4.html"],["18199798_2.html","24206457_2.html","21332627_2.html","21332627_3.html","26620248_2.html","27406394_2.html","25352655_2.html","25352655_3.html","28432746_1.html","28432746_2.html"],["28386990_1.html","28386990_2.html","28386990_3.html","30218434_1.html","30291013_2.html","28263812_2.html","29664406_2.html","29228101_2.html","29148144_2.html","28359411_2.html"],["26475142_2.html","24281137_3.html","29431256_2.html","28948656_2.html","28402745_2.html","27842179_2.html","27395349_3.html","27354044_2.html","26915374_2.html","26754626_3.html"],["26541915_3.html","26541915_5.html","29661699_2.html","20487050_2.html","26027630_2.html","30183102_1.html","30183102_2.html","19660610_2.html","27639753_2.html","27639753_3.html"],["27639753_4.html","15781429_2.html","17560879_1.html","22913893_2.html","21174145_2.html","20953684_2.html","27619750_2.html","28844508_2.html","28844508_3.html","26330422_2.html"],["28391886_2.html","17058629_2.html","23040830_2.html","15924587_2.html","16709304_2.html","16709304_3.html","16709304_4.html","29263150_2.html","29263150_3.html","29151034_2.html"],["29151034_3.html","29151034_4.html","29151034_5.html","28972004_1.html","28972004_2.html","28972004_3.html","28231942_2.html","29903515_2.html","29903515_3.html","29903515_4.html"],["20151997_2.html","17022864_3.html","30336824_2.html","30336824_3.html","17011942_2.html","22573644_2.html","21815708_1.html","21815708_2.html","19423108_2.html","19104004_3.html"],["18172039_2.html","18172039_3.html","30415628_1.html","28905478_1.html","28905478_2.html","28905478_3.html","16116047_3.html","16116047_4.html","16116047_5.html","16139123_3.html"],["16139123_4.html","18259029_2.html","19139391_2.html","16537662_2.html","18498915_2.html","18498915_3.html","30175930_2.html","25031188_2.html","23733198_2.html","23110471_1.html"],["23110471_3.html","22799613_1.html","22799613_2.html","20678674_2.html","20469975_2.html","18326958_2.html","18615004_2.html","18657652_2.html","18375982_2.html","15381674_2.html"],["22248871_2.html","19751115_2.html","26066644_1.html","23307827_2.html","19596014_3.html","21933100_2.html","24120253_3.html","26704701_2.html","28877027_2.html","26100349_2.html"],["26100349_3.html","21428765_2.html","25045258_2.html","23020650_2.html","22177371_2.html","26563670_2.html","27796912_2.html","28720336_2.html","27616196_2.html","27616196_3.html"],["27616196_5.html","23714653_2.html","20418083_2.html","20185426_2.html","19716598_2.html","18836213_2.html","30290801_2.html","30290801_3.html","27215502_2.html","30139780_2.html"],["29409951_2.html","29409951_3.html","24966672_2.html","28416587_2.html","27767328_1.html","27767328_2.html","27767328_3.html","27767328_4.html","30587959_3.html","30587959_4.html"],["30587959_5.html","30587959_6.html","30584583_2.html","30584583_3.html","23471469_2.html","23471469_3.html","24156566_2.html","25248764_2.html","28278391_2.html","27181606_2.html"],["29925383_2.html","27912982_2.html","27912982_3.html","27912982_4.html","17605774_2.html","17605774_3.html","27993292_2.html","27993292_3.html","26112656_3.html","25573406_2.html"],["19443528_2.html","20685748_2.html","25490706_2.html","25736990_2.html","28159511_2.html","29782217_2.html","29782217_3.html","24383720_2.html","26233481_2.html","26233481_3.html"],["26233481_4.html","29128192_3.html","27609406_2.html","22544891_2.html","28395936_2.html","27056586_2.html","28848879_2.html","28385353_2.html","28385353_3.html","28385353_4.html"],["28385353_5.html","28385353_6.html","28385353_7.html","24321804_2.html","29429593_2.html","23040786_1.html","24253831_3.html","24596459_2.html","30053967_1.html","30053967_2.html"],["28720132_2.html","28720132_3.html","29713156_2.html","29671280_2.html","22259009_2.html","27576774_2.html","27046159_2.html","26586780_2.html","30354781_2.html","23121439_2.html"],["23121439_3.html","25037988_2.html","25037988_3.html","24097439_2.html","30166073_3.html","15590586_2.html","15590586_3.html","15590586_4.html","15998890_2.html","15753114_2.html"],["11442551_2.html","25475110_2.html","21673005_2.html","18835953_2.html","18339679_2.html","24727254_3.html","16801465_2.html","19332455_2.html","26059896_1.html","26059896_2.html"],["26059896_3.html","26059896_4.html","20385930_2.html","20385930_3.html","20357382_2.html","20357382_3.html","19389561_2.html","19389561_3.html","19349325_2.html","20136164_1.html"],["20136164_2.html","20136164_3.html","20136164_4.html","20136164_5.html","25670362_2.html","25670362_3.html","9892586_3.html","9892586_4.html","9841303_2.html","23473396_2.html"],["25161043_2.html","15451146_2.html","15337732_2.html","27581531_2.html","20400762_1.html","24780614_2.html","28844990_2.html","18499565_2.html","19850249_1.html","19850249_2.html"],["19850248_2.html","19850248_3.html","21060071_2.html","25175921_2.html","25175921_3.html","30302940_4.html","28939567_2.html","16214597_2.html","16214597_3.html","16905022_2.html"],["26762481_2.html","25775052_2.html","25775052_3.html","25775052_4.html","25775052_5.html","27043082_2.html","26321103_2.html","19332467_2.html","20582594_2.html","21545942_2.html"],["26271059_2.html","21780946_2.html","29447769_2.html","24247616_2.html","24247616_3.html","15758000_2.html","25523533_2.html","24076283_2.html","20200926_2.html","27612281_4.html"],["27612281_5.html","27612281_6.html","19776408_2.html","28827011_2.html","28924103_2.html","26486868_2.html","25657183_2.html","16537663_2.html","19717844_2.html","19966341_2.html"],["20194881_2.html","20370912_2.html","21059484_2.html","21147728_2.html","21576658_2.html","21576658_3.html","22084332_2.html","22700854_2.html","23271794_2.html","23271794_3.html"],["23743976_2.html","23770182_1.html","23770182_2.html","23770182_3.html","23991658_2.html","23991658_3.html","24251359_2.html","24323795_2.html","24842985_2.html","25769357_2.html"],["25769357_3.html","26065986_2.html","26093161_2.html","26179767_2.html","27358434_2.html","27609678_2.html","27807306_2.html","28213368_2.html","28302288_2.html","28520924_2.html"],["28520924_3.html","28666993_2.html","28689179_2.html","29248859_2.html","30012318_3.html"]]

   // [["25277614_2.html","19336502_4.html","30936738_1.html","30936738_2.html","30936738_3.html","30936738_4.html","30936738_5.html","24001888_2.html","28544533_2.html","28544533_3.html"],["27965257_2.html","30564451_2.html","18823986_2.html","17965424_2.html","16508926_6.html","19560810_1.html","27744141_2.html","29463520_2.html","27098404_1.html","30341453_1.html"],["30341453_2.html","30121827_3.html","16495392fig_2.html","18821708_3.html","26238672_1.html","26238672_2.html","20937671_2.html","24907147_2.html","24907147_3.html","24907147_4.html"],["24907147_5.html","27502582_2.html","28405473_2.html","28153828_2.html","26139005_2.html","29908670_1.html","30473179_3.html","26275429_2.html","25047021_1.html","22873530_2.html"],["27165179_2.html","22052584_2.html","25779603_2.html","22378566_2.html","28215362_2.html","26097039_2.html","26097039_3.html","29415145_1.html","29415145_2.html","27028914_2.html"],["29338762_2.html","27493790_2.html","30191421_2.html","24339179_2.html","29556416_2.html","29556416_3.html","29880010_1.html","30522501_1.html","29685860fig_1.html","30871355_3.html"],["30871355_4.html","24245566_2.html","23501976_2.html","23396280_2.html","30165610_3.html","23810874_2.html","30146932_2.html","30146931_2.html","30146931_3.html","30590387_2.html"],["30590387_3.html","28531241_2.html","27893045_2.html","26589819_1.html","19001024_1.html","19125778_2.html","27033025_2.html","19515181_2.html","25414932_1.html","23339726_2.html"],["26833744_2.html","26833744_3.html","26132939_2.html","26132939_3.html","26132939_4.html","26744025_2.html","28237263_2.html","28237263_3.html","29145215_2.html","29145215_3.html"],["30287422_2.html","29937431_2.html","25881510_2.html","22193143_2.html","26774608_2.html","26774608_3.html","29064626_2.html","28246236_2.html","27289121_2.html","25765696_2.html"],["25765696_3.html","23706759_2.html","28753486_2.html","28753486_3.html","25772548_2.html","28605608_2.html","29941478_1.html","29941478_2.html","29941478fig_1.html","29937267_2.html"],["29526832_2.html","22686416_2.html","26681720_2.html","24898834_2.html","24898834_3.html","23656980_2.html","23564916_2.html","23564916_3.html","23564916_4.html","30425095_1.html"],["30425095b_1.html","30203580_2.html","28842165_2.html","28842165_3.html","22913891_3.html","22913891_4.html","22913891_5.html","22913891_6.html","27161178_2.html","30609212_1.html"],["17878242_1.html","19210140_2.html","22234149_2.html","27252787_2.html","28327140_2.html","27977934_2.html","28197834_2.html","26579834_1.html","26579834_5.html","26373629_2.html"],["26373629_3.html","24918789_2.html","26580237_2.html","26580237_3.html","28904068_2.html","28666775_2.html","28666775_3.html","28386035_1.html","28386035_2.html","27299675_1.html"],["27299675_2.html","26378978_2.html","26378978_3.html","30586757_3.html","29777264_1.html","29777264fig_1.html","28910237_2.html","30393950_2.html","18223031_2.html","18223031_3.html"],["19614946_2.html","19614946_3.html","26934128_2.html","30614616_1.html","28921862_3.html","25795432_2.html","25795432_3.html","25592197_2.html","26179619_2.html","19688336_2.html"],["18539916_1.html","18539916_2.html","17765963_2.html","30571562_2.html","30571562_3.html","22369287_2.html","26524706_2.html","26524706_3.html","26358285_2.html","25758769_2.html"],["25552421_2.html","25552421_3.html","25189213_1.html","25189213_2.html","23992601_2.html","23992601_3.html","17980928_3.html","30474818_2.html","26786577_2.html","29766634_2.html"],["18284434_2.html","21682834_2.html","27484756_2.html","23909985_2.html","30851070_1.html","30830724_1.html","30830724_2.html","24067431_2.html","29103664_2.html","26121561_2.html"],["25468945_2.html","22509859_1.html","19097665_2.html","19097665_3.html","25629790_2.html","30882239_2.html","30882238_1.html","30415602_2.html","30547388_2.html","30547388_3.html"],["30547388_4.html","29159457_2.html","25852208_2.html","20228403_2.html","20228403_3.html","20228403_4.html","20228402_2.html","20228402_3.html","20228402_4.html","19508464_1.html"],["19508464_2.html","29790415_1.html","29790415_2.html","27502307_2.html","29748996_1.html","27742728_2.html","27437883_2.html","28035868_2.html","27977392_2.html","27977392_3.html"],["25271206_2.html","27684308_2.html","23129601_2.html","23963895_2.html","27295427_2.html","28854085_2.html","29279300_2.html","30566006_1.html","30566006_2.html","30566006fig_1.html"],["30566004_1.html","30566004_2.html","30392095_2.html","30354517_1.html","30586723_2.html","30586723_3.html","30418475_2.html","21428766_2.html","19650752_2.html","18094675_2.html"],["18094675_3.html","18094675_4.html","18199798_2.html","24206457_2.html","21332627_2.html","21332627_3.html","26620248_2.html","27406394_2.html","25352655_2.html","25352655_3.html"],["28432746_1.html","28432746_2.html","28386990_1.html","28386990_2.html","28386990_3.html","30218434_1.html","30291013_2.html","30953107_1.html","30953107_2.html","28263812_2.html"],["29664406_2.html","29228101_2.html","29148144_2.html","28359411_2.html","26475142_2.html","24281137_3.html","21545947fig_2.html","19917888app_1.html","19917888fig_2.html","29431256_2.html"],["28948656_2.html","17384437fig_1.html","28402745_2.html","9036306_1.html","18371559_1.html","27842179_2.html","27395349_2.html","27395349_3.html","27354044_2.html","27354044_3.html"],["26915374_2.html","26754626_3.html","26541915_3.html","26541915_5.html","26541915_6.html","29661699_2.html","20487050_2.html","26027630_2.html","26027630fig_1.html","30183102_1.html"],["30183102_2.html","30183102fig_1.html","19660610_2.html","27639753_2.html","27639753_3.html","27639753_4.html","15781429_2.html","15639688_2.html","17560879_1.html","17560879_2.html"],["22913893_2.html","21174145_2.html","20953684_2.html","27619750_2.html","27619750_3.html","28844508_2.html","28844508_3.html","26330422_2.html","28391886_2.html","24411003_1.html"],["25743173_2.html","25743173_3.html","17058629_2.html","19166691_2.html","23040830_2.html","15924587_2.html","16709304_2.html","16709304_3.html","16709304_4.html","27956003_2.html"],["29263150_2.html","29263150_3.html","29151034_2.html","29151034_3.html","29151034_4.html","29151034_5.html","28972004_1.html","28972004_2.html","28972004_3.html","28231942_2.html"],["29903515_2.html","29903515_3.html","29903515_4.html","20151997_2.html","17022864_3.html","27846344fig_2.html","30336824_2.html","30336824_3.html","17011942_2.html","25135178_2.html"],["22573644_2.html","21815708_1.html","21815708_2.html","19423108_2.html","19104004_3.html","18172039_2.html","18172039_3.html","30415628_1.html","25282519_2.html","28905478_1.html"],["28905478_2.html","28905478_3.html","16116047_3.html","16116047_4.html","16116047_5.html","16139123_3.html","16139123_4.html","18259029_2.html","19139391_2.html","16537662_2.html"],["18498915_2.html","18498915_3.html","30175930_2.html","25031188_2.html","23733198_2.html","23110471_1.html","23110471_3.html","22799613_1.html","22799613_2.html","20678674_2.html"],["20469975_2.html","18326958_2.html","19190658_2.html","20670726_2.html","18615004_2.html","18657652_2.html","18375982_2.html","15381674_2.html","22747613_2.html","22747613_3.html"],["22248871_2.html","21925996_2.html","21925996_3.html","21925996_4.html","19751115_2.html","26066644_1.html","23307827_2.html","24067881_2.html","22504093_2.html","30203005_2.html"],["29857145_3.html","29857145_4.html","29857145_5.html","29857145_6.html","29857145_7.html","19596014_3.html","21723220_1.html","21723220_2.html","21723220_3.html","16267322_2.html"],["22704916_2.html","17634459_2.html","20491747_2.html","29909019_2.html","29797519_1.html","21933100_2.html","24120253_3.html","24120253_4.html","26704701_2.html","28877027_2.html"],["20429821_2.html","20429821_3.html","20429821_4.html","21227674_2.html","20463178_2.html","26100349_2.html","26100349_3.html","21428765_2.html","25045258_2.html","23020650_2.html"],["22177371_2.html","26563670_2.html","27796912_2.html","28720336_2.html","27616196_2.html","27616196_3.html","27616196_5.html","23714653_2.html","20418083_2.html","20185426_2.html"],["19716598_2.html","18836213_2.html","30290801_2.html","30290801_3.html","27215502_2.html","27609408_2.html","30139780_2.html","29409951_2.html","29409951_3.html","24966672_2.html"],["24966672_3.html","28416587_2.html","30815468_1.html","30815468_2.html","30815468_3.html","27767328_1.html","27767328_2.html","27767328_3.html","27767328_4.html","30587959_3.html"],["30587959_4.html","30587959_5.html","30587959_6.html","30584583_2.html","30584583_3.html","23471469_2.html","23471469_3.html","24156566_2.html","25248764_2.html","27087007_1.html"],["28278391_2.html","27181606_2.html","29925383_2.html","27316465_2.html","27316465_3.html","27316465_4.html","27316465_5.html","27912982_2.html","27912982_3.html","27912982_4.html"],["17605774_2.html","17605774_3.html","27215749_3.html","27993292_2.html","27993292_3.html","26112656_3.html","25573406_2.html","27715335_2.html","18511702_2.html","19443528_2.html"],["20685748_2.html","21627828_2.html","21627828_3.html","27039236_2.html","25490706_2.html","25736990_2.html","28159511_2.html","29782217_2.html","29782217_3.html","24383720_2.html"],["21586508_2.html","28558833_2.html","28558833_3.html","26233481_2.html","26233481_3.html","26233481_4.html","29128192_3.html","27609406_2.html","22544891_2.html","29413502_2.html"],["28395936_2.html","27056586_2.html","28848879_2.html","28385353_2.html","28385353_3.html","28385353_4.html","28385353_5.html","28385353_6.html","28385353_7.html","21875546_2.html"],["24321804_2.html","29429593_2.html","23040786_1.html","23040786_2.html","24253831_3.html","24596459_2.html","28903864_2.html","30053967_1.html","30053967_2.html","30053967fig_1.html"],["28720132_2.html","28720132_3.html","29713156_2.html","29671280_2.html","20925534_2.html","20925534_3.html","22259009_2.html","29073947_2.html","27576774_2.html","27046159_2.html"],["26994121_2.html","26586780_2.html","25787199_2.html","30354781_2.html","23121439_2.html","23121439_3.html","25037988_2.html","25037988_3.html","24097439_2.html","30166073_3.html"],["15590586_2.html","15590586_3.html","15590586_4.html","15998890_2.html","15753114_2.html","11442551_2.html","25475110_2.html","21673005_2.html","18835953_2.html","18339679_2.html"],["24727254_2.html","24727254_3.html","16801465_2.html","19332455_2.html","26059896_1.html","26059896_2.html","26059896_3.html","26059896_4.html","26059896fig_2.html","20385930_2.html"],["20385930_3.html","20385930fig_2.html","20357382_2.html","20357382_3.html","19389561_2.html","19389561_3.html","19389561fig_2.html","19349325_2.html","20136164_1.html","20136164_2.html"],["20136164_3.html","20136164_4.html","20136164_5.html","25670362_2.html","25670362_3.html","21816478_2.html","7997016_1.html","9892586_3.html","9892586_4.html","9841303_2.html"],["9603532_1.html","9848888_2.html","18479744_2.html","23473396_2.html","25161043_2.html","15451146_2.html","15337732_2.html","27581531_2.html","20400762_1.html","24780614_2.html"],["24780614_3.html","17244641_2.html","28844990_2.html","26630143_2.html","18499565_2.html","19850249_1.html","19850249_2.html","19850248_2.html","19850248_3.html","21060071_2.html"],["26304934_2.html","25175921_2.html","25175921_3.html","30302940_4.html","28939567_2.html","16214597_2.html","16214597_3.html","16905022_2.html","26762481_2.html","25775052_2.html"],["25775052_3.html","25775052_4.html","25775052_5.html","27043082_2.html","26321103_2.html","19332467_2.html","20582594_2.html","21545942_2.html","26271059_2.html","21780946_2.html"],["29447769_2.html","24247616_2.html","24247616_3.html","15758000_2.html","25523533_2.html","24076283_2.html","19915221_2.html","8950879_1.html","20200926_2.html","30659410_1.html"],["30659410_2.html","30659410_3.html","27612281_4.html","27612281_5.html","27612281_6.html","19776408_2.html","28827011_2.html","28924103_2.html","26486868_2.html","25657183_2.html"],["16537663_2.html","19717844_2.html","19966341_2.html","20194881_2.html","20370912_2.html","21059484_2.html","21147728_2.html","21576658_2.html","21576658_3.html","22084332_2.html"],["22316106_2.html","22436129_2.html","22700854_2.html","22709460_2.html","23271794_2.html","23271794_3.html","23564919_2.html","23683134_2.html","23743976_2.html","23770182_1.html"],["23770182_2.html","23770182_3.html","23991658_2.html","23991658_3.html","24251359_2.html","24251359_3.html","24323795_2.html","24842985_2.html","25769357_2.html","25769357_3.html"],["26065986_2.html","26093161_1.html","26093161_2.html","26179767_2.html","26578849_2.html","27103795_1.html","27207971_1.html","27358434_2.html","27387994_1.html","27496855_1.html"],["27609678_2.html","27807306_2.html","28213368_2.html","28302288_2.html","28520924_2.html","28520924_3.html","28666993_2.html","28689179_2.html","29248859_2.html","30012318_3.html"]]

  var selected_group_docs = []

  for ( i in fgroup ) {
    var group_index = parseInt(fgroup[i])-1;
    selected_group_docs = [...selected_group_docs, ...ordered_Splits[group_index]]
  }


  var selected_label_docs = []

  for ( i in flgroup ) {
    var label_index = parseInt(flgroup[i])-1;
    selected_label_docs = [...selected_label_docs, ...ordered_docs_to_label[label_index]]
  }

  selected_group_docs = selected_group_docs.flat();

  // debugger

  var results = new Promise(function(resolve, reject) {

          var available_documents = {}
          var abs_index = []
          var DOCS = []

          var fixVersionOrder = (a) => {
          	var i = a.indexOf("v");
          	if ( i > -1 ){
          		return a.slice(0,i)+a.slice(i+2,a.length)+a.slice(i,i+2)
              } else {
          		return a;
              }

          }

          fs.readdir(tables_folder, function(err, items) {

              var label_filters = flgroup;

              var labelled = Object.keys(labellers);

              var unannotated = ordered_Splits;

              debugger

              if ( selected_group_docs.length > 0 ){
                DOCS = selected_group_docs
              }

              if ( selected_label_docs.length > 0 ){
                DOCS = selected_label_docs
              }

              debugger

              if ( DOCS.length < 1) {
                DOCS = items.sort(  (a,b) => {return fixVersionOrder(a).localeCompare(fixVersionOrder(b))} );
              }
              // DOCS = selected_group_docs.length > 0 ? selected_group_docs : DOCS;


              // DOCS
              // console.log(selected_group_docs)
              //
              // debugger
              DOCS = DOCS.reduce( (acc,docfile) => {
                  var docid = docfile.split("_")[0].split("v")[0]
                  var docid_V = docfile.split("_")[0]

                  var page = docfile.split("_")[1].split(".")[0]

                  // if ( docfile.indexOf("29937431") > -1 ){
                  //   debugger
                  // }

                  if( (ftop.length+ftyp.length > 0) && msh_categories && msh_categories.catIndex ){

                    var topic_enabled = ftop.length > 0

                    var topic_intersection = ftop.reduce( (acc, cat) => { return acc || (msh_categories.catIndex[cat].indexOf(docid) > -1) }, false );

                    if ( ftop.indexOf("NA") > -1 ){
                      if ( msh_categories.pmids_w_cat.indexOf(docid) < 0 ){
                          topic_intersection = true
                      }
                    }

                    var type_enabled = ftyp.length > 0
                    var type_intersection = (type_enabled && (filtered_docs_ttype.length > 0) && (filtered_docs_ttype.indexOf(docid_V+"_"+page) > -1))

                    var isAnnotated = all_annotated_docids.indexOf(docid_V+"_"+page) > -1

                    var show_not_annotated = !hua

                    var accept_docid = false

                    // Logic to control the filter. It depends in many variables with many controlled outcomes, so it looks a bit complicated
                    if ( topic_enabled && type_enabled ){

                      accept_docid = topic_intersection ? true : accept_docid
                      accept_docid = type_intersection || (show_not_annotated && !isAnnotated) ? accept_docid : false

                    } else if (topic_enabled && !type_enabled){

                      accept_docid = topic_intersection ? true : accept_docid
                      accept_docid = !show_not_annotated ? ( isAnnotated && topic_intersection ) : accept_docid

                    } else if (!topic_enabled && type_enabled){

                      accept_docid = type_intersection || (show_not_annotated && !isAnnotated) ? true : false

                    } else if ( (!topic_enabled) && (!type_enabled) ){
                      accept_docid = !show_not_annotated ? ( isAnnotated ) : true
                    }
                    // End of filter logic.

                    if ( accept_docid ) {
                      acc.push(docfile)
                    }

                  } else { // Default path when no filters are enabled

                    if ( !hua ){ // The document is not annotated, so always add.
                      acc.push(docfile)
                    } else {
                      if ( all_annotated_docids.indexOf(docid_V+"_"+page) > -1 ){
                        acc.push(docfile)
                      }
                    }
                  }

                  return acc
              },[])

              DOCS = Array.from(new Set(DOCS))

              try{
                for ( var d in DOCS ){

                  var docfile = DOCS[d]
                  var fileElements = docfile.split("_")
                  var docid = fileElements[0]
                  var page = fileElements[1].split(".")[0]
                  var extension = fileElements[1].split(".")[1]

                  if ( available_documents[docid] ){
                    var prev_data = available_documents[docid]
                        prev_data.pages[prev_data.pages.length] = page
                        prev_data.abs_pos[prev_data.abs_pos.length] = abs_index.length
                        prev_data.maxPage = page > prev_data.maxPage ? page : prev_data.maxPage
                        available_documents[docid] = prev_data
                  } else {
                        available_documents[docid] = {abs_pos: [ abs_index.length ], pages : [ page ] , extension, maxPage : page}
                  }

                  abs_index[abs_index.length] = {docid, page, extension, docfile}

                }

                // console.log("YAY")
                resolve({available_documents, abs_index, DOCS})
              } catch (e){

                console.log("FAILED: "+JSON.stringify(e))

                reject(e)
              }
          });

    });

    return await results
}

async function getAnnotationResults(){

  var client = await pool.connect()
  var result = await client.query(`select * from annotations order by docid desc,page asc`)
        client.release()
  return result
}

async function getMetadataLabellers(){

  var client = await pool.connect()
  var result = await client.query(`select distinct docid, page, labeller from metadata`)
        client.release()

  return result
}

async function getAnnotationByID(docid,page,user){

  var client = await pool.connect()

  var result = await client.query('select * from annotations where docid=$1 AND page=$2 AND "user"=$3 order by docid desc,page asc',[docid,page,user])
        client.release()
  return result
}

let assert = require('assert');
let pythonBridge = require('python-bridge');

let python = pythonBridge({
    python: 'python3'
});

python.ex`
  import pandas
  from sklearn import model_selection
  from sklearn.linear_model import SGDClassifier
  import pickle
  import sys
  import json
  import pandas as pd
`;

console.log(process.cwd())
//   sgd = pickle.load(open("./src/sgd_multiterm.sav", 'rb'))
//   sgd = pickle.load(open("./src/sgd_l_svm_char.sav", 'rb'))
python.ex`
  sgd = pickle.load(open("./src/sgd_nbmr_full.sav", 'rb'))
  def classify(h):
    d={}
    result = sgd.predict(h)
    for r in range(0,len(h)):
      d[h[r]] = result[r]
    return d
  def getTopConfidenceTerms(df):
      df = df.sort_values(by=['confidence'], ascending=False)
      mean = df.mean(axis=0)
      return df[df["confidence"] > mean[0]]["classes"].values
  def groupedPredict( terms ):
      result = {}
      for t in range(0,len(terms)):
          d = {'classes': sgd[2].classes_, 'confidence': sgd.decision_function([terms[t]])[0]}
          df = pd.DataFrame(data=d)
          res = getTopConfidenceTerms(df)
          result[terms[t]] = ";".join(res)
      return result
`;


async function classify(terms){

  var result = new Promise(function(resolve, reject) {
    var cleanTerms = []

    for( t in terms ){

      var term = prepare_cell_text(terms[t])

      if (term.length > 0){
        if ( term.replace(/[^a-z]/g,"").length > 2 ){ // na's and "to" as part of ranges matching this length. Potentially other rubbish picked up here.
          cleanTerms[cleanTerms.length] = term
        }
      }
    }

    if ( cleanTerms.length > 0 ){

      python`
        classify(${cleanTerms})
      `.then( x => resolve(x))
      .catch(python.Exception, (e) => console.log("python error: "+e));
    } else {
      resolve({})
    }
  });

  return result
}

async function grouped_predictor(terms){

  var result = new Promise(function(resolve, reject) {
    if ( terms.length > 0 ){
      python`
        groupedPredict(${[terms]})
      `.then( x => resolve(x))
      .catch(python.Exception, (e) => console.log("python error: "+e));
    } else {
      resolve({})
    }
  });

  return result
}



async function attempt_predictions(actual_table){
  var result = new Promise(async function(resolve, reject) {
    try{
      var a = cheerio.load(actual_table)

      var lines = a("tr")

      var predictions = new Array(lines.length)

      for( var l = 0; l < lines.length; l++ ){
          var currentLine = cheerio(lines[l])
          var terms = []
          var cellClasses = []
          var cellClass = ""

          for ( var c = 0 ; c < currentLine.children().length; c++){
            terms[terms.length] = cheerio(currentLine.children()[c]).text().trim().replace(/\n/g, " ").toLowerCase()

            var cellClassSelector = (cheerio(currentLine.children()[c]).children()[0])
            if ( cellClassSelector ){
              cellClass = cellClassSelector.attribs.class || ""
            }

            cellClasses[cellClasses.length] = cellClass
          }

          var pred_class = await classify(terms)

          predictions[l] = {pred_class,terms,cellClasses}
      }

      resolve(predictions)
    }catch ( e){
      reject(e)
    }
  });

  return result
}



async function insertAnnotation(docid, page, user, annotation, corrupted, tableType, corrupted_text){

  var client = await pool.connect()

  var done = await client.query('INSERT INTO annotations VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (docid, page,"user") DO UPDATE SET annotation = $4, corrupted = $5, "tableType" = $6, "corrupted_text" = $7 ;', [docid, page, user, annotation, corrupted,tableType, corrupted_text])
    .then(result => console.log("insert: "+ result))
    .catch(e => console.error(e.stack))
    .then(() => client.release())

}

async function refreshDocuments(){
  var res = await prepareAvailableDocuments()
  available_documents = res.available_documents
  abs_index = res.abs_index
  DOCS = res.DOCS
}

// preinitialisation of components if needed.
async function main(){
  await refreshDocuments()
}

main();


app.get('/api/deleteTable', async function(req,res){

  if ( req.query && req.query.docid && req.query.page ){

    var filename = req.query.docid+"_"+req.query.page+".html"

    var delprom = new Promise(function(resolve, reject) {
        fs.rename( tables_folder+'/'+ filename , tables_folder_deleted+'/'+ filename , (err) => {
          if (err) { reject("failed")} ;
          console.log('Move complete : '+filename);
          resolve("done");
        });
    });

    await delprom;
    await refreshDocuments();

    res.send("table deleted")
  } else {
    res.send("table not deleted")
  }

});

app.get('/api/recoverTable', async function(req,res){
    if ( req.query && req.query.docid && req.query.page ){

      var filename = req.query.docid+"_"+req.query.page+".html"

      fs.rename( tables_folder_deleted+'/'+ filename , tables_folder+'/'+ filename , (err) => {
        if (err) throw err;
          console.log('Move complete : '+filename);
      });
    }

    res.send("table recovered")
});



app.get('/api/listDeletedTables', async function(req,res){

  fs.readdir( tables_folder_deleted, function(err, items) {

    if (err) {
      res.send("failed listing "+err)
    } else {
      res.send(items)
    }

  });

});




app.get('/api/modifyCUIData', async function(req,res){

  var modifyCUIData = async (cui, preferred, adminApproved, prevcui) => {
      var client = await pool.connect()

      var result = await client.query(`UPDATE cuis_index SET cui=$1, preferred=$2, admin_approved=$3 WHERE cui = $4`,
        [cui, preferred, adminApproved, prevcui] )

      if ( result && result.rowCount ){
        var q = new Query(`UPDATE metadata SET cuis = array_to_string(array_replace(regexp_split_to_array(cuis, ';'), $2, $1), ';'), cuis_selected = array_to_string(array_replace(regexp_split_to_array(cuis_selected, ';'), $2, $1), ';')`, [cui, prevcui])
        result = await client.query( q )
      }

      client.release()
      return result
  }

  if ( req.query && req.query.cui && req.query.preferred && req.query.adminApproved && req.query.prevcui ){
    var result = await modifyCUIData(req.query.cui, req.query.preferred, req.query.adminApproved, req.query.prevcui)
    res.send(result)
  } else {
    res.send("UPDATE failed");
  }

});


app.get('/api/cuiDeleteIndex', async function(req,res){

  var cuiDeleteIndex = async (cui) => {
      var client = await pool.connect()

      var done = await client.query('delete from cuis_index where cui = $1', [cui ])
        .then(result => console.log("deleted: "+ new Date()))
        .catch(e => console.error(e.stack))
        .then(() => client.release())

  }

  if ( req.query && req.query.cui){
    await cuiDeleteIndex(req.query.cui)
    res.send("done")
  } else {
    res.send("clear failed");
  }

});

app.get('/api/getMetadataForCUI', async function(req,res){

  var getCuiTables = async (cui) => {
      var client = await pool.connect()
      var result = await client.query(`select docid,page,"user" from metadata where cuis like $1 `, ["%"+cui+"%"])
            client.release()
      return result

  }
  //console.log(req.query)
  if ( req.query && req.query.cui ){
    var meta = await getCuiTables(req.query.cui)
    //console.log(meta)
    res.send(meta)
  } else {
    res.send("clear failed");
  }

});


app.get('/api/clearMetadata', async function(req,res){

  var setMetadata = async (docid, page, user) => {
      var client = await pool.connect()

      var done = await client.query('DELETE FROM metadata WHERE docid = $1 AND page = $2 AND "user" = $3', [docid, page, user ])
        .then(result => console.log("deleted: "+ new Date()))
        .catch(e => console.error(e.stack))
        .then(() => client.release())

  }

  if ( req.query && req.query.docid && req.query.page && req.query.user){
    await setMetadata(req.query.docid , req.query.page, req.query.user)
    res.send("done")
  } else {
    res.send("clear failed");
  }

});


app.get('/api/setMetadata', async function(req,res){

  var setMetadata = async (docid, page, concept, cuis, qualifiers, cuis_selected, qualifiers_selected, user, istitle, labeller ) => {
      var client = await pool.connect()

      // var done = await client.query('DELETE FROM metadata WHERE docid = $1 AND page = $2 AND "user" = $3', [docid, page, user ])
      //   .then(result => console.log("deleted: "+ new Date()))
      //   .catch(e => console.error(e.stack))
      //   .then(() => client.release())
      //
      // client = await pool.connect()

     var done = await client.query('INSERT INTO metadata(docid, page, concept, cuis, qualifiers, "user", cuis_selected, qualifiers_selected, istitle, labeller ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (docid, page, concept, "user") DO UPDATE SET cuis = $4, qualifiers = $5, cuis_selected = $7, qualifiers_selected = $8, istitle = $9, labeller = $10', [docid, page, concept, cuis, qualifiers, user, cuis_selected, qualifiers_selected, istitle, labeller ])
        .then(result => console.log("insert: "+ new Date()))
        .catch(e => console.error(e.stack))
        .then(() => client.release())

  }

  if ( req.query && req.query.docid && req.query.page && req.query.concept && req.query.user){
    await setMetadata(req.query.docid , req.query.page , req.query.concept , req.query.cuis || "", req.query.qualifiers || "", req.query.cuis_selected || "", req.query.qualifiers_selected || "" , req.query.user, req.query.istitle, req.query.labeller)
    res.send("done")
  } else {
    res.send("insert failed");
  }

});


app.get('/api/getMetadata', async function(req,res){

  var getMetadata = async ( docid,page, user) => {
    var client = await pool.connect()
    var result = await client.query(`SELECT docid, page, concept, cuis, cuis_selected, qualifiers, qualifiers_selected, "user",istitle, labeller FROM metadata WHERE docid = $1 AND page = $2 AND "user" = $3`,[docid,page,user])
          client.release()
    return result
  }

  if ( req.query && req.query.docid && req.query.page && req.query.user ){
    res.send( await getMetadata(req.query.docid , req.query.page , req.query.user) )
  } else {
    res.send( { error : "getMetadata_badquery" } )
  }

});

app.get('/',function(req,res){
  res.send("this is home")
});

app.get('/api/allInfo',async function(req,res){

  var labellers = await getMetadataLabellers();
      labellers = labellers.rows.reduce( (acc,item) => { acc[item.docid+"_"+item.page] = item.labeller; return acc;},{})

  if ( req.query && (req.query.filter_topic || req.query.filter_type || req.query.hua || req.query.filter_group || req.query.filter_labelgroup) ){
    // debugger;
    var result = await prepareAvailableDocuments( req.query.filter_topic ? req.query.filter_topic.split("_") : [],
                                                  req.query.filter_type ? req.query.filter_type.split("_") : [],
                                                  req.query.hua ? req.query.hua == "true" : false,
                                                  req.query.filter_group ? req.query.filter_group.split("_") : [],
                                                  req.query.filter_labelgroup ? req.query.filter_labelgroup.split("_") : [])



    var available_documents_temp = result.available_documents
    var abs_index_temp = result.abs_index
    var DOCS_temp = result.DOCS

        res.send({
          abs_index : abs_index_temp,
          total : DOCS_temp.length,
          available_documents: available_documents_temp,
          msh_categories: msh_categories,
          labellers: labellers
        })

  } else {

        res.send({
          abs_index,
          total : DOCS.length,
          available_documents,
          msh_categories: msh_categories,
          labellers: labellers
        })

  }

});

async function updateClusterAnnotation(cn,concept,cuis,isdefault,cn_override){

  var client = await pool.connect()

  var done = await client.query('INSERT INTO clusters VALUES($1,$2,$3,$4,$5) ON CONFLICT (concept) DO UPDATE SET isdefault = $4, cn_override = $5;', [cn,concept,cuis,isdefault.toLowerCase() == 'true',cn_override ])
    .then(result => console.log("insert: "+ result))
    .catch(e => console.error(e.stack))
    .then(() => client.release())

  // console.log("Awaiting done: "+(ops_counter++))
  // console.log("DONE: "+(ops_counter++))
}

async function getRecommendedCUIS(){
  var cuiRecommend = async () => {
    var client = await pool.connect()
    var result = await client.query(`select * from cuis_recommend`)
          client.release()
    return result
  }

  var recommend_cuis = {}

  var rec_cuis = (await cuiRecommend()).rows

  var splitConcepts = ( c ) => {

      if ( c == null ){
        return []
      }

      var ret = c[0] == ";" ? c.slice(1) : c // remove trailing ;

      return ret.length > 0 ? ret.split(";") : []
  }

  rec_cuis ? rec_cuis.map ( item => {

    var cuis = splitConcepts(item.cuis)
    var rep_cuis = splitConcepts(item.rep_cuis)
    var excluded_cuis = splitConcepts(item.excluded_cuis)

    var rec_cuis = []

    cuis.forEach(function(cui) {
    	if ( excluded_cuis.indexOf(cui) < 0 ){
        if ( rep_cuis.indexOf(cui) < 0 ){
            rec_cuis.push(cui)
        }
      }
    });

    recommend_cuis[item.concept] = { cuis: rep_cuis.concat(rec_cuis), cc: item.cc }

  }) : ""
  return recommend_cuis
}

app.get('/api/cuiRecommend', async function(req,res){

  var cuirec = await getRecommendedCUIS()

  res.send( cuirec )

});


app.get('/api/allClusterAnnotations', async function(req,res){

  var allClusterAnnotations = async () => {
    var client = await pool.connect()
    var result = await client.query(`select COALESCE(clusters.cn_override, clusters.cn) as cn,concept,rep_cuis,excluded_cuis,status,proposed_name from clusters,clusterdata where clusters.cn = clusterdata.cn ORDER BY cn asc,concept asc`)
          client.release()
    return result
  }

  res.send( await allClusterAnnotations() )

});


app.get('/api/allMetadata', async function(req,res){

  var allMetadataAnnotations = async () => {
    var client = await pool.connect()
    var result = await client.query(`select * from metadata`)
          client.release()
    return result
  }

  res.send( await allMetadataAnnotations() )

});


app.get('/api/allClusters', async function(req,res){

  var getAllClusters = async () => {
    var client = await pool.connect()
    var result = await client.query(`select COALESCE(cn_override , cn) as cn,  concept, cuis, isdefault, cn_override from clusters order by cn asc, concept asc`)
          client.release()
    return result
  }

  res.send( await getAllClusters() )

});

app.get('/api/getCUIMods', async function(req,res){

  var getCUIMods = async () => {
    var client = await pool.connect()
    var result = await client.query(`select * from modifiers`)
          client.release()
    return result
  }

  res.send( await getCUIMods() )

});


app.get('/api/setCUIMod', async function(req,res){

  var setCUIMod = async (cui,type) => {
      var client = await pool.connect()
      var done = await client.query('INSERT INTO modifiers VALUES($1,$2) ON CONFLICT (cui) DO UPDATE SET type = $2;', [cui,type])
        .then(result => console.log("insert: "+ new Date()))
        .catch(e => console.error(e.stack))
        .then(() => client.release())

  }

  if ( req.query && req.query.cui && req.query.type){
    await setCUIMod(req.query.cui, req.query.type)
  }

});


app.get('/api/getClusterData', async function(req,res){

  var getClusterData = async () => {
    var client = await pool.connect()
    var result = await client.query(`select * from clusterdata`)
          client.release()
    return result
  }

  res.send( await getClusterData() )

});


app.get('/api/setClusterData', async function(req,res){
  console.log("Processing Request: "+JSON.stringify(req.query))
  var setClusterData = async (cn,rep_cuis,excluded_cuis,status,proposed_name) => {

      var p_name = proposed_name && (proposed_name.length > 0) && proposed_name !== "null"  ? proposed_name : "";

      var client = await pool.connect()
      var done = await client.query('INSERT INTO clusterdata VALUES($1,$2,$3,$4) ON CONFLICT (cn) DO UPDATE SET rep_cuis = $2, excluded_cuis = $3, status = $4, proposed_name = $5 ;', [cn,rep_cuis,excluded_cuis,status,p_name])
        .then(result => console.log("insert: "+ JSON.stringify(result)))
        .catch(e => console.error(e.stack))
        .then(() => client.release())

  }

  if ( req.query && req.query.cn && req.query.status){
    await setClusterData(req.query.cn, req.query.rep_cuis || "", req.query.excluded_cuis || "", req.query.status, req.query.proposed_name)
  }

  res.send( "updated" )

});


app.get('/api/recordClusterAnnotation',async function(req,res){

  console.log(JSON.stringify(req.query))

  if(req.query && req.query.cn.length > 0
              && req.query.concept.length > 0
              && req.query.cuis.length > 0
              && req.query.isdefault.length > 0
              && req.query.cn_override.length > 0){
      await updateClusterAnnotation( req.query.cn , req.query.concept, req.query.cuis, req.query.isdefault, req.query.cn_override )
  }

  res.send("saved cluster annotation: "+JSON.stringify(req.query))

});

app.get('/api/cuisIndex',async function(req,res){

      var getCUISIndex = async () => {

        var cuis = {}

        var client = await pool.connect()
        var result = await client.query(`select * from cuis_index`)
              client.release()

        result.rows.map( row => {
          cuis[row.cui] = {preferred : row.preferred, hasMSH: row.hasMSH, userDefined: row.user_defined, adminApproved: row.admin_approved}
        })

        return cuis
      }

      res.send( await getCUISIndex() )

});

app.get('/api/cuisIndexAdd',async function(req,res){

  console.log(JSON.stringify(req.query))

  var insertCUI = async (cui,preferred,hasMSH) => {
      var client = await pool.connect()
      var done = await client.query('INSERT INTO cuis_index(cui,preferred,"hasMSH",user_defined,admin_approved) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (cui) DO UPDATE SET preferred = $2, "hasMSH" = $3, user_defined = $4, admin_approved = $5',  [cui,preferred,hasMSH,true,false])
        .then(result => console.log("insert: "+ new Date()))
        .catch(e => console.error(e.stack))
        .then(() => client.release())
  }

  if(req.query && req.query.cui.length > 0
              && req.query.preferred.length > 0
              && req.query.hasMSH.length > 0
              ){
              await insertCUI( req.query.cui , req.query.preferred, req.query.hasMSH );
  }
  res.send("saved annotation: "+JSON.stringify(req.query))
});

async function allPredictions(){
  // var predictions = "user,docid,page,corrupted,tableType,location,number,content,qualifiers\n"

  var cui_data =  await CUIData ()

  var header = [
      {id: 'docid', title: 'docid'},
      {id: 'page', title: 'page'},
      {id: 'concept', title: 'concept'},
      {id: 'clean_concept', title: 'clean_concept'},
      {id: 'original', title: 'original'},
      {id: 'onlyNumbers', title: 'onlyNumbers'},
      {id: 'pos_start', title: 'pos_start'},
      {id: 'pos_middle', title: 'pos_middle'},
      {id: 'pos_end', title: 'pos_end'},
      {id: 'inRow', title: 'inRow'},
      {id: 'inCol', title: 'inCol'},
      {id: 'is_bold', title: 'is_bold'},
      {id: 'is_italic', title: 'is_italic'},
      {id: 'is_indent', title: 'is_indent'},
      {id: 'is_empty_row', title: 'is_empty_row'},
      {id: 'is_empty_row_p', title: 'is_empty_row_p'},
      {id: 'cuis', title: 'cuis'},
      {id: 'semanticTypes', title: 'semanticTypes'},
      {id: 'label', title: 'label'}
  ]

  Object.keys(cui_data.cui_def).map( c => {header.push({id: c, title: c})})
  Object.keys(cui_data.semtypes).map( s => {header.push({id: s, title: s})})


  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const csvWriter = createCsvWriter({
      path: 'prediction_data.csv',
      header: header
  });
  //
  // debugger

  // const records = [
  //     {name: 'Bob',  lang: 'French, English'},
  //     {name: 'Mary', lang: 'English'}
  // ];


  var count = 1;

  for ( var docid in available_documents){
    for ( var page in available_documents[docid].pages ) {
      console.log(docid+"  --  "+page+"  --  "+count+" / "+DOCS.length)


      var page = available_documents[docid].pages[page]
      var data = await readyTableData(docid,page)

      var ac_res = cui_data.actual_results

      if ( !ac_res[docid+"_"+page] ) { // table could not be annotated yet, so we skip it.
        continue
      }

      // if (! (docid == "16351668" && page == 2) ){
      //    continue
      // }
      //
      // debugger

      // These are predicted, using the SGDClassifier
      var cols = data.predicted.cols.reduce( (acc,e) => {acc[e.c] = {descriptors : e.descriptors.join(";"), modifier: e.unique_modifier}; return acc},{} )
      var rows = data.predicted.rows.reduce( (acc,e) => {acc[e.c] = {descriptors : e.descriptors.join(";"), modifier: e.unique_modifier}; return acc},{} )

      var annotation_cols
      var annotation_rows

      try{
      // These are manually annotated
        annotation_cols = Object.keys(ac_res[docid+"_"+page].Col).reduce( (acc,e) => {  acc[e-1] = ac_res[docid+"_"+page].Col[e]; return acc }, {} )
        annotation_rows = Object.keys(ac_res[docid+"_"+page].Row).reduce( (acc,e) => {  acc[e-1] = ac_res[docid+"_"+page].Row[e]; return acc }, {} )
      } catch (e) {
        console.log( "skipping: "+ docid+"_"+page)
        continue
      }
      // Now we use the manual annotations here to build our dataset, to train the classifiers.
      cols = annotation_cols
      rows = annotation_rows


      var cuirec = await getRecommendedCUIS()

      var cleanTerm = (term) => {

        term = term.toLowerCase().replace(/[^A-z0-9 ]/gi, " ").replace(/[0-9]+/gi, " $nmbr$ " ).replace(/ +/gi," ").trim()

        return term
      }

      var getSemanticTypes = (cuis, cui_data) => {

        if ( ! cuis ){
          return []
        }

        var semType = []

        cuis.split(";").map( (cui) => {

            semType.push(cui_data.cui_def[cui].semTypes.split(";"))

        });

        return semType.flat()
      }
      //
      count = count + 1;
      // if ( count > 10 ){
      //    return ""
      // }
      //
      // debugger

      var csvData = data.predicted.predictions.map(
        (row_el,row) => {
          return row_el.terms.map( ( term, col ) => {

              var clean_concept = cleanTerm(term)
              var row_terms = data.predicted.predictions[row].terms
              // debugger;

              var toReturn = {
                docid: docid,
                page: page,
                concept : prepare_cell_text(term),
                clean_concept : clean_concept,
                original : term,
                onlyNumbers : term.replace(/[^a-z]/g," ").replace(/ +/g," ").trim() == "",
                // row: row,
                // col: col,
                pos_start: row == 0 ? 1 : "",
                pos_middle: row > 0 && row < (data.predicted.predictions.length-1)  ? 1 : "",
                pos_end: row == data.predicted.predictions.length-1 ? 1 : "",
                // isCharacteristic_name: cols[col] && cols[col].descriptors.indexOf("characteristic_name") > -1 ? 1 : 0,
                // isCharacteristic_level: cols[col] && cols[col].descriptors.indexOf("characteristic_level") > -1 ? 1 : 0,
                // isOutcome: cols[col] && cols[col].descriptors.indexOf("outcomes") > -1 ? 1 : 0,
                inRow : rows[row] ? 1 : "",
                inCol : cols[col] ? 1 : "",
                is_bold : data.predicted.predictions[row].cellClasses[col].indexOf("bold") > -1 ? 1 : "",
                is_italic : data.predicted.predictions[row].cellClasses[col].indexOf("italic") > -1 ? 1 : "",
                is_indent : data.predicted.predictions[row].cellClasses[col].indexOf("indent") > -1 ? 1 : "",
                is_empty_row : row_terms[0] == row_terms.join("") ? 1 : "",
                is_empty_row_p : row_terms.length > 2 && (row_terms[0]+row_terms[row_terms.length-1] == row_terms.join("")) ? 1 : "",  // this one is a crude estimation of P values structure. Assume the row has P value if multiple columns are detected but only first and last are populated.
                label : cols[col] ? cols[col].descriptors : (rows[row] ? rows[row].descriptors : ""),
                cuis: cui_data.cui_concept[clean_concept],
                semanticTypes: getSemanticTypes(cui_data.cui_concept[clean_concept],cui_data).join(";"),

                // cui_def, cui_concept
              }

              if ( cui_data.cui_concept[clean_concept] ){
                cui_data.cui_concept[clean_concept].split(";").map( cui => {
                    toReturn[cui] = 1
                })
              }

              getSemanticTypes(cui_data.cui_concept[clean_concept],cui_data).map( semType => {
                  toReturn[semType] = 1
              })

              return toReturn
            })
          }
        )

      csvData = csvData.flat().filter(el => el.onlyNumbers == false);

      await csvWriter.writeRecords(csvData)       // returns a promise
          .then(() => {
              console.log('...Done');
          });
    }
  }

  // var cuirec = await getRecommendedCUIS()

  return {}
}

app.get('/api/allPredictions', async function(req,res){
  console.log("getting all predictions")

  var allP = await allPredictions()

  res.send(allP)
});


// Generates the results table live preview, connecting to the R API.
app.get('/api/annotationPreview',async function(req,res){

  try{

        var annotations

        if(req.query && req.query.docid && req.query.docid.length > 0 ){
          var page = req.query.page && (req.query.page.length > 0) ? req.query.page : 1
          var user = req.query.user && (req.query.user.length > 0) ? req.query.user : ""

          console.log(user + "  -- "+JSON.stringify(req.query))
          annotations = await getAnnotationByID(req.query.docid,page, user)

        } else{
          res.send( {state:"badquery: "+JSON.stringify(req.query)} )
        }

        var final_annotations = {}

        /**
        * There are multiple versions of the annotations. When calling reading the results from the database, here we will return only the latest/ most complete version of the annotation.
        * Independently from the author of it. Completeness here measured as the result with the highest number of annotations and the highest index number (I.e. Newest, but only if it has more information/annotations).
        * May not be the best in some cases.
        *
        */

        for ( var r in annotations.rows){
          var ann = annotations.rows[r]
          var existing = final_annotations[ann.docid+"_"+ann.page]
          if ( existing ){
            if ( ann.N > existing.N && ann.annotation.annotations.length >= existing.annotation.annotations.length ){
                  final_annotations[ann.docid+"_"+ann.page] = ann
            }
          } else { // Didn't exist so add it.
            final_annotations[ann.docid+"_"+ann.page] = ann
          }
        }

        var final_annotations_array = []
        for (  var r in final_annotations ){
          var ann = final_annotations[r]
          final_annotations_array[final_annotations_array.length] = ann
        }

        if( final_annotations_array.length > 0){

              var entry = final_annotations_array[0]
                  entry.annotation = entry.annotation.annotations.map( (v,i) => {var ann = v; ann.content = Object.keys(ann.content).join(";"); ann.qualifiers = Object.keys(ann.qualifiers).join(";"); return ann} )

              request({
                      url: 'http://localhost:6666/preview',
                      method: "POST",
                      json: {
                        anns: entry
                      }
                }, function (error, response, body) {
                res.send( {"state" : "good", result : body.tableResult, "anns": body.ann} )
              });

        } else {
          res.send({"state" : "empty"})
        }

  } catch (e){

    res.send({"state" : "failed"})
  }


});

app.get('/api/formattedResults', async function (req,res){

       var results = await getAnnotationResults()

       if ( results ){

          var finalResults = {}

          /**
          * There are multiple versions of the annotations. When calling reading the results from the database, here we will return only the latest/ most complete version of the annotation.
          * Independently from the author of it. Completeness here measured as the result with the highest number of annotations and the highest index number (I.e. Newest, but only if it has more information/annotations).
          * May not be the best in some cases.
          *
          */

          for ( var r in results.rows){
            var ann = results.rows[r]
            var existing = finalResults[ann.docid+"_"+ann.page]
            if ( existing ){
              if ( ann.N > existing.N && ann.annotation.annotations.length >= existing.annotation.annotations.length ){
                    finalResults[ann.docid+"_"+ann.page] = ann
              }
            } else { // Didn't exist so add it.
              finalResults[ann.docid+"_"+ann.page] = ann
            }
          }

          var finalResults_array = []
          for (  var r in finalResults ){
            var ann = finalResults[r]
            finalResults_array[finalResults_array.length] = ann
          }

          var formattedRes = '"user","docid","page","corrupted_text","tableType","location","number","content","qualifiers"\n';

          finalResults_array.map( (value, i) => {
            value.annotation.annotations.map( (ann , j ) => {
              try {
                formattedRes = formattedRes+ '"'+value.user
                                          +'","'+value.docid
                                          +'","'+value.page
                                          // +'","'+value.corrupted
                                          +'","'+ (value.corrupted_text == "undefined" ? "" : value.corrupted_text  ).replace(/\"/g,"'")
                                          +'","'+value.tableType
                                          +'","'+ann.location
                                          +'","'+ann.number
                                          +'","'+(Object.keys(ann.content).join(';'))
                                          +'","'+(Object.keys(ann.qualifiers).join(';'))+'"'+"\n"
              } catch (e){
                console.log("an empty annotation, no worries: "+JSON.stringify(ann))
              }

            })
          })

          res.send(formattedRes)
      }

})



app.get('/api/abs_index',function(req,res){

  var output = "";
  for (var i in abs_index){

    output = output + i
              +","+abs_index[i].docid
              +","+abs_index[i].page
              +"\n";

  }

  res.send(output)
});



app.get('/api/totalTables',function(req,res){
  res.send({total : DOCS.length})
});

async function getMMatch(phrase){

  console.log("LOOKING FOR: "+ phrase)

  var result = new Promise(function(resolve, reject) {

    request.post({
        headers: {'content-type' : 'application/x-www-form-urlencoded'},
        url:     'http://localhost:8080/form',
        body:    "input="+phrase+" &args=-AsI+ --JSONn -E"
      }, (error, res, body) => {
      if (error) {
        reject(error)
        return
      }

      var start = body.indexOf('{"AllDocuments"')
      var end = body.indexOf("'EOT'.")

      resolve(body.slice(start, end))
    })


  });

  return result
}

app.get('/api/getMMatch',async function(req,res){
  try{
   if(req.query && req.query.phrase ){

     var mm_match = await getMMatch(req.query.phrase)

     res.send( mm_match )
   } else {
     res.send({status: "wrong parameters", query : req.query})
   }
 }catch (e){
   console.log(e)
 }
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  next()
})

// POST method route
app.post('/saveTableOverride', function (req, res) {


  fs.writeFile("HTML_TABLES_OVERRIDE/"+req.body.docid+"_"+req.body.page+'.html',  req.body.table, function (err) {
    if (err) throw err;
    console.log('Written replacement for: '+req.body.docid+"_"+req.body.page+'.html');
  });

  res.send("alles gut!");

})



app.get('/api/removeOverrideTable', async function(req,res){

  if(req.query && req.query.docid && req.query.page ){

    var file_exists = await fs.existsSync("HTML_TABLES_OVERRIDE/"+req.query.docid+"_"+req.query.page+".html")
    if ( file_exists ) {

      fs.unlink("HTML_TABLES_OVERRIDE/"+req.query.docid+"_"+req.query.page+".html", (err) => {
        if (err) throw err;
        console.log("REMOVED : HTML_TABLES_OVERRIDE/"+req.query.docid+"_"+req.query.page+".html");
      });

    }

    res.send({status: "override removed"})
  } else {
    res.send({status: "no changes"})
  }


});



app.get('/api/classify', async function(req,res){

  if(req.query && req.query.terms){
    console.log(req.query.terms)

    res.send({results : await classify(req.query.terms.split(","))})

  }

});





async function readyTableData(docid,page,method){
  try {
  var docid = docid+"_"+page+".html"

  var htmlFolder = tables_folder+"/"
  var htmlFile = docid

  //If an override file exists then use it!. Overrides are those produced by the editor.
  var file_exists = await fs.existsSync("HTML_TABLES_OVERRIDE/"+docid)

  if ( file_exists ) {
    htmlFolder = "HTML_TABLES_OVERRIDE/"
  }

  console.log("LOADING FROM "+ htmlFolder+" "+file_exists+"  "+"HTML_TABLES_OVERRIDE/"+docid)

  var result = new Promise(function(resolve, reject) {

    try {
    fs.readFile(htmlFolder+htmlFile,
                "utf8",
                function(err, data) {
                  fs.readFile(cssFolder+"/"+"stylesheet.css",
                              "utf8",
                              async function(err2, data_ss) {

                                  var tablePage;

                                  try{
                                      tablePage = cheerio.load(data);
                                      // tablePage("col").removeAttr('style');
                                      if ( !tablePage ){
                                            resolve({htmlHeader: "",formattedPage : "", title: "" })
                                            return;
                                      }
                                  } catch (e){
                                    // console.log(JSON.stringify(e)+" -- " + JSON.stringify(data))
                                    resolve({htmlHeader: "",formattedPage : "", title: "" })
                                    return;
                                  }

                                  var spaceRow = -1;
                                  var htmlHeader = ""

                                  var findHeader = (tablePage, tag) => {
                                    var totalTextChars = 0

                                    var headerNodes = [cheerio(tablePage(tag)[0]).remove()]
                                    var htmlHeader = ""
                                    for ( var h in headerNodes){
                                        // cheerio(headerNodes[h]).css("font-size","20px");
                                        var headText = cheerio(headerNodes[h]).text().trim()
                                        var textLimit = 400
                                        var actualText = (headText.length > textLimit ? headText.slice(0,textLimit-1) +" [...] " : headText)
                                            totalTextChars += actualText.length
                                        htmlHeader = htmlHeader + '<tr ><td style="font-size:20px; font-weight:bold; white-space: normal;">' + encodeURI(actualText) + "</td></tr>"
                                    }

                                    return {htmlHeader, totalTextChars}
                                  }

                                  var possible_tags_for_title = [".headers",".caption",".captions",".article-table-caption"]

                                  for (var t in possible_tags_for_title){

                                    htmlHeader = findHeader(tablePage, possible_tags_for_title[t])
                                    if ( htmlHeader.totalTextChars > 0){
                                      break;
                                    }

                                  }

                                  htmlHeader = "<table>"+htmlHeader.htmlHeader+"</table>"

                                  var htmlHeaderText = cheerio(htmlHeader).find("td").text()

                                  var actual_table = tablePage("table").parent().html();
                                      actual_table = cheerio.load(actual_table);


                                  // The following lines remove, line numbers present in some tables, as well as positions in headings derived from the excel sheets  if present.
                                  var colum_with_numbers = actual_table("tr > td:nth-child(1), tr > td:nth-child(2), tr > th:nth-child(1), tr > th:nth-child(2)")
                                  if ( colum_with_numbers.text().replace( /[0-9]/gi, "").replace(/\s+/g,"").toLowerCase() === "row/col" ){
                                    colum_with_numbers.remove()
                                  }

                                  if ( actual_table("thead").text().trim().indexOf("1(A)") > -1 ){
                                      actual_table("thead").remove();
                                  }
                                  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                      actual_table = actual_table.html();

                                  // var ss = "<style>"+data_ss+" td {width: auto;} tr:hover {background: aliceblue} td:hover {background: #82c1f8} col{width:100pt} </style>"
                                   var formattedPage = actual_table.indexOf("tr:hover" < 0) ? "<div><style>"+data_ss+"</style>"+actual_table+"</div>" : actual_table

                                  // var formattedPage = "<div>"+actual_table+"</div>"


                                  var predictions = await attempt_predictions(actual_table)

                                  var terms_matrix = predictions.map(
                                    e => e.terms.map(
                                      term => prepare_cell_text(term)
                                    )
                                  )

                                  var preds_matrix = predictions.map(
                                    e => e.terms.map(
                                      term => e.pred_class[prepare_cell_text(term)]
                                    )
                                  )

                                  var class_matrix = predictions.map( e => e.cellClasses.map( cellClass => cellClass ))

                                  // values in this matrix represent the cell contents, and can be: "text", "numeric" or ""
                                  var content_type_matrix = predictions.map(
                                    e => e.terms.map(
                                      term => {
                                        var numberless_size = term.replace(/([^A-z0-9 ])/g, "").replace(/[0-9]+/g, '').replace(/ +/g," ").trim().length
                                        var spaceless_size = term.replace(/([^A-z0-9 ])/g, "").replace(/ +/g," ").trim().length

                                        return spaceless_size == 0 ? "" : (numberless_size >= spaceless_size/2 ? "text" : "numeric")

                                      }
                                    )
                                  )

                                  var max_col = 0;
                                  for ( var l=0; l < preds_matrix.length; l++){
                                      max_col = max_col > preds_matrix[l].length ? max_col : preds_matrix[l].length
                                  }


                                  var getTopDescriptors = (N,freqs,ignore) => {
                                    var orderedKeys = Object.keys(freqs).sort( (a,b) => a > b )
                                    for (var i in ignore ){
                                      var toRemove = orderedKeys.indexOf(ignore[i])
                                      if ( toRemove > -1)
                                        orderedKeys.splice(toRemove,1)
                                    }
                                    var limit = orderedKeys.length < N ? orderedKeys.length : N
                                    return orderedKeys.slice(0,limit)
                                  }

                                  var cleanModifier = (modifier) => {
                                    // I used to .replace("firstCol","").replace("firstLastCol","") the modifier.
                                    return modifier.replace("firstCol","empty_row").replace("firstLastCol","empty_row_with_p_value")
                                                   .replace("indent0","indent").replace("indent1","indent")
                                                   .replace("indent2","indent").replace("indent3","indent")
                                                   .replace("indent4","indent").trim()
                                  }

                                  //Estimate column predictions.
                                  var col_top_descriptors = []

                                  for ( var c=0; c < max_col; c++ ){

                                            var content_types_in_column = content_type_matrix.map( (x,i) => [x[c],i]).reduce( (countMap, word) => {
                                               switch (word[0]) {
                                                 case "numeric":
                                                   countMap["total_numeric"] = ++countMap["total_numeric"] || 1
                                                   break;
                                                 case "text":
                                                   countMap["total_text"] = ++countMap["total_text"] || 1
                                                   break;
                                                 default:
                                                   countMap["total_empty"] = ++countMap["total_empty"] || 1
                                               }
                                               return countMap
                                            },{ total_numeric:0, total_text:0, total_empty:0 })

                                            if ( ! ( content_types_in_column.total_text >= content_types_in_column.total_numeric ) ){
                                              continue;
                                            }


                                            var unique_modifiers_in_column = class_matrix.map(x => x[c]).map(cleanModifier).filter((v, i, a) => a.indexOf(v) === i)

                                            for( var u in unique_modifiers_in_column){

                                                var unique_modifier = unique_modifiers_in_column[u]

                                                var column_data = preds_matrix.map( (x,i) => [x[c],i]).reduce( (countMap, word) => {
                                                      var i = word[1]
                                                          word = word[0]
                                                      if ( unique_modifier === cleanModifier(class_matrix[i][c]) ){
                                                        countMap.freqs[word] = ++countMap.freqs[word] || 1
                                                        var max = (countMap["max"] || 0)
                                                        countMap["max"] = max < countMap.freqs[word] ? countMap.freqs[word] : max
                                                        countMap["total"] = ++countMap["total"] || 1
                                                      }
                                                      return countMap
                                                },{total:0,freqs:{}})

                                                var column_terms = preds_matrix.map( (x,i) => [x[c],i]).reduce( (countMap, word) => {

                                                      var i = word[1]
                                                          word = terms_matrix[i][c]
                                                      if ( unique_modifier === cleanModifier(class_matrix[i][c]) ){

                                                        if ( word.length > 0 && word != undefined ){
                                                            if ( countMap[unique_modifier] ){
                                                              countMap[unique_modifier].push(word)
                                                            } else {
                                                              countMap[unique_modifier] = [word]
                                                            }
                                                        }

                                                      }
                                                      return countMap
                                                },{})

                                                for ( var k in column_data.freqs ){ // to qualify for a column descriptor the frequency should at least be half of the length of the column headings.

                                                  if ( (column_data.freqs[undefined] == column_data.max) || column_data.freqs[k] == 1 ) {
                                                      var allfreqs = column_data.freqs
                                                      delete allfreqs[k]
                                                      column_data.freqs = allfreqs
                                                  }
                                                }

                                                switch (METHOD) {
                                                  case "grouped_predictor":

                                                    var all_terms = column_terms[unique_modifier] ? column_terms[unique_modifier].join(" ") : ""

                                                    if ( column_terms[unique_modifier] && all_terms && column_terms[unique_modifier].length > 1 && all_terms.length > 0) { // Only attempt prediction if group contains more than one cell.
                                                      var descriptors = await grouped_predictor( all_terms )
                                                          descriptors = descriptors[all_terms].split(";")
                                                          col_top_descriptors[col_top_descriptors.length] = {descriptors, c , unique_modifier}
                                                    }

                                                    break;
                                                  default:
                                                    var descriptors = getTopDescriptors(3,column_data.freqs,["arms","undefined"])
                                                    if ( descriptors.length > 0)
                                                      col_top_descriptors[col_top_descriptors.length] = {descriptors, c , unique_modifier}

                                                }

                                              }
                                  }

                                  // Estimate row predictions
                                  var row_top_descriptors = []
                                  // debugger
                                  for (var r in preds_matrix){
                                          var content_types_in_row = content_type_matrix[r].reduce( (countMap, word) => {
                                            switch (word) {
                                              case "numeric":
                                                countMap["total_numeric"] = ++countMap["total_numeric"] || 1
                                                break;
                                              case "text":
                                                countMap["total_text"] = ++countMap["total_text"] || 1
                                                break;
                                              default:
                                                countMap["total_empty"] = ++countMap["total_empty"] || 1
                                            }
                                            return countMap
                                         },{ total_numeric:0, total_text:0, total_empty:0 })

                                         if ( ! ( content_types_in_row.total_text >= content_types_in_row.total_numeric ) ){
                                           continue;
                                         }

                                          var row_data = preds_matrix[r].reduce( (countMap, word) => {
                                              countMap.freqs[word] = ++countMap.freqs[word] || 1
                                              var max = (countMap["max"] || 0)
                                              countMap["max"] = max < countMap.freqs[word] ? countMap.freqs[word] : max
                                              countMap["total"] = ++countMap["total"] || 1
                                              return countMap
                                          },{total:0,freqs:{}})

                                          for ( var k in row_data.freqs ){ // to qualify for a row descriptor the frequency should at least be half of the length of the column headings.
                                            if ((row_data.freqs[undefined] == row_data.max) || row_data.freqs[k] == 1 ) {
                                                var allfreqs = row_data.freqs
                                                delete allfreqs[k]
                                                row_data.freqs = allfreqs
                                            }
                                          }

                                          var row_terms = terms_matrix[r].reduce ( (allTerms, term) =>{
                                              if ( term && term.length > 0 ){
                                                allTerms.push(term)
                                              }
                                              return allTerms
                                          },[])

                                          switch (METHOD) {
                                            case "grouped_predictor":

                                              var all_terms = row_terms.join(" ")
                                              if ( row_terms.length > 1 ) { // Only attempt prediction if group contains more than one cell.
                                                var descriptors = await grouped_predictor( all_terms )
                                                    descriptors = descriptors[all_terms].split(";")
                                                    row_top_descriptors[row_top_descriptors.length] = {descriptors,c : r,unique_modifier:""}
                                              }


                                              break;
                                            default:
                                              var descriptors = getTopDescriptors(3,row_data.freqs,["undefined"])
                                              if ( descriptors.length > 0)
                                                row_top_descriptors[row_top_descriptors.length] = {descriptors,c : r,unique_modifier:""}
                                          }

                                  }

                                  var predicted = {
                                                  cols: col_top_descriptors,
                                                  rows: row_top_descriptors,
                                                  predictions : predictions
                                                }
                                  // res.send({status: "good", htmlHeader,formattedPage, title:  titles_obj[req.query.docid.split(" ")[0]], predicted })

                                  resolve({status: "good", htmlHeader,formattedPage, title:  titles_obj[docid.split("_")[0]], predicted })
                              });

                });
        } catch ( e ){
            reject({status:"bad"})
        }
      });
      return result
    } catch (e){
      return {status:"bad"}
    }
}


app.get('/api/getTable',async function(req,res){
   try{
    if(req.query && req.query.docid
      && req.query.page && available_documents[req.query.docid]
      && available_documents[req.query.docid].pages.indexOf(req.query.page) > -1){

      var tableData = await readyTableData(req.query.docid,req.query.page)

      res.send( tableData  )
    } else {
      res.send({status: "wrong parameters", query : req.query})
    }
} catch (e){
  console.log(e)
  res.send({status: "probably page out of bounds, or document does not exist", query : req.query})
}

});

app.get('/api/getAvailableTables',function(req,res){
  res.send(available_documents)
});

app.get('/api/getAnnotations',async function(req,res){
  res.send( await getAnnotationResults() )
});



app.get('/api/deleteAnnotation', async function(req,res){

  var deleteAnnotation = async (docid, page, user) => {
      var client = await pool.connect()

      var done = await client.query('DELETE FROM annotations WHERE docid = $1 AND page = $2 AND "user" = $3', [docid, page, user ])
        .then(result => console.log("Annotation deleted: "+ new Date()))
        .catch(e => console.error(e.stack))
        .then(() => client.release())
  }

  if ( req.query && req.query.docid && req.query.page && req.query.user){
    await deleteAnnotation(req.query.docid , req.query.page, req.query.user)
    res.send("done")
  } else {
    res.send("delete failed");
  }

});


app.get('/api/getAnnotationByID',async function(req,res){

  if(req.query && req.query.docid && req.query.docid.length > 0 ){
    var page = req.query.page && (req.query.page.length > 0) ? req.query.page : 1
    var user = req.query.user && (req.query.user.length > 0) ? req.query.user : ""

              var annotations = await getAnnotationByID(req.query.docid,page,user)

              var final_annotations = {}

              /**
              * There are multiple versions of the annotations. When calling reading the results from the database, here we will return only the latest/ most complete version of the annotation.
              * Independently from the author of it. Completeness here measured as the result with the highest number of annotations and the highest index number (I.e. Newest, but only if it has more information/annotations).
              * May not be the best in some cases.
              *
              */

              for ( var r in annotations.rows){
                var ann = annotations.rows[r]
                var existing = final_annotations[ann.docid+"_"+ann.page]
                if ( existing ){
                  if ( ann.N > existing.N && ann.annotation.annotations.length >= existing.annotation.annotations.length ){
                        final_annotations[ann.docid+"_"+ann.page] = ann
                  }
                } else { // Didn't exist so add it.
                  final_annotations[ann.docid+"_"+ann.page] = ann
                }
              }

              var final_annotations_array = []
              for (  var r in final_annotations ){
                var ann = final_annotations[r]
                final_annotations_array[final_annotations_array.length] = ann
              }

              if( final_annotations_array.length > 0){

                  var entry = final_annotations_array[0]
                  res.send( entry )
              } else {
                  res.send( {} )
              }




  } else{
    res.send( {error:"failed request"} )
  }

});


app.get('/api/recordAnnotation',async function(req,res){

  console.log(JSON.stringify(req.query))

  if(req.query && req.query.docid.length > 0
              && req.query.page.length > 0
              && req.query.user.length > 0
              && req.query.annotation.length > 0 ){
      await insertAnnotation( req.query.docid , req.query.page, req.query.user, {annotations:JSON.parse(req.query.annotation)}, req.query.corrupted, req.query.tableType, req.query.corrupted_text)
  }
  //insertAnnotation("a doucment",2, "a user", {})
  res.send("saved annotation: "+JSON.stringify(req.query))
});

app.listen(PORT, function () {
  console.log('Express Server running on port '+PORT+' ' + new Date().toISOString());
});


//////////////////  Evaluation bit.

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
