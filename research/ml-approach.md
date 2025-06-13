# Machine Learning Approach to Fake News Detection

This document provides a detailed explanation of the machine learning approach used in our fake news detection system.

## 1. Feature Engineering

Feature engineering is a critical component of our fake news detection system. We extract a rich set of features from news articles to capture various aspects of fake news.

### 1.1 Text Representation Features

#### TF-IDF Vectorization

Term Frequency-Inverse Document Frequency (TF-IDF) is used to convert text into numerical features. This technique captures the importance of words in a document relative to the entire corpus.

```python
from sklearn.feature_extraction.text import TfidfVectorizer

vectorizer = TfidfVectorizer(
    max_features=5000,  # Limit to top 5000 features
    min_df=5,           # Ignore terms that appear in less than 5 documents
    max_df=0.7,         # Ignore terms that appear in more than 70% of documents
    ngram_range=(1, 2)  # Include both unigrams and bigrams
)

X_train_tfidf = vectorizer.fit_transform(X_train)
