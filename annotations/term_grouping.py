from leven import levenshtein       
import numpy as np
from sklearn.cluster import dbscan
import pandas as pd
from sklearn.preprocessing import OneHotEncoder

from prepare_annotation_data import fullData

data = ["melame", "melacome", "gato", "gatear", "perro","perro","perro","perro","perro", "perrear", "melaucho", "", "ohcualem"]

bigArray = []

fullData = fullData[fullData.descriptor.isin(['characteristic_name', 'characteristic_level'])]

for arr in range(1,len(fullData)):
    descriptor = fullData["descriptor"][arr]
    terms = " ".join(set(fullData["terms"][arr]))
    bigArray = bigArray+innerArray

    print(arr)
    


bigArray = list(set(bigArray)) 

data = bigArray

def lev_metric(x, y):
    i, j = int(x[0]), int(y[0])     # extract indices
    score = levenshtein(data[i], data[j])
    
    return score

onehotencoder = OneHotEncoder(handle_unknown='ignore')
transformed = onehotencoder.fit_transform(fullData["descriptor"]).toarray()
X1 = np.concatenate([X[:, :2], transformed, X[:, 4:]], axis=1)

X = np.arange(len(fullData)).reshape(-1, 1)

X

classes = dbscan(fullData, metric=lev_metric, eps=3, min_samples=2)

data
classes

clustered_data = {}

clustered_data["cluster"] = classes[1]
clustered_data["term"] = data

clustered_data_df = pd.DataFrame(data=clustered_data)

clustered_data_df.sort_values(by=['cluster'], inplace=True)

clustered_data_df

clustered_data_df.to_csv("clusters.csv",index=False)