from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfTransformer

import logging
import pandas as pd
import numpy as np
from numpy import random
import gensim
import nltk
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.metrics import accuracy_score, confusion_matrix
import matplotlib.pyplot as plt
from nltk.corpus import stopwords
import re
from bs4 import BeautifulSoup

import pickle

# %matplotlib inline

# import prepare_annotation_data

nltk.download('stopwords')

df = fullData

## We only use those annotations with single descriptors. 
## The idea is that the classifier should also be able to work out which is the correct descriptor when multiple ones are defined.

df = df[df.descriptor.str.contains(";")==False]
df = df[pd.notnull(df['descriptor'])]

plt.figure(figsize=(10,4))
df.descriptor.value_counts().plot(kind='bar')

STOPWORDS = set(stopwords.words('english'))

## Stop word removal and joining different texts into single text. No further text processing done.
def clean_text(text):
    text = str(' '.join(text)).lower() # lowercase text
    text = ' '.join(word for word in text.split() if word not in STOPWORDS) # delete stopwords from text
    return text

df['terms'] = df['terms'].apply(clean_text)

X = df.terms
y = df.descriptor

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state = 42)


### Next learning algorithm
#   L-SVM part 4
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import classification_report


sgd = Pipeline([('vect', CountVectorizer()),
                ('tfidf', TfidfTransformer()),
                ('clf', SGDClassifier(loss='hinge', penalty='l2',alpha=1e-3, random_state=42, max_iter=5, tol=None)),
               ])
sgd.fit(X_train, y_train)

y_pred = sgd.predict(X_test)

# y_pred_probs = sgd.predict_proba(X_test)


print('accuracy %s' % accuracy_score(y_pred, y_test))
print(classification_report(y_test, y_pred))

filename = "sgd_testing.sav"
pickle.dump(sgd, open(filename, 'wb'))

# sgd = pickle.load(open("/home/suso/ihw/tableAnnotator/Server/src/sgd_multiterm.sav", 'rb'))

# sgd.predict(["female male Simvastatin Simvastatin","cyclosporin"])

# sgd.predict(["mean mean sd","cyclosporin"])


# sgd.predict(["mean mean sd","cyclosporin", "placebo"])

# sgd.predict(["nmbr - nbmr"])