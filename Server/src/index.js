var express = require('express');
var app = express();
var html = require("html");
var fs = require('fs');
var request = require("request");
const cheerio = require('cheerio');
const { Pool, Client } = require('pg')

const csv = require('csv-parser');
const fs = require('fs');

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}
var cors = require('cors');

// use it before all route definitions
app.use(cors({origin: '*'}));

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
// import {DOCS} from "./docList"

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

// const XmlReader = require('xml-reader');
// const xmlQuery = require('xml-query');

var ops_counter = 0;

var available_documents = {}
var abs_index = []


var tables_folder = "HTML_TABLES"
var cssFolder = "HTML_STYLES"
var DOCS = [];

var clusterTerms = {}

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

//
// fs.createReadStream('./CLUSTERS/testing_terms_canada.csv')
//   .pipe(csv())
//   .on('data', async (row) => {
//
//     var terms = row.terms
//
//     clusterTerms[terms] = true
//
//   })
//   .on('end', () => {
//     clusterTerms = Object.keys(clusterTerms)
//
//     console.log('read '+clusterTerms.length+' terms');
//
//   });



// options: frequency ; grouped_predictor ;
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
    return text.replace(/[0-9]+/g, '$nmbr$').replace(/([^A-z0-9 ])/g, " $1 ").replace(/ +/g," ").trim().toLowerCase()
}




function prepareAvailableDocuments(){

  var fixVersionOrder = (a) => {
  	var i = a.indexOf("v");
  	if ( i > -1 ){
  		return a.slice(0,i)+a.slice(i+2,a.length)+a.slice(i,i+2)
      } else {
  		return a;
      }

  }

  // console.log("preparing filed")
  fs.readdir(tables_folder, function(err, items) {

      DOCS = items.sort(  (a,b) => {return fixVersionOrder(a).localeCompare(fixVersionOrder(b))} );

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

      debugger

      console.log("DLEN: " +DOCS.length)
  });
}

async function getAnnotationResults(){

  var client = await pool.connect()
  var result = await client.query(`select * from annotations order by docid desc,page asc`)
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
      //var term = terms[t].replace(/[/(){}\[\]\|@,;]/g, " ").replace(/[^a-z #+_]/g,"").trim().toLowerCase()

      var term = prepare_cell_text(terms[t])

      if (term.length > 0){
        if ( term.replace(/[^a-z]/g,"").length > 2 ){ // na's and "to" as part of ranges matching this length. Potentially other rubbish picked up here.
          cleanTerms[cleanTerms.length] = term
        }
      }
    }

    if ( cleanTerms.length > 0 ){
      //console.log(cleanTerms)
    //  debugger
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

  //debugger
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
          // debugger
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


  console.log("Awaiting done: "+(ops_counter++))
  // await client.end()
  console.log("DONE: "+(ops_counter++))
}

// preinitialisation of components if needed.
function main(){
  // prepare available_documents variable
  prepareAvailableDocuments()

}

main();

app.get('/',function(req,res){
  res.send("this is home")
});

app.get('/api/allMetaData',function(req,res){

  res.send({
    abs_index,
    total : DOCS.length,
    available_documents
  })
});



async function updateClusterAnnotation(cn,concept,cuis,isdefault,cn_override){

  var client = await pool.connect()

  var done = await client.query('INSERT INTO clusters VALUES($1,$2,$3,$4,$5) ON CONFLICT (concept) DO UPDATE SET isdefault = $4, cn_override = $5;', [cn,concept,cuis,isdefault.toLowerCase() == 'true',cn_override])
    .then(result => console.log("insert: "+ result))
    .catch(e => console.error(e.stack))
    .then(() => client.release())

  console.log("Awaiting done: "+(ops_counter++))
  console.log("DONE: "+(ops_counter++))
}




app.get('/api/allClusterAnnotations', async function(req,res){

  var allClusterAnnotations = async () => {
    var client = await pool.connect()
    var result = await client.query(`select COALESCE(clusters.cn_override, clusters.cn) as cn,concept,rep_cuis,excluded_cuis,status from clusters,clusterdata where clusters.cn = clusterdata.cn ORDER BY cn asc,concept asc`)
          client.release()
    return result
  }

  res.send( await allClusterAnnotations() )

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
        .then(result => console.log("insert: "+ result))
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

  var setClusterData = async (cn,rep_cuis,excluded_cuis,status) => {
      var client = await pool.connect()
      var done = await client.query('INSERT INTO clusterdata VALUES($1,$2,$3,$4) ON CONFLICT (cn) DO UPDATE SET rep_cuis = $2, excluded_cuis = $3, status = $4 ;', [cn,rep_cuis,excluded_cuis,status])
        .then(result => console.log("insert: "+ result))
        .catch(e => console.error(e.stack))
        .then(() => client.release())

  }

  if ( req.query && req.query.cn && req.query.status){
    await setClusterData(req.query.cn, req.query.rep_cuis || "", req.query.excluded_cuis || "", req.query.status)
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
      await updateClusterAnnotation( req.query.cn , req.query.concept, req.query.cuis, req.query.isdefault, req.query.cn_override)
  }

  res.send("saved cluster annotation: "+JSON.stringify(req.query))
});

