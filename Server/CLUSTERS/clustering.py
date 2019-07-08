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

import functools

import random 

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


cui_freqs = pd.read_csv(rootDir+'cuis-freqs.csv').fillna("")

#unique_cuis = cui_freqs[cui_freqs["freq"] == 1] ## Would be useful to remove these cuis from the comparisons, as they are useless to cluster elements together.

#cui_freqs = cui_freqs[cui_freqs["freq"] > 1]

cui_freqs["idf"] = cui_freqs.apply(lambda x: x["freq"]/sum(cui_freqs["freq"]), axis=1)

idf_dict = {}

for c in cui_freqs["CUI"]:
    idf_dict[c] = cui_freqs[cui_freqs["CUI"] == c]["idf"]


# def getIdf(cui):
#     if cui in idf_dict:
#         return idf_dict[cui]
#     else:
#         return 0.000001 #This is to avoid division by 0 later.


# list(set(["C0016522","C2923685","C4554158"]) & set(cui_freqs["CUI"]))

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
            #print(yt+" -- "+xt)
            inter_cmp_vals.append(levenshtein(yt,xt) / max(len(yt),len(xt),0.000001))

        cmp_vals.append(min(inter_cmp_vals))

    try:
        return sum(cmp_vals)/len(cmp_vals)
    except:
        # print(x_terms)
        # print(y_terms)
        return 1
    

def string_distance(x, y):

    intersection_cuis = min(4,len(list(set(x[2]) & set(y[2]))))
    max_len_cuis = min(4,len(y[2]),len(x[2])) # want to keep a maximum of 4 comparisons

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

random_concepts = random.sample(list(cuis["concept"]), 1000)

data = cuis[ cuis["concept"].isin(random_concepts)]

data = cuis

data["cuis_arr"] = data.apply(lambda x: list(cui_freqs[cui_freqs["CUI"].isin(list(x["cuis"].split(";")))].sort_values(by=['idf'])["CUI"]), axis=1)



nmbr_pattern = re.compile('\$nmbr\$')
symbol_pattern = re.compile(r'([^A-z0-9 ])')

data["concept_alt"] = data.apply(lambda x: symbol_pattern.sub("",nmbr_pattern.sub("",x["concept"])), axis=1)

data["terms_arr"] = data.apply(lambda x: list(filter(lambda x: len(x) > 1, x["concept_alt"].split(" "))), axis=1)


Z = complete(pdist(data, string_distance))


# with open('similarity_matrix.obj', 'wb') as similarity_matrix_file:
 
#   # Step 3
#   pickle.dump(Z, similarity_matrix_file)


# with open('similarity_matrix.obj', 'rb') as similarity_matrix_file:
#      Z = pickle.load(similarity_matrix_file)

 
#     # After config_dictionary is read from file
#     print(config_dictionary)

def resolvethis( x ):
    if  x["cluster"] in single_clusters :
        return -1
    else:
        return x["cluster"]

def doClustering(tval):
    result = fcluster(Z, t=tval, criterion="distance")

    csvRes = data.assign(cluster=result)

    csvRes = csvRes.sort_values(by=['cluster','concept'], ascending=False)
    # csvRes = pd.merge(csvRes, cuis, on='concept')
    # csvRes = csvRes[['cluster','concept','cuis']]
    counts = csvRes[['cluster','concept']].groupby('cluster').agg('count').sort_values(by=['concept'], ascending=False)["concept"]
    
    df_counts = pd.DataFrame(counts)
    single_clusters = df_counts[df_counts["concept"] == 1].index

    csvRes["cluster"] = csvRes.apply(lambda x: -1 if x["cluster"] in single_clusters else x["cluster"] , axis=1 )

    
    stats = counts.describe(include='all')
    print(str(tval)+" :: \n"+str(stats['mean'])+" :: "+str(stats['max'])+" :: "+str(stats['count']))
    return csvRes

for x in range(1, 10, 1):
    doClustering(x/10)


res = doClustering(0.8)


res[['cluster','concept','cuis']].to_csv(rootDir+'clusters-assign-fvc.csv', sep=',', encoding='utf-8', index=False)

# result = fcluster(dm, t=0.80, criterion='inconsistent')

#result = dbscan(dm, metric="precomputed", min_samples=2, n_jobs=10, eps=0.50) # previously manhattan

# similarities = pairwise_distances(testing, metric=similarity, n_jobs=10)

#result = dbscan(testing, metric=similarity, min_samples=2, n_jobs=10, eps=0.50) # previously manhattan


# 

# similarity(np.array([1,0,0,0,0,0,0,0,0]),np.array([1,0,0,0,0,0,0,0,0]))

x = "≥ $nmbr$ . $nmbr$ \% and < $nmbr$ . $nmbr$ %,".split(" ")
y = "type diabetes 一 no . ( % )".split(" ")

    
min_leven(x,y)
min_leven(y,x)

x = ["C2699239","C2257086","C4081854"]

list(cui_freqs[cui_freqs["CUI"].isin(x)].sort_values(by=['idf'])["CUI"])





# sorted(y, key=idf)

# sorted(x, key=lambda x: getIdf(x))