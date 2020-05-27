
##import logging
import pandas as pd
import numpy as np

from numpy import array
from scipy.sparse import csr_matrix
from scipy import sparse

import functools 
import itertools 

import scipy as scipy

from numpy import argmax
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import OneHotEncoder
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.metrics import accuracy_score, confusion_matrix
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report

import sklearn

from sklearn.linear_model import SGDClassifier
from sklearn.linear_model import LogisticRegression

from sklearn.neural_network import MLPClassifier

from sklearn.svm import LinearSVC

from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import AdaBoostClassifier

from sklearn.naive_bayes import MultinomialNB
from sklearn.naive_bayes import BernoulliNB
from sklearn.tree import DecisionTreeClassifier

from sklearn.neighbors import KNeighborsClassifier

from sklearn.multiclass import OneVsRestClassifier
from sklearn.svm import SVC

from sklearn.model_selection import StratifiedShuffleSplit

from scipy.stats import ttest_ind

from sklearn.metrics import roc_curve
from sklearn.metrics import roc_auc_score

from sklearn.metrics import auc


semtypes = ['qlco', 'topp','bodm','resa','orch','phsu','orga','tmco','popg','edac','clas','fndg','clna','inbe','food','dsyn','lbtr','diap','moft','orgf','qnco','cnce','patf','geoa','inpr','rnlw','chvs','ftcn','idcn','acty','inch','elii','hlca','spco','medd','bacs','gngm','npop','lbpr','anim','socb','grup','aapp','imft','bmod','podg','hops','blor','bpoc','bdsy','bhvr','tisu','bdsu','prog','emod','ocdi','dora','enzy','phsf','genf','mamm','evnt','horm','biof','euka','neop','menp','mnob','chvf','mobd','celc','sosy','sbst','cgab','virs','inpo','plnt','vita','anab','hcro','acab','amph','famg','rept','fish','antb','aggp','bsoj','rcpt','phpr','irda','phob','nnon','grpa','clnd','gora','celf','ffas','amas','ocac','ortf','pros','orgt','lang','bird','chem','cell','hcpp','nusq','enty','resd','anst','humn','bact','mbrt','arch','comd','orgm','mcha','fngs','drdd'] 

# docs = [["hello", "world", "hello"], ["goodbye", "cruel", "world"]]

# docs = smallbit.to_numpy()

# indptr = [0]
# indices = []
# data = []
# vocabulary = {}
# for d in docs:
#     for term in d:
#         index = vocabulary.setdefault(term, len(vocabulary))
#         indices.append(index)
#         data.append(1)
#     indptr.append(len(indices))

# csr_matrix((data, indices, indptr), dtype=int).toarray()



# # define example
# data = [['cold', 'cold', 'warm', 'cold', 'hot', 'hot', 'warm', 'cold', 'warm', 'hot']]
# values = array(data)
# print(values)

# # integer encode
# label_encoder = LabelEncoder()
# integer_encoded = label_encoder.fit_transform(values)
# print(integer_encoded)

# # binary encode
# onehot_encoder = OneHotEncoder(sparse=False)
# integer_encoded = integer_encoded.reshape(len(integer_encoded), 1)
# onehot_encoded = onehot_encoder.fit_transform(integer_encoded)
# print(onehot_encoded)

# # invert first example
# inverted = label_encoder.inverse_transform([argmax(onehot_encoded[0, :])])
# print(inverted)


# onehotencoder = OneHotEncoder(categorical_features = [0])

fullData = pd.read_csv("~/ihw/tableAnnotator/Server/prediction_data.csv")

# fullData[['is_empty_row','label']][fullData.is_empty_row == 1].groupby('label').count()

# smallbit = fullData[fullData["label"].str.contains(";") == False]

fullData_singleLabels = fullData[fullData["label"].str.contains(";") == False]

#get rid of textual data.
fullData_singleLabels = fullData_singleLabels.drop(columns=['docid', 'page','concept','original','onlyNumbers','clean_concept','cuis','semanticTypes'])

# get rid of records where label is null
fullData_singleLabels = fullData_singleLabels.loc[pd.notnull(fullData_singleLabels.label)]

