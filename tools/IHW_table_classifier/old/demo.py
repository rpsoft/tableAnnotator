mystuff = "hello"

print(mystuff)

for a in range(5):
    print(a)


a = (0, 1, 1, 1, 2, 3, 7, 7, 23)

def count_elements(seq) -> dict:
     """Tally elements from `seq`."""
     hist = {}
     for i in seq:
         hist[i] = hist.get(i, 0) + 1
     return hist

counted = count_elements(a)

counted


from scipy import stats
import numpy as np

import matplotlib.pyplot as plt
# An object representing the "frozen" analytical distribution
# Defaults to the standard normal distribution, N~(0, 1)
dist = stats.norm()

# Draw random samples from the population you built above.
# This is just a sample, so the mean and std. deviation should
# be close to (1, 0).
samp = dist.rvs(size=1000)

# `ppf()`: percent point function (inverse of cdf — percentiles).
x = np.linspace(start=stats.norm.ppf(0.01),
                stop=stats.norm.ppf(0.99), num=250)
gkde = stats.gaussian_kde(dataset=samp)

# `gkde.evaluate()` estimates the PDF itself.
fig, ax = plt.subplots()
ax.plot(x, dist.pdf(x), linestyle='solid', c='red', lw=3,
        alpha=0.8, label='Analytical (True) PDF')
ax.plot(x, gkde.evaluate(x), linestyle='dashed', c='black', lw=2,
        label='PDF Estimated via KDE')
ax.legend(loc='best', frameon=False)
ax.set_title('Analytical vs. Estimated PDF')
ax.set_ylabel('Probability')
ax.text(-2., 0.35, r'$f(x) = \frac{\exp(-x^2/2)}{\sqrt{2*\pi}}$',
        fontsize=12)

from gensim.models import Word2Vec
from gensim.models import KeyedVectors


KeyedVectors.word2phrase('text8', 'text8-phrases', verbose=True)

Word2Vec.word2vec('text8-phrases', 'text8.bin', size=100, verbose=True)

Word2Vec.word2clusters('text8', 'text8-clusters.txt', 100, verbose=True)

model = Word2Vec.load('text8.bin')


Word2Vec
model.vocab

model.vectors.shape

model.vectors

model['dog'].shape

model['dog'][:10]

res = model.analogy("dog","cat")

model.word()

model.get_word(res)

model.distance("dog", "cat", "fish")

indexes, metrics = model.similar("dog")
indexes, metrics
