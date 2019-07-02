// transform cluster and cuis data in CSV to matrix of 1s and 0s.

function processFile(inputFile) {


        var AllCuis = []

        var ConceptCUIs = {}

        var fs = require('fs'),
            readline = require('readline'),
            instream = fs.createReadStream(inputFile),
            outstream = new (require('stream'))(),
            rl = readline.createInterface(instream, outstream);

        rl.on('line', function (line) {

          if ( line.indexOf("concept,cuis,hasMesh,number") > -1 ){
            return;
          }

          var elements = line.split(",")

          if ( elements[1] ){
            var cuis = elements[1].split(";")

            var hasMSH = elements[2].split(";")

            var MSH_only_cuis = []; for (var c in cuis ){
                    if ( hasMSH[c] == "true" ){
                        MSH_only_cuis.push(cuis[c])
                    }
                }
            cuis = MSH_only_cuis

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
