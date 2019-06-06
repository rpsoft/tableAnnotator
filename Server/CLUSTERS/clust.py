import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.preprocessing import OneHotEncoder
from sklearn.cluster import dbscan
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import AgglomerativeClustering
from sklearn.cluster import MeanShift, estimate_bandwidth
from sklearn.cluster import AffinityPropagation

def simplify(x):
    return ";".join(np.unique(x.split(";")))


rootDir = "/home/suso/ihw/tableAnnotator/Server/CLUSTERS/"


dataset = pd.read_csv(rootDir+'clusterData.csv')


cuis = pd.read_csv(rootDir+'cuis.csv').fillna("")

cuis['cuis'] = cuis['cuis'].map(lambda x: simplify(x))

cuis = cuis.drop("number", axis=1)
cuis = cuis.drop("hasMesh", axis=1)

names = dataset["concept"]

dataset = dataset.drop("concept", axis=1)
#  dataset = dataset.fillna("")

# dataset.CUIs


# X = dataset.iloc[-1:, :].values
# y = dataset.iloc[:, 4].values
# onehotencoder = OneHotEncoder(handle_unknown='ignore')
# transformed = onehotencoder.fit_transform(X[:, [3]]).toarray()
# X1 = np.concatenate([X[:, :2], transformed, X[:, 4:]], axis=1)
# onehotencoder.fit(X1)

# enc = OneHotEncoder(handle_unknown='ignore')
# transformed = enc.fit_transform(dataset)


# def cos_metric(x, y):
#     # i, j = int(x[0]), int(y[0])     # extract indices
#     # print(x)
#     # print(y)
#     score = cosine_similarity([x], [y])
#     print(score)
#     return score

limit = 2000


testing = dataset
testing = dataset[0:limit]
names = names[0:limit]


### Affinity propagation


af = AffinityPropagation(damping = 0.5).fit(testing)


clustering = testing.assign(cluster=af.labels_)
clustering = clustering.assign(concept=names)

csvRes = clustering[["concept",'cluster']].sort_values(by=['cluster','concept'], ascending=False)
csvRes = pd.merge(csvRes, cuis, on='concept')
csvRes = csvRes[['cluster','concept','cuis']]

csvRes.to_csv(rootDir+'clusters-af-assign.csv', sep=',', encoding='utf-8',index=False)





## Meanshift

def doit( p ):
    bandwidth = estimate_bandwidth(testing, quantile=p, n_samples=1000, n_jobs=-1)

    ms = MeanShift(bandwidth=bandwidth, bin_seeding=True, n_jobs=-1, cluster_all=False,min_bin_freq=2)
    ms.fit(testing)
    labels = ms.labels_
    cluster_centers = ms.cluster_centers_


    clustering = testing.assign(cluster=labels)
    clustering = clustering.assign(concept=names)

    csvRes = clustering[["concept",'cluster']].sort_values(by=['cluster','concept'], ascending=False)
    csvRes = pd.merge(csvRes, cuis, on='concept')
    csvRes = csvRes[['cluster','concept','cuis']]

    csvRes.to_csv(rootDir+'clusters-ms-assign.csv', sep=',', encoding='utf-8',index=False)

doit(0.40)

doit(0.14)

doit(0.08)

doit(1)

doit(0.10)

## aglomerative
clustering = AgglomerativeClustering(linkage="complete",distance_threshold=0.90,n_clusters=None, compute_full_tree=True).fit(testing)

clustering = testing.assign(cluster=clustering.labels_)


clustering = clustering.assign(concept=names)

csvRes = clustering[["concept",'cluster']].sort_values(by='cluster', ascending=False)

csvRes = pd.merge(csvRes, cuis, on='concept')

csvRes = csvRes[['cluster','concept','cuis']]

csvRes.to_csv(rootDir+'clusters-aglo-assign.csv', sep=',', encoding='utf-8',index=False)


## dbscan 

result = dbscan(testing, metric='manhattan', min_samples=2, n_jobs=10)

d_testing = testing.assign(cluster=result[1])

d_testing = d_testing.assign(concept=names)

csvRes = d_testing[["concept",'cluster']].sort_values(by='cluster', ascending=False)
csvRes.to_csv(rootDir+'clusters-assign.csv', sep=',', encoding='utf-8')