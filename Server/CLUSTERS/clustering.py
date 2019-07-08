import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import functools 
from sklearn.preprocessing import OneHotEncoder, normalize
from sklearn.cluster import dbscan
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import AgglomerativeClustering
from sklearn.cluster import MeanShift, estimate_bandwidth
from sklearn.cluster import AffinityPropagation

from sklearn.metrics import pairwise_distances, pairwise_distances_chunked

from scipy.sparse import csr_matrix

from scipy.cluster.hierarchy import fclusterdata,cophenet, ward, single, centroid, complete, weighted,  fcluster, dendrogram , maxRstat

from scipy.spatial.distance import pdist

from leven import levenshtein
import re

import pickle

from scipy.cluster.hierarchy import inconsistent, linkage


def simplify(x):
    return ";".join(np.unique(x.split(";")))


rootDir = "/home/suso/ihw/tableAnnotator/Server/CLUSTERS/"


# dataset = pd.read_csv(rootDir+'clusterData.csv')

# cuis_test = pd.read_csv(rootDir+'test.csv').fillna("")


cuis = pd.read_csv(rootDir+'cuis.csv').fillna("")

cuis['cuis'] = cuis['cuis'].map(lambda x: simplify(x))

cuis = cuis.drop("number", axis=1)
cuis = cuis.drop("hasMesh", axis=1)

# names = dataset["concept"]

# dataset = dataset.drop("concept", axis=1)

###############

# data = dataset[0:1000]


# def similarity(x, y):

#     max_len = min(4,max(len(x[np.where( x > 0 )]),len(y[np.where( y > 0 )])))
#     totals = np.add(x, y) 
#     total_incommon = min(4,len(totals[np.where( totals > 1 )]))
    
#     result = 1-(total_incommon/max(max_len,0.000001)) # max ensures no division by 0. 
      
#     return result



def min_leven(x_terms,y_terms):
    
    if len(y_terms) > len(x_terms):
        temp = y_terms
        y_terms = x_terms
        x_terms = temp

    cmp_vals = []

    for yt in y_terms:

        inter_cmp_vals = []

        for xt in x_terms:
    
            inter_cmp_vals.append(levenshtein(yt,xt) / max(len(yt),len(xt),0.000001))

        cmp_vals.append(min(inter_cmp_vals))

    
    return sum(cmp_vals)/len(cmp_vals)

def string_distance(x, y):

    intersection_cuis = min(4,len(list(set(x[2]) & set(y[2]))))
    max_len_cuis = min(4,min(len(y[2]),len(x[2]))) # want to keep a maximum of 4 comparisons

    alpha = 0.60

    if max_len_cuis == 0:
        alpha = 0

    cuis_dist = 1 - (intersection_cuis / max(max_len_cuis,0.000001) )

    lev_dist = min_leven(y[4],x[4])

    return (cuis_dist*alpha)+(lev_dist * (1-alpha))



# X = [[0, 0], [0, 1],[0, 1],[0, 1],[0, 1], [1, 0],
# ...      [0, 4], [0, 3], [1, 4],
# ...      [4, 0], [3, 0], [4, 1],
# ...      [4, 4], [3, 4], [4, 3]]
# Z = ward(pdist(X))

# dm = weighted(pdist(data, similarity))

# dendrogram(dm)

data = cuis

data["cuis_arr"] = data.apply(lambda x: x["cuis"].split(";"), axis=1)


pattern = re.compile('\$nmbr\$')
data["concept_alt"] = data.apply(lambda x: pattern.sub("",x["concept"]), axis=1)

data["terms_arr"] = data.apply(lambda x: x["concept_alt"].split(" "), axis=1)

Z = complete(pdist(data, string_distance))


# with open('similarity_matrix.obj', 'wb') as similarity_matrix_file:
 
#   # Step 3
#   pickle.dump(Z, similarity_matrix_file)


# with open('similarity_matrix.obj', 'rb') as similarity_matrix_file:
#      Z = pickle.load(similarity_matrix_file)

 
#     # After config_dictionary is read from file
#     print(config_dictionary)

def doClustering(tval):
    result = fcluster(Z, t=tval, criterion="distance")

    csvRes = data.assign(cluster=result)

    csvRes = csvRes.sort_values(by=['cluster','concept'], ascending=False)
    # csvRes = pd.merge(csvRes, cuis, on='concept')
    # csvRes = csvRes[['cluster','concept','cuis']]
    counts = csvRes[['cluster','concept']].groupby('cluster').agg('count').sort_values(by=['concept'], ascending=False)["concept"]
    stats = counts.describe(include='all')
    print(str(tval)+" :: \n"+str(stats['mean'])+" :: "+str(stats['max'])+" :: "+str(stats['count']))
    return csvRes

for x in range(1, 10, 1):
    doClustering(x/10)


res = doClustering(0.3)


res[['cluster','concept','cuis']].to_csv(rootDir+'clusters-assign-fvc.csv', sep=',', encoding='utf-8', index=False)

# result = fcluster(dm, t=0.80, criterion='inconsistent')

#result = dbscan(dm, metric="precomputed", min_samples=2, n_jobs=10, eps=0.50) # previously manhattan

# similarities = pairwise_distances(testing, metric=similarity, n_jobs=10)

#result = dbscan(testing, metric=similarity, min_samples=2, n_jobs=10, eps=0.50) # previously manhattan


# 

# similarity(np.array([1,0,0,0,0,0,0,0,0]),np.array([1,0,0,0,0,0,0,0,0]))

x = "≥ $nmbr$ . $nmbr$ \% and < $nmbr$ . $nmbr$ %,"
y = "hbalc < $nmbr$ %,"



    
    
min_leven(x,y)
min_leven(y,x)