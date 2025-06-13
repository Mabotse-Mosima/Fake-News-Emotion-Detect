from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import pickle
import numpy as np
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Download necessary NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

app = Flask(__name__)

# Load the trained model and vectorizer
with open('model/fake_news_model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('model/tfidf_vectorizer.pkl', 'rb') as f:
    vectorizer = pickle.load(f)

# Text preprocessing function
def preprocess_text(text):
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters and numbers
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    tokens = [word for word in tokens if word not in stop_words]
    
    # Lemmatization
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(word) for word in tokens]
    
    # Join tokens back into text
    processed_text = ' '.join(tokens)
    
    return processed_text

# Extract additional features
def extract_features(text):
    features = {}
    
    # Count exclamation marks
    features['exclamation_count'] = text.count('!')
    
    # Count question marks
    features['question_count'] = text.count('?')
    
    # Count all caps words
    all_caps = re.findall(r'\b[A-Z]{2,}\b', text)
    features['all_caps_count'] = len(all_caps)
    
    # Average word length
    words = re.findall(r'\b\w+\b', text)
    if words:
        features['avg_word_length'] = sum(len(word) for word in words) / len(words)
    else:
        features['avg_word_length'] = 0
    
    # Text length
    features['text_length'] = len(text)
    
    return features

@app.route('/api/analyze', methods=['POST'])
def analyze_article():
    data = request.json
    
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    
    text = data['text']
    
    try:
        # Preprocess the text
        processed_text = preprocess_text(text)
        
        # Transform text using the vectorizer
        text_vector = vectorizer.transform([processed_text])
        
        # Extract additional features
        additional_features = extract_features(text)
        
        # Convert additional features to array format
        features_array = np.array([[
            additional_features['exclamation_count'],
            additional_features['question_count'],
            additional_features['all_caps_count'],
            additional_features['avg_word_length'],
            additional_features['text_length']
        ]])
        
        # Make prediction
        prediction_proba = model.predict_proba(text_vector)[0]
        fake_probability = prediction_proba[1]  # Probability of being fake news
        prediction = "fake" if fake_probability > 0.5 else "real"
        
        # Calculate feature importance
        feature_importance = {}
        
        # For TF-IDF features, get top words
        if hasattr(model, 'coef_'):
            feature_names = vectorizer.get_feature_names_out()
            coefs = model.coef_[0]
            top_positive_coefs = np.argsort(coefs)[-10:]  # Top 10 features indicating fake news
            top_negative_coefs = np.argsort(coefs)[:10]   # Top 10 features indicating real news
            
            for idx in top_positive_coefs:
                feature_importance[feature_names[idx]] = float(coefs[idx])
                
            for idx in top_negative_coefs:
                feature_importance[feature_names[idx]] = float(coefs[idx])
        
        # Calculate confidence (distance from 0.5)
        confidence = abs(fake_probability - 0.5) * 2
        
        return jsonify({
            'prediction': prediction,
            'confidence': confidence,
            'probability': fake_probability,
            'features': feature_importance
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True)