# get rid of records where label is NaN
fullData_singleLabels = fullData_singleLabels.loc[pd.notna(fullData_singleLabels.label)]

fullData_X = fullData_singleLabels.drop(columns=['label']).fillna(0)
fullData_Y = pd.DataFrame(fullData_singleLabels['label'])

len(fullData_X)
len(fullData_Y)


# X_umls = fullData_singleLabels.drop(columns=['label']).fillna(0)
# X_umls = sparse.csr_matrix(X_umls) ## dimension reduction by sparse representation

# Y_umls = fullData_singleLabels['label']

# Y = Y.fillna("")

labels = ['arms','characteristic_level','characteristic_name','measures','other','outcomes','p-interaction','time/period']


# X_train, X_test, Y_train, Y_test = train_test_split(fullData_X, fullData_Y, test_size=0.3, stratify=fullData_Y)




# ## Basic
# basic_X = sparse.csr_matrix(X_train[['pos_start','pos_middle','pos_end','inRow','inCol','is_bold','is_italic','is_indent','is_empty_row','is_empty_row_p']])
# basic_Y = Y_train

# basic_X_test = sparse.csr_matrix(X_test[['pos_start','pos_middle','pos_end','inRow','inCol','is_bold','is_italic','is_indent','is_empty_row','is_empty_row_p']])
# basic_Y_test = Y_test

# ## SemType
# filter_col = [col for col in fullData_singleLabels if not col.startswith('C')]
# filter_col.remove('label')

# # len(filter_col)


# semTypes_X = sparse.csr_matrix(X_train[filter_col])
# semTypes_Y = Y_train

# semTypes_X_test = sparse.csr_matrix(X_test[filter_col])
# semTypes_Y_test = Y_test

# ## Cuis

# cuis_filter_col = [col for col in fullData_singleLabels if not col in semtypes]
# cuis_filter_col.remove('label')

# len(cuis_filter_col)

# cuis_X = sparse.csr_matrix(X_train[cuis_filter_col])
# cuis_Y = Y_train

# cuis_X_test = sparse.csr_matrix(X_test[cuis_filter_col])
# cuis_Y_test = Y_test

# ## Full

# umls_X = sparse.csr_matrix(X_train)
# umls_Y = Y_train

# len(X_train.columns)

# umls_X_test = sparse.csr_matrix(X_test)
# umls_Y_test = Y_test

########


def runModelExperiment(X_train, X_test, y_train, y_test, model, onlySummary = True, exp = "defaultEXP"):  

    # test_pipe = Pipeline([('vect', CountVectorizer())])

    sgd = Pipeline([            
                ('clf', model),               ])

    sgd.fit(X_train, y_train.values.ravel())

    # %time

    y_pred = sgd.predict(X_test)
    probs = sgd.predict_proba(X_test)


    #print('accuracy %s' % accuracy_score(y_pred, y_test))
    report = classification_report(y_test, y_pred, output_dict= True, zero_division = 0)
    
    # classification_report(y_test,)

#    print(str(round(report['macro avg']['precision'])+" & "+str(report['macro avg']['recall'])+" & "+str(report['macro avg']['f1-score'])+" & "+str(report['macro avg']['support']))
    
    print("%s & %.3f & %.3f & %.3f & %.3f \\\\ \\hline" % (exp, report['macro avg']['precision'], report['macro avg']['recall'], report['macro avg']['f1-score'], report['accuracy']))

    if not onlySummary:
        for l in labels:
            print("%s & %.2f & %.2f & %.2f & %.0f \\\\\n \\hline" % (l,report[l]['precision'], report[l]['recall'], report[l]['f1-score'], report[l]['support']))

        print("\hlinemaocr\_avg & %.2f & %.2f & %.2f & \multirow{2}{*}{%.0f}  \\\\\n \\cline{1-4}" % (report['macro avg']['precision'], report['macro avg']['recall'], report['macro avg']['f1-score'], report['macro avg']['support']))
        print("weighted\_avg & %.2f & %.2f & %.2f & \\\\\n \\hline" % (report['weighted avg']['precision'], report['weighted avg']['recall'], report['weighted avg']['f1-score']))

        # print(classification_report(y_test, y_pred))

    

    return y_pred , report, probs



