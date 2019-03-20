import pandas
from sklearn import model_selection
from sklearn.linear_model import SGDClassifier
import pickle
import sys
import json

words = sys.argv

result = []
if len(words) > 1:
    words.pop(0)
    sgd = pickle.load(open("/home/suso/ihw/tableAnnotator/Server/src/sgd_multiterm.sav", 'rb'))
    result = sgd.predict(words)

x = result.tolist()

print(x)
