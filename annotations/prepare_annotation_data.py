# This 

import os
import csv
import ctypes
import re
import pandas as pd


csv.field_size_limit(int(ctypes.c_ulong(-1).value // 2))
csv.field_size_limit()

pattern = re.compile('[^A-z]+')
number_pattern = re.compile('[0-9]+')
symbol_pattern = re.compile(r'([^A-z0-9 ])')
multiple_ws_pattern = re.compile(' +')


def cleanTerm (term):
    term = number_pattern.sub("$nmbr$",term)  # This one changes numbers by the string "nmbr" to preserve information such as number ranges. (age ranges, etc)
    # term = pattern.sub(' ', term).lower().strip()
    term = symbol_pattern.sub(" \\1 ",term)
    term = multiple_ws_pattern.sub(" ",term)
    term = term.lower().strip()
    return term


# Reads annotation files, in the format produced by "extractAnnotations.R" into a table where first column is the annotation type, and second is the content of text in cells annotated
# Idea is to be able to classify unseen text within cells, as "arm", "measure", "characteristic_name", etc.
def readAndPrepareAnnotations(filename, uniqueTerms=False):

    data = {'descriptor': [], 'terms': []}

    possible_headers = ['docid_page', 'baseline_level_1', 'baseline_level_2', 'arms', 'measures', 'subgroup_name', 'subgroup_level', 'p-interaction', 'outcomes', 'other', 'time/period']
    override_headers = ['docid_page', 'characteristic_name', 'characteristic_level', 'arms', 'measures', 'characteristic_name', 'characteristic_level', 'p-interaction', 'outcomes', 'other', 'time/period']

    with open(os.path.join(filename), 'r') as file:
        target_doc = csv.reader(file, delimiter=",", quotechar='"')
        headers = []
        rowCount = 0

        temp_data = []

        currentDocid = ""
        
        for row in target_doc:
            
            if ( rowCount == 0):
                
                for col in row:
               
                    cleanHeader = []
                    hedCount = 0
                    for hed in possible_headers:
                        if hed in col:
                            cleanHeader.append(override_headers[hedCount])
                        hedCount = hedCount+1             
                    headers.append(";".join(cleanHeader))
               
            else:
                if ( currentDocid != row[0]):        
                    currentDocid = row[0]
                    
                    # When changing docid we should store away data, and prepare for next docid.
                    if ( len(temp_data) > 0 ):                    
                        for i in range(len(temp_data)):
                            if ( len(temp_data[i]) > 1 ):
                                data['descriptor'].append( temp_data[i].pop(0) )
                                if ( uniqueTerms ):
                                    data['terms'].append( list(set(temp_data[i])))
                                else:
                                    data['terms'].append( temp_data[i] )
                    temp_data = []
                    for i in range(len(row)):
                        temp_data.append([])
                
                colCount = -1
               
                for col in row:
                    colCount = colCount+1             
                    if ( colCount > 0):
                        if( len(temp_data[colCount]) == 0 ):                        
                            temp_data[colCount].append(headers[colCount])
                        if ( col != 'NA'):
                            temp_data[colCount].append(cleanTerm (col))
 
            rowCount = rowCount+1

    return data
            
removeDuplicates = False

data1 = readAndPrepareAnnotations("first/extracted.csv",removeDuplicates)
data2 = readAndPrepareAnnotations("second/extracted.csv",removeDuplicates)

data1 = pd.DataFrame(data=data1)
data2 = pd.DataFrame(data=data2)

fullData = pd.concat([data1,data2])



fullData