basic_columns = ['pos_start','pos_middle','pos_end','inRow','inCol','is_bold','is_italic','is_indent','is_empty_row','is_empty_row_p']


n_splits = 10
test_size = 0.3

sss = StratifiedShuffleSplit(n_splits=n_splits, test_size=test_size, random_state=0)
sss.get_n_splits(fullData_X, fullData_Y)

datasets = {}

split = 0
for train_index, test_index in sss.split(fullData_X, fullData_Y):
        # print("TRAIN:", train_index, "TEST:", test_index)
        X_train, X_test = fullData_X.iloc[train_index], fullData_X.iloc[test_index]
        Y_train, Y_test = fullData_Y.iloc[train_index], fullData_Y.iloc[test_index]

        ## Basic
        basic_X = sparse.csr_matrix(X_train[basic_columns])
        basic_X_test = sparse.csr_matrix(X_test[basic_columns])

        ## SemType
        filter_col = [col for col in X_train if not col.startswith('C')]
        semTypes_X = sparse.csr_matrix(X_train[filter_col])
        semTypes_X_test = sparse.csr_matrix(X_test[filter_col])

        ## Cuis
        cuis_filter_col = [col for col in X_train if not col in semtypes]
        cuis_X = sparse.csr_matrix(X_train[cuis_filter_col])
        cuis_X_test = sparse.csr_matrix(X_test[cuis_filter_col])

        ## Full
        umls_X = sparse.csr_matrix(X_train)
        umls_X_test = sparse.csr_matrix(X_test)
        
        current_split = {}
        current_split['basic'] = {"X" : basic_X, "X_test" : basic_X_test}
        current_split['semtypes'] = {"X" : semTypes_X, "X_test" : semTypes_X_test}
        current_split['cuis'] = {"X" : cuis_X, "X_test" : cuis_X_test}
        current_split['umls'] = {"X" : umls_X, "X_test" : umls_X_test}
        current_split['Y'] = {"train" : Y_train, "test": Y_test}

        datasets[split] = current_split

        split = split+1



models = {
    "RandomForest" : RandomForestClassifier(n_estimators = 100),
    "LogReg" : LogisticRegression(max_iter=1000),
    "AdaBoost" : AdaBoostClassifier(),
    "Multinomial" : MultinomialNB(),
    "MLP" : MLPClassifier()
    }

fsets = ['basic', 'semtypes', 'cuis', 'umls']

eval_results = {}
for feature_set in fsets: #, 'cuis', 'umls'
    for s in range(0,split):

        try: 
            current_split = eval_results[s]
        except KeyError: 
            eval_results[s] = {}

        for m_name in models:
            model= models[m_name]
            preds, report, probs = runModelExperiment(datasets[s][feature_set]['X'], datasets[s][feature_set]['X_test'], datasets[s]['Y']["train"], datasets[s]['Y']["test"],  model, exp = m_name+"_"+feature_set)

            try: 
                current = eval_results[s][m_name+"_"+feature_set]
            except KeyError: 
                current = {}

            current = {"report": report, "predictions" : preds, "probabilities" : probs}

            eval_results[s][m_name+"_"+feature_set] = current


# ##traversing results
# for feature_set in fsets:
#     for m_name in models:
#         for s in eval_results:
#             report = eval_results[s][m_name+"_"+feature_set]["report"]
#             print("%s %s [%.0f] -> %.3f %.3f" % (feature_set, m_name, s, report["macro avg"]['f1-score'], report["weighted avg"]['f1-score']))


def getStats(eval_results, m_name, feature_set):
    precisions = list(map(lambda s : eval_results[s][m_name+"_"+feature_set]["report"]["weighted avg"]["precision"], list(range(0,split))))                   
    recalls = list(map(lambda s : eval_results[s][m_name+"_"+feature_set]["report"]["weighted avg"]["recall"], list(range(0,split))))
    f1s = list(map(lambda s : eval_results[s][m_name+"_"+feature_set]["report"]["weighted avg"]['f1-score'], list(range(0,split))))
    accuracies = list(map(lambda s : eval_results[s][m_name+"_"+feature_set]["report"]["accuracy"], list(range(0,split))))

    return precisions, recalls, f1s, accuracies

