function processFile(inputFile) {


        var AllCuis = []

        var ConceptCUIs = {}

        var fs = require('fs'),
            readline = require('readline'),
            instream = fs.createReadStream(inputFile),
            outstream = new (require('stream'))(),
            rl = readline.createInterface(instream, outstream);

        rl.on('line', function (line) {

          var elements = line.split(",")




          if ( elements[1] ){
            var cuis = elements[1].split(";")
                cuis = [...new Set(cuis.map(x => x))]

            ConceptCUIs[elements[0]] = cuis

            AllCuis = AllCuis.concat(cuis)

          }

        });

        rl.on('close', function (line) {

                var unique_cuis = [...new Set(AllCuis.map(x => x))]

                  console.log("concept,"+unique_cuis.join(","))
                  for ( var c in ConceptCUIs ){

                   var csvLine = c

                   for ( var i = 0; i < unique_cuis.length; i++){
                     csvLine = csvLine+","+( ConceptCUIs[c].indexOf(unique_cuis[i]) > -1 ? 1 : 0 )

                   }

                   console.log(csvLine)

                  }



        });

}


processFile('cuis.csv');
