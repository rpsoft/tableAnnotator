from leven import levenshtein       
import numpy as np
from sklearn.cluster import dbscan
import pandas as pd

data = ["melame", "melacome", "gato", "gatear", "perro","perro","perro","perro","perro", "perrear", "melaucho", "", "ohcualem"]

bigArray = []

for arr in fullData["terms"]:
    bigArray = bigArray+arr

bigArray = list(set(bigArray)) 

data = bigArray

def lev_metric(x, y):
    i, j = int(x[0]), int(y[0])     # extract indices
    score = levenshtein(data[i], data[j])
    
    return score

X = np.arange(len(data)).reshape(-1, 1)

classes = dbscan(X, metric=lev_metric, eps=3, min_samples=2)

data
classes

clustered_data = {}

clustered_data["cluster"] = classes[1]
clustered_data["term"] = data

clustered_data_df = pd.DataFrame(data=clustered_data)

clustered_data_df.sort_values(by=['cluster'], inplace=True)

clustered_data_df

clustered_data_df.to_csv("clusters.csv",index=False)