def compTTest(ps1,rs1,f1s1,acs1, ps2, rs2, f1s2, acs2 ):
    return scipy.stats.ttest_rel(ps1,ps2)[1], scipy.stats.ttest_rel(rs1,rs2)[1], scipy.stats.ttest_rel(f1s1,f1s2)[1], scipy.stats.ttest_rel(acs1,acs2)[1]

##traversing results
for m_name in models:
    print(" ")
    for feature_set in fsets:
        
        precisions, recalls, f1s, accuracies = getStats(eval_results, m_name, feature_set)
        
        basic_ps, basic_rs, basic_fs, basic_acs = getStats(eval_results, m_name, 'basic')

        umls_ps, umls_rs, umls_fs, umls_acs = getStats(eval_results, m_name, 'umls')

        ps_p_val_basic, rs_p_val_basic, fs_p_val_basic, acs_p_val_basic = compTTest(precisions, recalls, f1s, accuracies, basic_ps, basic_rs, basic_fs, basic_acs )
        ps_p_val_umls, rs_p_val_umls, fs_p_val_umls, acs_p_val_umls = compTTest(precisions, recalls, f1s, accuracies, umls_ps, umls_rs, umls_fs, umls_acs )

        p_vs_basic = ps_p_val_basic < 0.01 and "*" or " "
        rs_vs_basic = rs_p_val_basic < 0.01 and "*" or " "
        f1s_vs_basic = fs_p_val_basic < 0.01 and "*" or " "
        acs_vs_basic = acs_p_val_basic < 0.01 and "*" or " "

        p_vs_umls = ps_p_val_umls < 0.01 and "$" or " "
        rs_vs_umls = rs_p_val_umls < 0.01 and "$" or " "
        f1s_vs_umls = fs_p_val_umls < 0.01 and "$" or " "
        acs_vs_umls = acs_p_val_umls < 0.01 and "$" or " "

        avg_precision = np.average(precisions)
        avg_recall = np.average(recalls)
        avg_f1 = np.average(f1s)
        avg_accuracy = np.average(accuracies)


        # au = auc(recalls, precisions)

        print("[w_avg %.0f folds] %.3f%s%s %.3f%s%s %.3f%s%s %.3f%s%s <- %s %s" % (
            split, 
            avg_precision, p_vs_basic, p_vs_umls,
            avg_recall, rs_vs_basic, rs_vs_umls, 
            avg_f1, f1s_vs_basic, f1s_vs_umls, 
            avg_accuracy, acs_vs_basic, acs_vs_umls, 
            m_name, feature_set ))


#
#
#
### Need to adapt this.
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_recall_curve
from sklearn.metrics import f1_score
from sklearn.metrics import auc
from matplotlib import pyplot
# generate 2 class dataset
X, y = make_classification(n_samples=1000, n_classes=2, random_state=1)
# split into train/test sets
trainX, testX, trainy, testy = train_test_split(X, y, test_size=0.5, random_state=2)
# generate a no skill prediction (majority class)
ns_probs = [0 for _ in range(len(testy))]
# fit a model
model = LogisticRegression(solver='lbfgs')
model.fit(trainX, trainy)
# predict probabilities
lr_probs = model.predict_proba(testX)
# keep probabilities for the positive outcome only
lr_probs = lr_probs[:, 1]
# calculate scores
ns_auc = roc_auc_score(testy, ns_probs)
lr_auc = roc_auc_score(testy, lr_probs)
# summarize scores
print('No Skill: ROC AUC=%.3f' % (ns_auc))
print('Logistic: ROC AUC=%.3f' % (lr_auc))
# calculate roc curves
ns_fpr, ns_tpr, _ = roc_curve(testy, ns_probs)
lr_fpr, lr_tpr, _ = roc_curve(testy, lr_probs)
# plot the roc curve for the model
pyplot.plot(ns_fpr, ns_tpr, linestyle='--', label='No Skill')
pyplot.plot(lr_fpr, lr_tpr, marker='.', label='Logistic')
# axis labels
pyplot.xlabel('False Positive Rate')
pyplot.ylabel('True Positive Rate')
# show the legend
pyplot.legend()
# show the plot
pyplot.show()


