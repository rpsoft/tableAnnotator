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

var available_documents = {}
var abs_index = []


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ihw_annotator',
  password: 'melacome86',
  port: 5432,
})


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
          prev_data.maxPage = page > prev_data.maxPage ? page : prev_data.maxPage
          available_documents[docid] = prev_data
    } else {
          available_documents[docid] = {pages : [ page ] , extension, maxPage : page}
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

async function insertAnnotation(docid, page, user, annotation){
  var client = await pool.connect()
  var done = await client.query('INSERT INTO annotations VALUES($1,$2,$3,$4)', [docid, page, user, annotation])
  await client.end()
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

app.get('/api/abs_index',function(req,res){
  res.send(abs_index)
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

        fs.readFile("/home/suso/ihw/tableAnnotator/Server/HTML_TABLES/"+docid+"_files/sheet001.html",
                    "utf8",
                    function(err, data) {
                      fs.readFile("/home/suso/ihw/tableAnnotator/Server/HTML_TABLES/"+docid+"_files/stylesheet.css",
                                  "utf8",
                                  function(err, data_ss) {
                                      var tablePage = cheerio.load(data);
                                      var actual_table = tablePage("table").parent().html()
                                      var ss = "<style>"+data_ss+" td {width: auto;} </style>"
                                      var formattedPage = "<html><head>"+ss+"</head>"+actual_table+"</html>"
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

app.get('/api/getAnnotation',function(req,res){
  res.send("annotaion")
});

app.get('/api/recordAnnotation',function(req,res){

  console.log(req.query)
  //insertAnnotation("a doucment",2, "a user", {})
  res.send("saved annotation: "+req.query)
});

app.listen(PORT, function () {
  console.log('Express Server running on port '+PORT+' ' + new Date().toISOString());
});
