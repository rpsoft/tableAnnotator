#'title' denotes the exact title of the article to be fetched
from gensim.parsing import PorterStemmer
global_stemmer = PorterStemmer()

from nltk.downloader import download
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
# example_sent = "This is a sample sentence, showing off the stop words filtration."

download('stopwords')
download('punkt')

stop_words = set(stopwords.words('english'))
#
# word_tokens = word_tokenize(example_sent)
#
# filtered_sentence = [w for w in word_tokens if not w in stop_words]
#
# filtered_sentence = []
#
# stop_words
#
# for w in word_tokens:
#     if w not in stop_words:
#         filtered_sentence.append(w)
#
# print(word_tokens)
# print(filtered_sentence)

class StemmingHelper(object):
    """
    Class to aid the stemming process - from word to stemmed form,
    and vice versa.
    The 'original' form of a stemmed word will be returned as the
    form in which its been used the most number of times in the text.
    """

    #This reverse lookup will remember the original forms of the stemmed
    #words
    word_lookup = {}

    @classmethod
    def stem(cls, word):
        """
        Stems a word and updates the reverse lookup.
        """

        #Stem the word
        stemmed = global_stemmer.stem(word)

        #Update the word lookup
        if stemmed not in cls.word_lookup:
            cls.word_lookup[stemmed] = {}
        cls.word_lookup[stemmed][word] = (
            cls.word_lookup[stemmed].get(word, 0) + 1)

        return stemmed

    @classmethod
    def original_form(cls, word):
        """
        Returns original form of a word given the stemmed version,
        as stored in the word lookup.
        """

        if word in cls.word_lookup:
            return max(cls.word_lookup[word].keys(),
                       key=lambda x: cls.word_lookup[word][x])
        else:
            return word

    @classmethod
    def stemSentence(cls, words):
        res = []
        for w in words:
            if cls.stem(w) not in stop_words:
                if len(cls.stem(w)) > 3 :
                    res.append(cls.stem(w))
            else:
                print(w)
        return res

    @classmethod
    def unstemSentence(cls, words):
        res = []
        for w in words:
            res.append(cls.original_form(w))
        return res


StemmingHelper.stem('learning')
StemmingHelper.original_form('learn')

from gensim.models import Word2Vec
min_count = 2
size = 50
window = 4

import re, string; pattern = re.compile('([^\s\w]|_)+')

sentences =[]
with open("data.txt", "r",encoding="utf8") as ins:
    sentences = []
    for line in ins:
        sentences.insert(len(sentences), StemmingHelper.stemSentence(pattern.sub('', line).split()))


model =  Word2Vec(sentences, min_count=3)

words = list(model.wv.vocab)
print(words)

model.wv.most_similar(positive= StemmingHelper.stemSentence(['machine', 'language']), negative= StemmingHelper.stemSentence(['knowledge']), topn=5)


StemmingHelper.unstemSentence(model.wv.most_similar(positive= StemmingHelper.stemSentence(['machine','language']), negative= StemmingHelper.stemSentence(['knowledge']), topn=20))

StemmingHelper.unstemSentence(model.wv.most_similar(positive= StemmingHelper.stemSentence(['supervised','language']), negative= StemmingHelper.stemSentence(['unsupervised']), topn=5))

StemmingHelper.unstemSentence(model.wv.most_similar(positive= StemmingHelper.stemSentence(['language','supervised']), negative= StemmingHelper.stemSentence(['unsupervised']), topn=5))



StemmingHelper.original_form("exampl")

model.wv.n_similarity([StemmingHelper.stem("machine")],[StemmingHelper.stem("output")])
model.wv.n_similarity([StemmingHelper.stem("machine")],[StemmingHelper.stem("learn")])
model.wv.n_similarity([StemmingHelper.stem("supervised")],[StemmingHelper.stem("unsupervised"),StemmingHelper.stem("data")])
model.wv.n_similarity([StemmingHelper.stem("machine")],[StemmingHelper.stem("output"),StemmingHelper.stem("data")])
model.wv.n_similarity([StemmingHelper.stem("machine")],[StemmingHelper.stem("output"),StemmingHelper.stem("data")])
