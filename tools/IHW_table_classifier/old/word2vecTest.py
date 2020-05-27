import predictor_1

from gensim.test.utils import datapath
from gensim.models.word2vec import Text8Corpus
from gensim.models.phrases import Phrases, Phraser


sentences = Text8Corpus()
phrases = Phrases(sentences, min_count=1, threshold=1)  # train model
phrases[[u'foundation', u'page', u'culture']]  # apply model to sentence


phrases.add_vocab([["hello", "world"], ["meow"]])  # update model with new sentences
bigram = Phraser(phrases)  # construct faster model (this is only an wrapper)
bigram[[u'trees', u'graph', u'minors']]  # apply model to sentence


gensim.utils.simple_preprocess ("me la come mucho POR ABAJO")


model = gensim.models.Word2Vec(
    documents,
        size=150,
        window=10,
        min_count=2,
        workers=10)

model.train(documents, total_examples=len(documents), epochs=10)