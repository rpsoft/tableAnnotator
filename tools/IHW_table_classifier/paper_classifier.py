from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfTransformer
##
##import logging
import pandas as pd
import numpy as np

from numpy import array
from scipy.sparse import csr_matrix
from scipy import sparse

##from numpy import random
import gensim
import nltk
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.metrics import accuracy_score, confusion_matrix
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report
##from nltk.corpus import stopwords
##import re
##from bs4 import BeautifulSoup
##
import pickle

# %matplotlib inline

# import prepare_data

# nltk.download('stopwords')

# originalData = fullData

# ##"outcomes", "arms", "measures", "subgroup_name", "subgroup_level","baseline_level_1","baseline_level_2", "time/period", "other", "p-interaction"
# df = fullData

# df = df.replace(regex=["subgroup_name"],value="characteristic_name")
# df = df.replace(regex=["subgroup_level"],value="characteristic_level")
# df = df.replace(regex=["baseline_level_1"],value="characteristic_name")
# df = df.replace(regex=["baseline_level_2"],value="characteristic_level")

def convert_to_sparse_pandas(df, exclude_columns=[]):
    """
    Converts columns of a data frame into SparseArrays and returns the data frame with transformed columns.
    Use exclude_columns to specify columns to be excluded from transformation.
    :param df: pandas data frame
    :param exclude_columns: list
        Columns not be converted to sparse
    :return: pandas data frame
    """
    df = df.copy()
    exclude_columns = set(exclude_columns)

    for (columnName, columnData) in df.iteritems():
        if columnName in exclude_columns:
            continue
        df[columnName] = pd.SparseArray(columnData.values, dtype='uint8')

    return df



fullData = pd.read_csv("~/ihw/tableAnnotator/Server/prediction_data.csv")

smallbit = fullData[1:1000]

smallbit = smallbit.drop(columns=['docid', 'page','concept','original','onlyNumbers','clean_concept','cuis','semanticTypes'])

Y = smallbit['label']
X = smallbit.drop(columns=['label'])
X
 sparse.csr_matrix(X)

# data_one_hot_sparse = convert_to_sparse_pandas(smallbit, exclude_columns=['docid','page','concept','original','onlyNumbers','clean_concept'])



# sparseData = sparse.hstack((X.astype(object), fullData.values))

# sparse_df = csr_matrix(fullData.values)


##
##df.descriptor
##
##df = df[df.descriptor.str.contains(";")==False]
##
##df = df[pd.notnull(df['descriptor'])]
##print(df.head(10))
##
##print(df['terms'].apply(lambda x: len( str(x).split(' '))).sum())
##
##
###my_tags = ['java','html','asp.net','c#','ruby-on-rails','jquery','mysql','php','ios','javascript','python','c','css','android','iphone','sql','objective-c','c++','angularjs','.net']
##plt.figure(figsize=(10,4))
##df.descriptor.value_counts().plot(kind='bar')
##
###part 2
##
##REPLACE_BY_SPACE_RE = re.compile('[/(){}\[\]\|@,;]')
##BAD_SYMBOLS_RE = re.compile('[^0-9a-z #+_]')
##STOPWORDS = set(stopwords.words('english'))
##
##def clean_text(text):
##    """
##        text: a string
##
##        return: modified initial string
##    """
##    # text = BeautifulSoup(text, "lxml").text # HTML decoding
##    text = str('-'.join(text)).lower() # lowercase text
##    # text = REPLACE_BY_SPACE_RE.sub(' ', text) # replace REPLACE_BY_SPACE_RE symbols by space in text
##    # text = BAD_SYMBOLS_RE.sub('', text) # delete symbols which are in BAD_SYMBOLS_RE from text
##    text = ' '.join(word for word in text.split() if word not in STOPWORDS) # delete stopwors from text
##    return text
##
##df['terms'] = df['terms'].apply(clean_text)
##
### def print_plot(index):
###     example = df[df.index == index][['terms', 'descriptor']].values[0]
###     if len(example) > 0:
###         print(example[0])
###         print('Tag:', example[1])
##
##
### print (df['post'])
# ##
# X = df.terms
# y = df.descriptor

smallbit= smallbit.fillna(0)

