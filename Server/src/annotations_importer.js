const csv = require('csv-parser');
const fs = require('fs');

const { Pool, Client } = require('pg')

// Postgres configuration.
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ihw_annotator',
    password: 'melacome86',
    port: 5432,
  })

var myArgs = process.argv.slice(2);
console.log('Importing Annotations CSV file into DB: ', myArgs[0]);

var AllData = {}

var ignorables = ["NA","undefined"]

var dataAdder = (acc,item) => {

  // "baseline_level_1"
  // "subgroup_name"
  // "characteristic_name"

  // "characteristic_level"
  // "baseline_level_2
  // "subgroup_level"

  if (ignorables.indexOf(item) < 0 ){

    if ( ["baseline_level_1","subgroup_name"].indexOf(item) > -1 ){
        item = "characteristic_name"
    }

    if ( ["baseline_level_2","subgroup_level"].indexOf(item) > -1 ){
        item = "characteristic_level"
    }

    acc[item] = true;
  }

  return acc
}

async function insertAnnotation(docid, page, user, annotation, corrupted, tableType, corrupted_text){

  var client = await pool.connect()

  var done = await client.query('INSERT INTO annotations VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (docid, page,"user") DO UPDATE SET annotation = $4, corrupted = $5, "tableType" = $6, "corrupted_text" = $7 ;', [docid, page, user, annotation, corrupted,tableType, corrupted_text])
    .then(result => console.log("insert: "+ result))
    .catch(e => console.error(e.stack))
    .then(() => client.release())

}

fs.createReadStream(myArgs[0])
  .pipe(csv({ separator: ';' }))
  .on('data', (data) => {

    var currentData = AllData[data.user+"_"+data.docid+"_"+data.page]

    if ( !currentData ){
      currentData = {
        docid : data.docid,
        user : data.user,
        page : data.page,
        annotation : [],
        corrupted : false,
        tableType : data.tableType,
        corrupted_text:  ignorables.indexOf(data.corrupted_text) > -1 ? "" : data.corrupted_text
      }
    }

    // "baseline_level_1"
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
      content: data.content.split(";").reduce( (acc,item) => {return dataAdder(acc,item)},{}),
      qualifiers: data.qualifiers.split(";").reduce( (acc,item) => {return dataAdder(acc,item)},{}),
      number: data.number,
    })

    console.log(JSON.stringify(currentData))
    AllData[data.user+"_"+data.docid+"_"+data.page] = currentData
  })
  .on('end', async () => {
      console.log(AllData)
      var keys = Object.keys(AllData)

      for ( var i = 0; i < keys.length; i++)
      {
        var key = keys[i]

        var currentDoc = AllData[key]

        await insertAnnotation(currentDoc.docid, currentDoc.page, currentDoc.user, {"annotations": currentDoc.annotation}, currentDoc.corrupted, currentDoc.tableType, currentDoc.corrupted_text)
        console.log("inserted "+i+"/"+keys.length)
      }
      console.log("done")
  });
