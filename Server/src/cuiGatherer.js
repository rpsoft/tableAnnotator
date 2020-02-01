var fs = require('fs')
var request = require("request");
const csv = require('csv-parser');

var clusterTerms = {}
var cui_freqs = {}

Object.defineProperty(Array.prototype, 'flat', {
    value: function(depth = 1) {
      return this.reduce(function (flat, toFlatten) {
        return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
      }, []);
    }
});

async function getMMatch(phrase){

  //console.log("LOOKING FOR: "+ phrase)

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


function extractMMData (r) {
  try{
    r = JSON.parse(r)

    debugger

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

fs.createReadStream('./CLUSTERS/all_terms_June_2019.csv')
  .pipe(csv())
  .on('data', async (row) => {

    var terms = row.terms

    clusterTerms[terms] = true

  })
  .on('end', () => {
    clusterTerms = Object.keys(clusterTerms)

    console.log('read '+clusterTerms.length+' terms');
    getCUIS()
  });



async function getCUIS(){

    var csvWriter = fs.createWriteStream('CLUSTERS/cuis.csv', {
      flags: 'w'
    })

    csvWriter.write("terms\n")

    var indexWriter = fs.createWriteStream('CLUSTERS/cuis-index.csv', {
      flags: 'w'
    })

    indexWriter.write("CUI,preferred,hasMSH\n")

    var CUIs = []

     for ( var i = 0; i < clusterTerms.length; i++){


       var phrase = clusterTerms[i]
           phrase = phrase.toLowerCase().replace(/\$nmbr\$/g," ").replace(/[\W_]+/g," ") // this nmbr to avoid the "gene problem"

       var phrase_terms = phrase.split(" ")

       var mmdata = []

       if(phrase_terms.length > 25){

          while ( phrase_terms.length >= 10 ) {
              var search_terms = phrase_terms.splice(0,10)
              var mmdata_inter = await getMMatch(search_terms.join(" "))
                  mmdata_inter = extractMMData(mmdata_inter)
                  mmdata = mmdata.concat(mmdata_inter)
          }

          if ( phrase_terms.length > 0){
              var mmdata_inter = await getMMatch(phrase_terms.join(" "))
                  mmdata_inter = extractMMData(mmdata_inter)
                  mmdata = mmdata.concat(mmdata_inter)
          }

       } else {
          mmdata = await getMMatch(phrase)
          mmdata = extractMMData(mmdata)
       }


      var csvLine = clusterTerms[i].replace(/;/gi,"").replace(/,/gi,"")+","+
                                      mmdata.map( c => {
                                                  if ( CUIs.indexOf(c.CUI) < 0){
                                                    CUIs.push(c.CUI);
                                                    indexWriter.write(c.CUI+","+c.preferred+","+c.hasMSH+"\n")
                                                  }

                                                  if ( cui_freqs[c.CUI] ) {
                                                    cui_freqs[c.CUI] = cui_freqs[c.CUI] + 1
                                                  } else {
                                                    cui_freqs[c.CUI] = 1
                                                  }

                                                  return c.CUI
                                                }).join(";")+","+
                                      mmdata.map( c => c.hasMSH ).join(";")+","+i+"/"+clusterTerms.length

       csvWriter.write(csvLine+"\n")
       console.log((i+1)+"/"+clusterTerms.length + " -- "+clusterTerms[i])
     }
     csvWriter.end()
     indexWriter.end()

     var freqWriter = fs.createWriteStream('CLUSTERS/cuis-freqs.csv', {
       flags: 'w'
     })

     freqWriter.write("CUI,freq\n")

     Object.keys(cui_freqs).map( c => freqWriter.write(c+","+cui_freqs[c]+"\n"))


     freqWriter.end()

     console.log("finished")
}