X = smallbit.drop(columns=['label']) 
y = smallbit['label']


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state = 42)

##
##
###part 3
nb = Pipeline([('vect', CountVectorizer()),
              ('tfidf', TfidfTransformer()),
              ('clf', MultinomialNB()),
             ])


nb.fit(X_train, y_train)
##
### %time
##from sklearn.metrics import classification_report
##y_pred = nb.predict(X_test)
##
##len(y_train)
##
##
##print('accuracy %s' % accuracy_score(y_pred, y_test))
##print(classification_report(y_test, y_pred))
##
##
#### Here we attempt the actual prediction of unseen classes.
##df_toPredict = fullData
##df_toPredict = df_toPredict[df_toPredict.descriptor.str.contains(";")==True]
##df_toPredict = pd.concat([pd.Series(row['descriptor'], row['terms']) for _, row in df_toPredict.iterrows()]).reset_index()
##df_toPredict = df_toPredict.rename(columns = { 'index' : 'terms', 0 : 'label'})
##df_toPredict = df_toPredict[df_toPredict["terms"] != ""]
##
##y_pred_tp = nb.predict(df_toPredict["terms"])
##
##df_toPredict['prediction'] = y_pred_tp
##df_toPredict = df_toPredict.drop_duplicates()
##
##df_toPredict.to_csv("example_predictions.csv", sep=',', encoding='utf-8')
##
### Next learning algorithm
#   L-SVM part 4
from sklearn.linear_model import SGDClassifier

test_pipe = Pipeline([('vect', CountVectorizer()),
               ('tfidf', TfidfTransformer())])


sgd = Pipeline([('vect', CountVectorizer()),
               ('tfidf', TfidfTransformer()),
               ('clf', SGDClassifier(loss='hinge', penalty='l2',alpha=1e-3, random_state=42, max_iter=5, tol=None)),
              ])

sgd.sparsify()

sgd.fit(X_train, y_train)

# %time

y_pred = sgd.predict(X_test)

print('accuracy %s' % accuracy_score(y_pred, y_test))
print(classification_report(y_test, y_pred))

