var express = require('express');
var app = express();
var html = require("html");
var fs = require('fs');
var request = require("request");
const cheerio = require('cheerio');
const { Pool, Client } = require('pg')

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
import {DOCS} from "./docList"

import {TITLES} from "./titles"

var titles_obj = {}

for ( var t in TITLES) {
  titles_obj[TITLES[t].pmid.split(" ")[0]] = { title: TITLES[t].title, abstract: TITLES[t].abstract }
}

// const XmlReader = require('xml-reader');
// const xmlQuery = require('xml-query');

var ops_counter = 0;

var available_documents = {}
var abs_index = []

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



function prepareAvailableDocuments(){

  console.log("DLEN: " +DOCS.length)
  // Preparing the variable to hold all data records.
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
`;

console.log(process.cwd())

python.ex`
  sgd = pickle.load(open("./src/sgd_multiterm.sav", 'rb'))
  def classify(h):
    d={}
    result = sgd.predict(h)
    for r in range(0,len(h)):
      d[h[r]] = result[r]
    return d
`;


async function classify(terms){

  var result = new Promise(function(resolve, reject) {
    var cleanTerms = []

    for( t in terms ){
      var term = terms[t].replace(/[/(){}\[\]\|@,;]/g, " ").replace(/[^a-z #+_]/g,"").trim().toLowerCase()
      if (term.length > 0){
        if ( term.replace(/[^a-z]/g,"").length > 2 ){ // na's and "to" as part of ranges matching this length. Potentially other rubbish picked up here.
          cleanTerms[cleanTerms.length] = term
        }
      }
    }

    if ( cleanTerms.length > 0 ){
      console.log(cleanTerms)

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


async function attempt_predictions(actual_table){
  var result = new Promise(async function(resolve, reject) {
    try{
      var a = cheerio.load(actual_table)

      var lines = a("tr")

      var predictions = new Array(lines.length)

      for( var l = 0; l < lines.length; l++ ){
          var currentLine = cheerio(lines[l])
          var terms = []

          for ( var c = 0 ; c < currentLine.children().length; c++){
            terms[terms.length] = cheerio(currentLine.children()[c]).text().trim().replace(/\n/g, " ").toLowerCase()
          }

          var pred_class = await classify(terms)
          predictions[l] = {pred_class,terms}
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
  //
  // INSERT INTO annotations
  // VALUES ('28246237',2,'jesus','{"annotations":[{"location":"Row","content":{"arms":true},"qualifiers":{"bold":true},"number":"1"}]}','false','subgroup table')
  // ON CONFLICT (docid, page,"user") DO UPDATE
  // SET annotation = '{"annotations":[{"location":"Row","content":{"arms":true},"qualifiers":{"bold":true},"number":"1"}]}',corrupted = 'false',"tableType" = 'subgroup table';
  //

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


app.get('/api/rscript',async function(req,res){

  try{

    var result = R("./src/tableScript.R")
    // debugger
        result = result.data("hello world", 20)
      .callSync()

      res.send( JSON.stringify(result) )

  } catch (e){
    // debugger
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

app.get('/api/classify', async function(req,res){

  if(req.query && req.query.terms){
    console.log(req.query.terms)

    res.send({results : await classify(req.query.terms.split(","))})

  }

});



app.get('/api/getTable',function(req,res){
  //debugger
   try{


    if(req.query && req.query.docid
      && req.query.page && available_documents[req.query.docid]
      && available_documents[req.query.docid].pages.indexOf(req.query.page) > -1){

        var docid = req.query.docid+"_"+req.query.page+".xlsx"

        // console.log("GET TABLE CALLED0: "+"HTML_TABLES/"+docid+"_files")
        //
        // if (!fs.existsSync("HTML_TABLES/"+docid+"_files")) {
        //     docid = req.query.docid + "_" + req.query.page;
        // }
        //
        //

        var htmlFolder = "HTML_TABLES/"+docid+"_files/"
        var htmlFile = "sheet001.html"

        console.log("GET TABLE CALLED: "+htmlFolder+htmlFile)

        if (!fs.existsSync(htmlFolder+htmlFile)) {

            docid = req.query.docid+"_"+req.query.page
            htmlFolder = "HTML_TABLES/"+docid+"_files/"
            htmlFile = "sheet001.htm"
            console.log("GET TABLE CALLED Corrected: "+htmlFolder+htmlFile)
        }

        console.log("GET TABLE CALLED: "+htmlFile)

        fs.readFile(htmlFolder+htmlFile,
                    "utf8",
                    function(err, data) {
                      fs.readFile(htmlFolder+"stylesheet.css",
                                  "utf8",
                                  async function(err2, data_ss) {

                                      var tablePage;

                                      try{
                                          tablePage = cheerio.load(data);
                                          tablePage("col").removeAttr('style');
                                          if ( !tablePage ){
                                                res.send({htmlHeader: "",formattedPage : "", title: "" })
                                                return;
                                          }
                                      } catch (e){
                                        console.log(JSON.stringify(e)+" -- " + JSON.stringify(data))
                                        res.send({htmlHeader: "",formattedPage : "", title: "" })
                                        return;
                                      }

                                      var spaceRow = -1;

                                      var headerNodes = []



                                      var maxOUT = 0
                                      while (true){
                                        if ( cheerio(tablePage("table").find("tr")[0]).text().trim().length < 1){
                                          cheerio(tablePage("table").find("tr")[0]).remove()
                                          break;
                                        }


                                        headerNodes.push(cheerio(tablePage("table").find("tr")[0]).remove())

                                        if ( maxOUT++ > 10){
                                          break
                                        }
                                      }

                                      var htmlHeader = ""

                                      for ( var h in headerNodes){
                                          // cheerio(headerNodes[h]).css("font-size","20px");
                                          var headText = cheerio(headerNodes[h]).text().trim()
                                          var textLimit = 400
                                          htmlHeader = htmlHeader + '<tr ><td style="font-size:20px; font-weight:bold; white-space: normal;">' + (headText.length > textLimit ? headText.slice(0,textLimit-1) +" [...] " : headText) + "</td></tr>"
                                      }

                                          htmlHeader = "<table>"+htmlHeader+"</table>"



                                      var actual_table = tablePage("table").parent().html()

                                      var ss = "<style>"+data_ss+" td {width: auto;} tr:hover {background: aliceblue} td:hover {background: #82c1f8} col{width:100pt} </style>"
                                      var formattedPage = "<div>"+ss+"</head>"+actual_table+"</div>"


                                      var predictions = await attempt_predictions(actual_table)

                                      /// this should really go into a function.
                                      var preds_matrix = predictions.map( e => e.terms.map( term => e.pred_class[term.replace(/[/(){}\[\]\|@,;]/g, " ").replace(/[^a-z #+_]/g,"").trim()])) // hell of a line!

                                      debugger
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


                                      //Estimate column predictions.
                                      debugger
                                      var col_top_descriptors = {}

                                      for ( var c=0; c < max_col; c++ ){
                                        var column_data = preds_matrix.map(x => x[c]).reduce( (countMap, word) => {
                                              countMap.freqs[word] = ++countMap.freqs[word] || 1
                                              var max = (countMap["max"] || 0)
                                              countMap["max"] = max < countMap.freqs[word] ? countMap.freqs[word] : max
                                             	countMap["total"] = ++countMap["total"] || 1
                                              return countMap
                                        },{total:0,freqs:{}})

                                        for ( var k in column_data.freqs ){ // to qualify for a row descriptor the frequency should at least be half of the length of the column headings.

                                          if ( (column_data.freqs[undefined] == column_data.max) || column_data.freqs[k] == 1 ) {
                                              var allfreqs = column_data.freqs
                                              delete allfreqs[k]
                                              column_data.freqs = allfreqs
                                          }
                                        }

                                        var descriptors = getTopDescriptors(3,column_data.freqs,["arms","undefined"])

                                        if ( descriptors.length > 0)
                                          col_top_descriptors[c] = descriptors
                                      }

                                      // Estimate row predictions

                                      var row_top_descriptors = {}
                                      // debugger
                                      for (var r in preds_matrix){
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

                                          var descriptors = getTopDescriptors(3,row_data.freqs,["undefined"])

                                          if ( descriptors.length > 0)
                                            row_top_descriptors[r] = descriptors
                                      }


                                      var predicted = { cols: col_top_descriptors, rows: row_top_descriptors}

                                      res.send({status: "good", htmlHeader,formattedPage, title:  titles_obj[req.query.docid.split(" ")[0]], predicted })
                                  });

                    });

    } else {
      res.send({status: "wrong parameters", query : req.query})
    }

} catch (e){
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