app.get('/api/cuisIndex',async function(req,res){

      var cuis = {}

      fs.createReadStream('./CLUSTERS/cuis-index.csv')
        .pipe(csv())
        .on('data', async (row) => {
          cuis[row.CUI] = {preferred : row.preferred, hasMSH: row.hasMSH}
        })
        .on('end', () => {
          res.send(cuis)
        });

});


app.get('/api/allPredictions', async function(req,res){
  console.log("getting all predictions")

  var predictions = "user,docid,page,corrupted,tableType,location,number,content,qualifiers\n"

  for ( var a in available_documents){
    for ( var p in available_documents[a].pages ) {
      console.log(a+"  --  "+p)
       var page = available_documents[a].pages[p]
       var docid = a
       var data = await readyTableData(docid,page)

       for ( var c in data.predicted.cols) {
         var col = data.predicted.cols[c]
         predictions += ["auto_"+METHOD,docid,page,false,"na","Col",(parseInt(col.c)+1),col.descriptors.join(";"),col.unique_modifier.split(" ").join(";")].join(",")+"\n"
       }

       for ( var r in data.predicted.rows) {
         var row = data.predicted.rows[r]
         predictions += ["auto_"+METHOD,docid,page,false,"na","Row",(parseInt(row.c)+1),row.descriptors.join(";"),row.unique_modifier.split(" ").join(";")].join(",")+"\n"
       }

    }
  }

  res.send(predictions)
});


app.get('/api/rscript',async function(req,res){

  try{

    var result = R("./src/tableScript.R")

        result = result.data("hello world", 20)
      .callSync()

      res.send( JSON.stringify(result) )

  } catch (e){

    res.send("FAIL: "+ e)
  }
});

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

        // console.log("FINAL: " +JSON.stringify(final_annotations))

        var final_annotations_array = []
        for (  var r in final_annotations ){
          var ann = final_annotations[r]
          final_annotations_array[final_annotations_array.length] = ann
        }


        // console.log("FINAL2: " +JSON.stringify(final_annotations_array))

        if( final_annotations_array.length > 0){

              var result = R("./src/tableScript.R")
                  var entry = final_annotations_array[0]
                      entry.annotation = entry.annotation.annotations.map( (v,i) => {var ann = v; ann.content = Object.keys(ann.content).join(";"); ann.qualifiers = Object.keys(ann.qualifiers).join(";"); return ann} )

                  console.log("ENTRY:: "+JSON.stringify(entry))
                  result = result.data(entry)
                .callSync()

                // console.log(JSON.stringify(result))
                var toreturn = {"state" : "good", result }
                res.send( toreturn )
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
                // debugger;
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
        body:    "input="+phrase+" &args=--JSONn -E"
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



app.get('/api/classify', async function(req,res){

  if(req.query && req.query.terms){
    console.log(req.query.terms)

    res.send({results : await classify(req.query.terms.split(","))})

  }

});


async function readyTableData(docid,page,method){
  var docid = docid+"_"+page+".html"

  var htmlFolder = tables_folder+"/"
  var htmlFile = docid

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
                                        htmlHeader = htmlHeader + '<tr ><td style="font-size:20px; font-weight:bold; white-space: normal;">' + actualText + "</td></tr>"
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
                                  var formattedPage = "<div><style>"+data_ss+"</style>"+actual_table+"</div>"


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
                                                  rows: row_top_descriptors
                                                }
                                  // res.send({status: "good", htmlHeader,formattedPage, title:  titles_obj[req.query.docid.split(" ")[0]], predicted })
                                  resolve({status: "good", htmlHeader,formattedPage, title:  titles_obj[docid.split(" ")[0]], predicted })
                              });

                });
        } catch ( e ){
            reject(e)
        }
      });
      return result
}


app.get('/api/getTable',async function(req,res){
  //debugger
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