##Cool!
lr_probs = eval_results[0]["RandomForest_basic"]["probabilities"]
yhat = eval_results[0]["RandomForest_basic"]["predictions"]
testy = datasets[0]['Y']['test']

fpr = dict()
tpr = dict()
roc_auc = dict()
for i in range(len(labels)):
    fpr[i], tpr[i], _ = roc_curve(testy, lr_probs[:, i], pos_label=labels[i])  
    roc_auc[i] = auc(fpr[i], tpr[i])
    pyplot.plot(fpr[i], tpr[i], marker='.', label=labels[i]+" {0:.2f}".format(roc_auc[i]))

pyplot.plot(ns_fpr, ns_tpr, linestyle='--', label='No Skill Line')
# axis labels
pyplot.xlabel('False Positive Rate')
pyplot.ylabel('True Positive Rate')
# show the legend
pyplot.legend()
pyplot.title("Area under the ROC curve")
# show the plot
pyplot.show()


# len(testy)
# len(lr_probs[:, i])

# lr_precision, lr_recall, _ = precision_recall_curve(testy, lr_probs)
# lr_f1, lr_auc = f1_score(testy, yhat), auc(lr_recall, lr_precision)
# # summarize scores
# print('Logistic: f1=%.3f auc=%.3f' % (lr_f1, lr_auc))



# [w_avg 10 folds] 0.583 $ 0.587 $ 0.458 $ 0.587 $ <- RandomForest basic
# [w_avg 10 folds] 0.624*$ 0.654*$ 0.615*$ 0.654*$ <- RandomForest semtypes
# [w_avg 10 folds] 0.647*$ 0.670*$ 0.644*$ 0.670*$ <- RandomForest cuis
# [w_avg 10 folds] 0.653*  0.677*  0.647*  0.677*  <- RandomForest umls
 
# [w_avg 10 folds] 0.406 $ 0.586 $ 0.455 $ 0.586 $ <- LogReg basic
# [w_avg 10 folds] 0.564*$ 0.619*$ 0.528*$ 0.619*$ <- LogReg semtypes
# [w_avg 10 folds] 0.633*  0.659*$ 0.611*$ 0.659*$ <- LogReg cuis
# [w_avg 10 folds] 0.634*  0.661*  0.614*  0.661*  <- LogReg umls
 
# [w_avg 10 folds] 0.374 $ 0.575 $ 0.449 $ 0.575 $ <- AdaBoost basic
# [w_avg 10 folds] 0.496*$ 0.569 $ 0.472*  0.569 $ <- AdaBoost semtypes
# [w_avg 10 folds] 0.442*  0.589*  0.465*  0.589*  <- AdaBoost cuis
# [w_avg 10 folds] 0.442*  0.589*  0.465*  0.589*  <- AdaBoost umls
 
# [w_avg 10 folds] 0.396 $ 0.575 $ 0.447 $ 0.575 $ <- Multinomial basic
# [w_avg 10 folds] 0.526*$ 0.593*$ 0.506*$ 0.593*$ <- Multinomial semtypes
# [w_avg 10 folds] 0.582*  0.623*  0.578*$ 0.623*  <- Multinomial cuis
# [w_avg 10 folds] 0.585*  0.622*  0.585*  0.622*  <- Multinomial umls
 
# [w_avg 10 folds] 0.546 $ 0.586 $ 0.457 $ 0.586 $ <- MLP basic
# [w_avg 10 folds] 0.615*$ 0.647*$ 0.606*$ 0.647*$ <- MLP semtypes
# [w_avg 10 folds] 0.646*  0.668*  0.645*  0.668*  <- MLP cuis
# [w_avg 10 folds] 0.647*  0.669*  0.648*  0.669*  <- MLP umls