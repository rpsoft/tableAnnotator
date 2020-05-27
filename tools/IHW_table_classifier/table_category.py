import os
import csv

from clean import *

data = dict()

with open(os.path.join("learnData.csv"), 'r') as file:
    target_doc = csv.reader(file, delimiter=";", quotechar='"')
    for row in target_doc:
        for col in row:
            if len(col) > 1:
                elements = col.split("$")
                onlyKeys = dict()

                for e in elements :
                    onlyKeys[e] = True

                if row[0] in data.keys() :
                    data[row[0]].append(list(onlyKeys.keys()))
                else:
                    data[row[0]] = list(onlyKeys.keys())


csv = open("cleandata.csv", "w")

for key in data:
    sentences = data[key]
    if ( key in ['row','col','value']):
        continue

    for s in sentences:
        # print(s.join(" "))
        if ( "".join(s) == key ):
            continue
        csv.write(key+", "+  clean_text(" ".join(s).replace(";"," "))+"\n")

csv.close()