##
##df_toPredict = fullData
##df_toPredict = df_toPredict[df_toPredict.descriptor.str.contains(";")==True]
##df_toPredict = pd.concat([pd.Series(row['descriptor'], row['terms']) for _, row in df_toPredict.iterrows()]).reset_index()
##df_toPredict = df_toPredict.rename(columns = { 'index' : 'terms', 0 : 'label'})
##df_toPredict = df_toPredict[df_toPredict["terms"] != ""]
##
##y_pred_tp = sgd.predict(df_toPredict["terms"])
##
##df_toPredict['prediction'] = y_pred_tp
##df_toPredict = df_toPredict.drop_duplicates()
##
##extended_terms = []
##for term in df_toPredict["terms"]:
##    try:
##        extended_terms.append(term+" "+get_related_terms(term))
##    except:
##        extended_terms.append(term)
##    
##df_toPredict["extended_terms"] = extended_terms
##
##y_pred_tp = sgd.predict(df_toPredict["extended_terms"])
##
##df_toPredict['extended_prediction'] = y_pred_tp
##df_toPredict.to_csv("example_predictions_sgd.csv", sep=',', encoding='utf-8')
##
##filename = 'sgd_multiterm.sav'
##pickle.dump(sgd, open(filename, 'wb'))
##
#### W2V section
##
##from gensim.test.utils import datapath
##from gensim.models.word2vec import Text8Corpus
##from gensim.models.phrases import Phrases, Phraser
##import gensim
##all_terms_lists = fullData["terms"]
##
### for terms in originalData['terms']:
###     all_terms_lists.append(gensim.utils.simple_preprocess (str(terms)))
##
##
##model = gensim.models.Word2Vec(
##    all_terms_lists,
##        size=150,
##        window=10,
##        min_count=2,
##        workers=10)
##
##model.wv.vocab
##
##model.wv.most_similar(positive='statin')
##
##def get_related_terms(term) -> str:
##    related_terms = model.wv.most_similar(positive=gensim.utils.simple_preprocess (str(term)))
##
##    rel_terms = []
##    for term in related_terms[0:3]:
##        rel_terms.append(term[0]) 
##
##    rel_terms = " ".join(rel_terms)
##
##    return rel_terms
##
##
### get_related_terms("hypertension")
##
##extended_terms = []
##for term in df_toPredict["terms"]:
##    try:
##        extended_terms.append(term+" "+get_related_terms(term))
##    except:
##        extended_terms.append(term)
##    
##df_toPredict["extended_terms"] = extended_terms
##
##y_pred_tp = nb.predict(df_toPredict["extended_terms"])
##
##df_toPredict['extended_prediction'] = y_pred_tp
##df_toPredict.to_csv("example_predictions.csv", sep=',', encoding='utf-8')
##
##
#### measurable one: 
##
#### need to do the seletion algorithm. Based on the original tags and the predicted tag. Is the predicted tag in the original tag set?
##
##extended_terms = []
##for term in df_toPredict["terms"]:
##    try:
##        extended_terms.append(term+" "+get_related_terms(term))
##    except:
##        extended_terms.append(term)
##    
##df_toPredict["extended_terms"] = extended_terms
##
##y_pred_tp = nb.predict(df_toPredict["extended_terms"])
##
##df_toPredict['extended_prediction'] = y_pred_tp
##df_toPredict.to_csv("example_predictions.csv", sep=',', encoding='utf-8')
##
##df.replace("", np.nan, inplace=True)
##df = df.dropna()
### df
##df.to_csv("singletons.csv", sep=',', encoding='utf-8')
##
### ## word2 vec and classification:
##
### from gensim.models import Word2Vec
### wv = gensim.models.KeyedVectors.load_word2vec_format("C:/ihw/GoogleNews-vectors-negative300.bin", binary=True)
### wv.init_sims(replace=True)
##
### from itertools import islice
### list(islice(wv.vocab, 13030, 13050))
##
##
### def word_averaging(wv, words):
###     all_words, mean = set(), []
##
###     for word in words:
###         if isinstance(word, np.ndarray):
###             mean.append(word)
###         elif word in wv.vocab:
###             mean.append(wv.vectors_norm[wv.vocab[word].index])
###             all_words.add(wv.vocab[word].index)
##
###     if not mean:
###         logging.warning("cannot compute similarity with no input %s", words)
###         # FIXME: remove these examples in pre-processing
###         return np.zeros(wv.vector_size,)
##
###     mean = gensim.matutils.unitvec(np.array(mean).mean(axis=0)).astype(np.float32)
###     return mean
##
### def  word_averaging_list(wv, text_list):
###     return np.vstack([word_averaging(wv, post) for post in text_list ])
##
##
### def w2v_tokenize_text(text):
###     tokens = []
###     fodf.descriptor.str.contains(";")==Falser sent in nltk.sent_tokenize(text, language='english'):
###       df.descriptor.str.contains(";")==False  for word in nltk.word_tokenize(sent, language='english'):
###       df.descriptor.str.contains(";")==False      if len(word) < 2:
###                 continue
###             tokens.append(word)
###     return tokens
##
### train, test = train_test_split(df, test_size=0.3, random_state = 42)
##
### test.apply(lambda r: w2v_tokenize_text(r['terms']), axis=1)
##
### test_tokenized = test.apply(lambda r: w2v_tokenize_text(r['terms']), axis=1).values
### train_tokenized = train.apply(lambfrom sklearn.naive_bayes import MultinomialNB
##from sklearn.pipeline import Pipeline
##from sklearn.feature_extraction.text import TfidfTransformer
##
##import logging
##import pandas as pd
##import numpy as np
##from numpy import random
##import gensim
##import nltk
##from sklearn.model_selection import train_test_split
##from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
##from sklearn.metrics import accuracy_score, confusion_matrix
##import matplotlib.pyplot as plt
##from nltk.corpus import stopwords
##import re
##from bs4 import BeautifulSoup
##
##import pickle
##
### %matplotlib inline
##
##import prepare_data
##
##nltk.download('stopwords')
##
##originalData = fullData
##
####"outcomes", "arms", "measures", "subgroup_name", "subgroup_level","baseline_level_1","baseline_level_2", "time/period", "other", "p-interaction"
##df = fullData
##
##df = df.replace(regex=["subgroup_name"],value="characteristic_name")
##df = df.replace(regex=["subgroup_level"],value="characteristic_level")
##df = df.replace(regex=["baseline_level_1"],value="characteristic_name")
##df = df.replace(regex=["baseline_level_2"],value="characteristic_level")
##
##fullData = df
##
##df.descriptor
##
##df = df[df.descriptor.str.contains(";")==False]
##
##df = df[pd.notnull(df['descriptor'])]
##print(df.head(10))
##
##print(df['terms'].apply(lambda x: len( str(x).split(' '))).sum())
##
##
###my_tags = ['java','html','asp.net','c#','ruby-on-rails','jquery','mysql','php','ios','javascript','python','c','css','android','iphone','sql','objective-c','c++','angularjs','.net']
##plt.figure(figsize=(10,4))
##df.descriptor.value_counts().plot(kind='bar')
##
###part 2
##
##REPLACE_BY_SPACE_RE = re.compile('[/(){}\[\]\|@,;]')
##BAD_SYMBOLS_RE = re.compile('[^0-9a-z #+_]')
##STOPWORDS = set(stopwords.words('english'))
##
##def clean_text(text):
##    """
##        text: a string
##
##        return: modified initial string
##    """
##    # text = BeautifulSoup(text, "lxml").text # HTML decoding
##    text = str('-'.join(text)).lower() # lowercase text
##    # text = REPLACE_BY_SPACE_RE.sub(' ', text) # replace REPLACE_BY_SPACE_RE symbols by space in text
##    # text = BAD_SYMBOLS_RE.sub('', text) # delete symbols which are in BAD_SYMBOLS_RE from text
##    text = ' '.join(word for word in text.split() if word not in STOPWORDS) # delete stopwors from text
##    return text
##
##df['terms'] = df['terms'].apply(clean_text)
##
### def print_plot(index):
###     example = df[df.index == index][['terms', 'descriptor']].values[0]
###     if len(example) > 0:
###         print(example[0])
###         print('Tag:', example[1])
##
##
### print (df['post'])
##
##X = df.terms
##y = df.descriptor
##
##X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state = 42)
##
##
###part 3
##nb = Pipeline([('vect', CountVectorizer()),
##               ('tfidf', TfidfTransformer()),
##               ('clf', MultinomialNB()),
##              ])
##
##
##nb.fit(X_train, y_train)
##
### %time
##from sklearn.metrics import classification_report
##y_pred = nb.predict(X_test)
##
##len(y_train)
##
##
##print('accuracy %s' % accuracy_score(y_pred, y_test))
##print(classification_report(y_test, y_pred))
##
##
#### Here we attempt the actual prediction of unseen classes.
##df_toPredict = fullData
##df_toPredict = df_toPredict[df_toPredict.descriptor.str.contains(";")==True]
##df_toPredict = pd.concat([pd.Series(row['descriptor'], row['terms']) for _, row in df_toPredict.iterrows()]).reset_index()
##df_toPredict = df_toPredict.rename(columns = { 'index' : 'terms', 0 : 'label'})
##df_toPredict = df_toPredict[df_toPredict["terms"] != ""]
##
##y_pred_tp = nb.predict(df_toPredict["terms"])
##
##df_toPredict['prediction'] = y_pred_tp
##df_toPredict = df_toPredict.drop_duplicates()
##
##df_toPredict.to_csv("example_predictions.csv", sep=',', encoding='utf-8')
##
##### Next learning algorithm
###   L-SVM part 4
##from sklearn.linear_model import SGDClassifier
##
##test_pipe = Pipeline([('vect', CountVectorizer()),
##                ('tfidf', TfidfTransformer())])
##
##
##sgd = Pipeline([('vect', CountVectorizer()),
##                ('tfidf', TfidfTransformer()),
##                ('clf', SGDClassifier(loss='hinge', penalty='l2',alpha=1e-3, random_state=42, max_iter=5, tol=None)),
##               ])
##sgd.fit(X_train, y_train)
##
### %time
##
##y_pred = sgd.predict(X_test)
##
##print('accuracy %s' % accuracy_score(y_pred, y_test))
##print(classification_report(y_test, y_pred))
##
##
##df_toPredict = fullData
##df_toPredict = df_toPredict[df_toPredict.descriptor.str.contains(";")==True]
##df_toPredict = pd.concat([pd.Series(row['descriptor'], row['terms']) for _, row in df_toPredict.iterrows()]).reset_index()
##df_toPredict = df_toPredict.rename(columns = { 'index' : 'terms', 0 : 'label'})
##df_toPredict = df_toPredict[df_toPredict["terms"] != ""]
##
##y_pred_tp = sgd.predict(df_toPredict["terms"])
##
##df_toPredict['prediction'] = y_pred_tp
##df_toPredict = df_toPredict.drop_duplicates()
##
##extended_terms = []
##for term in df_toPredict["terms"]:
##    try:
##        extended_terms.append(term+" "+get_related_terms(term))
##    except:
##        extended_terms.append(term)
##    
##df_toPredict["extended_terms"] = extended_terms
##
##y_pred_tp = sgd.predict(df_toPredict["extended_terms"])
##
##df_toPredict['extended_prediction'] = y_pred_tp
##df_toPredict.to_csv("example_predictions_sgd.csv", sep=',', encoding='utf-8')
##
##filename = 'sgd_multiterm.sav'
##pickle.dump(sgd, open(filename, 'wb'))
##
#### W2V section
##
##from gensim.test.utils import datapath
##from gensim.models.word2vec import Text8Corpus
##from gensim.models.phrases import Phrases, Phraser
##import gensim
##all_terms_lists = fullData["terms"]
##
### for terms in originalData['terms']:
###     all_terms_lists.append(gensim.utils.simple_preprocess (str(terms)))
##
##
##model = gensim.models.Word2Vec(
##    all_terms_lists,
##        size=150,
##        window=10,
##        min_count=2,
##        workers=10)
##
##model.wv.vocab
##
##model.wv.most_similar(positive='statin')
##
##def get_related_terms(term) -> str:
##    related_terms = model.wv.most_similar(positive=gensim.utils.simple_preprocess (str(term)))
##
##    rel_terms = []
##    for term in related_terms[0:3]:
##        rel_terms.append(term[0]) 
##
##    rel_terms = " ".join(rel_terms)
##
##    return rel_terms
##
##
### get_related_terms("hypertension")
##
##extended_terms = []
##for term in df_toPredict["terms"]:
##    try:
##        extended_terms.append(term+" "+get_related_terms(term))
##    except:
##        extended_terms.append(term)
##    
##df_toPredict["extended_terms"] = extended_terms
##
##y_pred_tp = nb.predict(df_toPredict["extended_terms"])
##
##df_toPredict['extended_prediction'] = y_pred_tp
##df_toPredict.to_csv("example_predictions.csv", sep=',', encoding='utf-8')
##
##
#### measurable one: 
##
#### need to do the seletion algorithm. Based on the original tags and the predicted tag. Is the predicted tag in the original tag set?
##
##extended_terms = []
##for term in df_toPredict["terms"]:
##    try:
##        extended_terms.append(term+" "+get_related_terms(term))
##    except:
##        extended_terms.append(term)
##    
##df_toPredict["extended_terms"] = extended_terms
##
##y_pred_tp = nb.predict(df_toPredict["extended_terms"])
##
##df_toPredict['extended_prediction'] = y_pred_tp
##df_toPredict.to_csv("example_predictions.csv", sep=',', encoding='utf-8')
##
##df.replace("", np.nan, inplace=True)
##df = df.dropna()
### df
##df.to_csv("singletons.csv", sep=',', encoding='utf-8')
##
### ## word2 vec and classification:
##
### from gensim.models import Word2Vec
### wv = gensim.models.KeyedVectors.load_word2vec_format("C:/ihw/GoogleNews-vectors-negative300.bin", binary=True)
### wv.init_sims(replace=True)
##
### from itertools import islice
### list(islice(wv.vocab, 13030, 13050))
##
##
### def word_averaging(wv, words):
###     all_words, mean = set(), []
##
###     for word in words:
###         if isinstance(word, np.ndarray):
###             mean.append(word)
###         elif word in wv.vocab:
###             mean.append(wv.vectors_norm[wv.vocab[word].index])
###             all_words.add(wv.vocab[word].index)
##
###     if not mean:
###         logging.warning("cannot compute similarity with no input %s", words)
###         # FIXME: remove these examples in pre-processing
###         return np.zeros(wv.vector_size,)
##
###     mean = gensim.matutils.unitvec(np.array(mean).mean(axis=0)).astype(np.float32)
###     return mean
##
### def  word_averaging_list(wv, text_list):
###     return np.vstack([word_averaging(wv, post) for post in text_list ])
##
##
### def w2v_tokenize_text(text):
###     tokens = []
###     fodf.descriptor.str.contains(";")==Falser sent in nltk.sent_tokenize(text, language='english'):
###       df.descriptor.str.contains(";")==False  for word in nltk.word_tokenize(sent, language='english'):
###       df.descriptor.str.contains(";")==False      if len(word) < 2:
###                 continue
###             tokens.append(word)
###     return tokens
##
### train, test = train_test_split(df, test_size=0.3, random_state = 42)
##
### test.apply(lambda r: w2v_tokenize_text(r['terms']), axis=1)
##
### test_tokenized = test.apply(lambda r: w2v_tokenize_text(r['terms']), axis=1).values
### train_tokenized = train.apply(lambda r: w2v_tokenize_text(r['terms']), axis=1).values
##
### X_train_word_average = word_averaging_list(wv,train_tokenized)
### X_test_word_average = word_averaging_list(wv,test_tokenized)
##
### from sklearn.linear_model import LogisticRegression
### logreg = LogisticRegression(n_jobs=1, C=1e5)
### logreg = logreg.fit(X_train_word_average, train['descriptor'])
### y_pred = logreg.predict(X_test_word_average)
### print('accuracy %s' % accuracy_score(y_pred, test.descriptor))
### print(classification_report(test.descriptor, y_pred)) #, target_names="descriptor"
##
##sgd = pickle.load(open("/home/suso/ihw/tableAnnotator/Server/src/sgd_multiterm.sav", 'rb'))
##
##sgd.predict(["female male Simvastatin Simvastatin","cyclosporin"])
##
##sgd.predict(["mean mean sd","cyclosporin"])
##
##
##sgd.predict(["mean mean sd","cyclosporin", "placebo"])
##
##sgd.predict(["nmbr - nbmr"])
##
##
##
##
##testing_data = np.array([ 
##                [1,["hi","here"],3,4,5,2,3,4,35,8],
##                [2,["bye","here"],7,1,1,2,3,4,35,8], 
##                [1,["here","more","yesterday"],3,4,5,2,3,4,35,8]
##                ])
##
##np.ravel(testing_data, order = 'C')
##
##np.
##
##testing_data
##
##np.ndarray.flatten(testing_data)g_list(wv,test_tokenized)
##
### from sklearn.linear_model import LogisticRegression
### logreg = LogisticRegression(n_jobs=1, C=1e5)
### logreg = logreg.fit(X_train_word_average, train['descriptor'])
### y_pred = logreg.predict(X_test_word_average)
### print('accuracy %s' % accuracy_score(y_pred, test.descriptor))
### print(classification_report(test.descriptor, y_pred)) #, target_names="descriptor"
##
##sgd = pickle.load(open("/home/suso/ihw/tableAnnotator/Server/src/sgd_multiterm.sav", 'rb'))
##
##sgd.predict(["female male Simvastatin Simvastatin","cyclosporin"])
##
##sgd.predict(["mean mean sd","cyclosporin"])
##
##
##sgd.predict(["mean mean sd","cyclosporin", "placebo"])
##
##sgd.predict(["nmbr - nbmr"])
##
##
##
##
##testing_data = np.array([ 
##                [1,["hi","here"],3,4,5,2,3,4,35,8],
##                [2,["bye","here"],7,1,1,2,3,4,35,8], 
##                [1,["here","more","yesterday"],3,4,5,2,3,4,35,8]
##                ])
##
##np.ravel(testing_data, order = 'C')
##
##np.
##
##testing_data
##
##np.ndarray.flatten(testing_data)
