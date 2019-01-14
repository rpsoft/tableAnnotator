var express = require('express');
var app = express();
var html = require("html");
var fs = require('fs');
var request = require("request");
const cheerio = require('cheerio');
const { Pool, Client } = require('pg')


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

// async function connectDB(){
//
//   var client = await pool.connect()
//   var result = await client.query({
//     rowMode: 'array',
//     text: 'SELECT * FROM annotations;'
//   })
//
//   console.log("rows: "+ result.rows) // [1, 2]
//   await client.end()
//
// }

async function getAnnotationResults(){

  var client = await pool.connect()
  var result = await client.query(`select * from annotations order by docid desc,page asc`)
        client.release()
  return result
}


async function insertAnnotation(docid, page, user, annotation, corrupted, tableType){

  var client = await pool.connect()
  var done = await client.query('INSERT INTO annotations VALUES($1,$2,$3,$4,$5,$6)', [docid, page, user, annotation, corrupted,tableType])
    .then(result => console.log(result))
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

    var result = R("./src/test.R")

      result = result.data("hello world", 20)
      .callSync()

      res.send( JSON.stringify(result) )

  } catch (e){
    res.send("FAIL: "+ e)
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


app.get('/api/getTable',function(req,res){
  //debugger
  // try{
  console.log("GET TABLE CALLED")



    if(req.query && req.query.docid
      && req.query.page && available_documents[req.query.docid]
      && available_documents[req.query.docid].pages.indexOf(req.query.page) > -1){

        var docid = req.query.docid+"_"+req.query.page+".xlsx"

        fs.readFile("HTML_TABLES/"+docid+"_files/sheet001.html",
                    "utf8",
                    function(err, data) {
                      fs.readFile("HTML_TABLES/"+docid+"_files/stylesheet.css",
                                  "utf8",
                                  function(err, data_ss) {
                                      var tablePage = cheerio.load(data);
                                          tablePage("col").removeAttr('style');
                                      var actual_table = tablePage("table").parent().html()
                                      var ss = "<style>"+data_ss+" td {width: auto;} tr:hover {background: aliceblue} col{width:100pt} </style>"
                                      var formattedPage = "<div>"+ss+"</head>"+actual_table+"</div>"
                                      res.send(formattedPage)
                                  });

                    });

    } else {
      res.send({status: "wrong parameters", query : req.query})
    }

// } catch (e){
//   res.send({status: "probably page out of bounds, or document does not exist", query : req.query})
// }

});

app.get('/api/getAvailableTables',function(req,res){
  res.send(available_documents)
});

app.get('/api/getAnnotations',async function(req,res){
  res.send( await getAnnotationResults() )
});

app.get('/api/recordAnnotation',async function(req,res){

  console.log(JSON.stringify(req.query))

  if(req.query && req.query.docid.length > 0
              && req.query.page.length > 0
              && req.query.user.length > 0
              && req.query.annotation.length > 0 ){
      await insertAnnotation( req.query.docid , req.query.page, req.query.user, {annotations:JSON.parse(req.query.annotation)}, req.query.corrupted, req.query.tableType)
  }
  //insertAnnotation("a doucment",2, "a user", {})
  res.send("saved annotation: "+JSON.stringify(req.query))
});

app.listen(PORT, function () {
  console.log('Express Server running on port '+PORT+' ' + new Date().toISOString());
});
