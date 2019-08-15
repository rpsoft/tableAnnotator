# Authors: Shane Grigsby <refuge@rocktalus.com>
#          Adrin Jalali <adrin.jalali@gmail.com>
# License: BSD 3 clause


from sklearn.cluster import OPTICS, cluster_optics_dbscan
import matplotlib.gridspec as gridspec
import matplotlib.pyplot as plt
import numpy as np

# Generate sample data

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

from sklearn.metrics import pairwise_distances

from scipy.sparse import csr_matrix

from scipy.cluster.hierarchy import fclusterdata,cophenet, ward, single, centroid, complete, weighted,  fcluster, dendrogram , maxRstat

from scipy.spatial.distance import pdist


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

###############

data = dataset[0:1000]


def similarity(x, y):

    max_len = max(len(x[np.where( x > 0 )]),len(y[np.where( y > 0 )]))
    totals = np.add(x, y) 
    total_incommon = len(totals[np.where( totals > 1 )])
    
    result = 1-(total_incommon/max(max_len,0.000001)) # max ensures no division by 0. 

    return result


clust = OPTICS(min_samples=2, min_cluster_size=2, metric="minkowski", n_jobs=10, cluster_method='dbscan', max_eps=0.5)

# Run the fit
res = clust.fit(data)

result = res

d_testing = data.assign(cluster=result)
d_testing = d_testing.assign(concept=names)

csvRes = d_testing[["concept",'cluster']].sort_values(by=['cluster','concept'], ascending=False)
csvRes = pd.merge(csvRes, cuis, on='concept')
csvRes = csvRes[['cluster','concept','cuis']]
counts = csvRes[['cluster','concept']].groupby('cluster').agg('count').sort_values(by=['concept'], ascending=False)["concept"]
stats = counts.describe(include='all')
print(" :: \n"+str(stats['mean'])+" :: "+str(stats['max'])+" :: "+str(stats['count']))