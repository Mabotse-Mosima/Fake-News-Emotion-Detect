from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
import pandas as pd
import pickle
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import joblib
import os
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Download NLTK resources if not already downloaded
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')

# Load the trained model and vectorizer
MODEL_PATH = os.path.join('models', 'fake_news_model.pkl')
VECTORIZER_PATH = os.path.join('models', 'tfidf_vectorizer.pkl')
FEATURE_NAMES_PATH = os.path.join('models', 'feature_names.json')

# Create models directory if it doesn't exist
os.makedirs('models', exist_ok=True)

# Check if model files exist, otherwise train a new model
if not (os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH)):
    logger.info("Model files not found. Please run train_model.py first.")
    # For demo purposes, we'll create dummy model files
    from sklearn.datasets import fetch_20newsgroups
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.ensemble import RandomForestClassifier
    
    # Get some sample data
    categories = ['alt.atheism', 'talk.religion.misc']
    newsgroups = fetch_20newsgroups(subset='train', categories=categories)
    
    # Create a simple vectorizer and model
    vectorizer = TfidfVectorizer(max_features=1000)
    X = vectorizer.fit_transform(newsgroups.data)
    y = newsgroups.target  # 0 for real, 1 for fake (just for demo)
    
    # Train a simple model
    model = RandomForestClassifier(n_estimators=10, random_state=42)
    model.fit(X, y)
    
    # Save the model and vectorizer
    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    
    # Save feature names
    feature_names = vectorizer.get_feature_names_out()
    with open(FEATURE_NAMES_PATH, 'w') as f:
        json.dump(list(feature_names), f)
    
    logger.info("Created dummy model files for demonstration purposes.")

# Load the model and vectorizer
model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)

# Load feature names if available
try:
    with open(FEATURE_NAMES_PATH, 'r') as f:
        feature_names = json.load(f)
except:
    feature_names = None
    logger.warning("Feature names file not found.")

# Text preprocessing function
def preprocess_text(text):
    """Clean and preprocess the input text."""
    if not isinstance(text, str) or not text:
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    
    # Remove HTML tags
    text = re.sub(r'<.*?>', '', text)
    
    # Remove special characters and numbers (keep punctuation for now)
    text = re.sub(r'[^a-zA-Z\s.,!?]', '', text)
    
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

# Extract additional features from text
def extract_additional_features(text):
    """Extract linguistic and stylistic features from text."""
    features = {}
    
    # Original text length
    features['text_length'] = len(text)
    
    # Count sentences
    sentences = sent_tokenize(text)
    features['sentence_count'] = len(sentences)
    
    # Average sentence length
    if features['sentence_count'] > 0:
        features['avg_sentence_length'] = features['text_length'] / features['sentence_count']
    else:
        features['avg_sentence_length'] = 0
    
    # Count words
    words = re.findall(r'\b\w+\b', text.lower())
    features['word_count'] = len(words)
    
    # Average word length
    if features['word_count'] > 0:
        features['avg_word_length'] = sum(len(word) for word in words) / features['word_count']
    else:
        features['avg_word_length'] = 0
    
    # Count punctuation
    features['exclamation_count'] = text.count('!')
    features['question_count'] = text.count('?')
    features['comma_count'] = text.count(',')
    features['period_count'] = text.count('.')
    
    # Count capitalized words (excluding first words in sentences)
    features['capitalized_word_count'] = len(re.findall(r'(?<!^)(?<!\. )[A-Z][a-z]+', text))
    
    # Count all caps words
    features['all_caps_count'] = len(re.findall(r'\b[A-Z]{2,}\b', text))
    
    # Sensationalist language (simplified)
    sensationalist_words = [
        'shocking', 'bombshell', 'explosive', 'stunning', 'unbelievable',
        'outrageous', 'scandal', 'secret', 'breaking', 'exclusive', 'urgent'
    ]
    features['sensationalist_word_count'] = sum(1 for word in words if word.lower() in sensationalist_words)
    
    # Emotional language (simplified)
    emotional_words = [
        'angry', 'furious', 'outraged', 'devastated', 'thrilled', 'excited',
        'terrified', 'scared', 'afraid', 'happy', 'sad', 'disgusted', 'hate', 'love'
    ]
    features['emotional_word_count'] = sum(1 for word in words if word.lower() in emotional_words)
    
    # Clickbait patterns (simplified)
    clickbait_patterns = [
        'you won\'t believe', 'mind blowing', 'what happens next', 'this is why',
        'here\'s why', 'find out', 'the truth about', 'will shock you'
    ]
    features['clickbait_pattern_count'] = sum(1 for pattern in clickbait_patterns if pattern in text.lower())
    
    # Normalize counts by text length where appropriate
    if features['word_count'] > 0:
        features['sensationalist_ratio'] = features['sensationalist_word_count'] / features['word_count']
        features['emotional_ratio'] = features['emotional_word_count'] / features['word_count']
        features['all_caps_ratio'] = features['all_caps_count'] / features['word_count']
    else:
        features['sensationalist_ratio'] = 0
        features['emotional_ratio'] = 0
        features['all_caps_ratio'] = 0
    
    return features

# Get feature importance
def get_feature_importance(text, prediction_proba):
    """Extract feature importance for the prediction."""
    # Process the text
    processed_text = preprocess_text(text)
    
    # Transform text using the vectorizer
    text_vector = vectorizer.transform([processed_text])
    
    # Get feature importance if possible
    feature_importance = {}
    
    if hasattr(model, 'feature_importances_') and feature_names:
        # For tree-based models
        importances = model.feature_importances_
        
        # Get non-zero elements from the sparse matrix
        non_zero_indices = text_vector.nonzero()[1]
        
        # Map indices to feature names and importances
        for idx in non_zero_indices:
            if idx < len(feature_names):
                feature_name = feature_names[idx]
                importance = importances[idx] if idx < len(importances) else 0
                feature_importance[feature_name] = float(importance)
    
    elif hasattr(model, 'coef_') and feature_names:
        # For linear models
        coefs = model.coef_[0]
        
        # Get non-zero elements from the sparse matrix
        non_zero_indices = text_vector.nonzero()[1]
        
        # Map indices to feature names and coefficients
        for idx in non_zero_indices:
            if idx < len(feature_names):
                feature_name = feature_names[idx]
                coef = coefs[idx] if idx < len(coefs) else 0
                # Scale coefficient by the feature value
                value = text_vector[0, idx]
                feature_importance[feature_name] = float(coef * value)
    
    # Sort by absolute importance and take top features
    sorted_importance = sorted(
        feature_importance.items(),
        key=lambda x: abs(x[1]),
        reverse=True
    )[:10]  # Top 10 features
    
    return dict(sorted_importance)

@app.route('/api/analyze', methods=['POST'])
def analyze_article():
    """API endpoint to analyze a news article."""
    try:
        data = request.json
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        
        # Log the request (excluding the full text for privacy)
        logger.info(f"Received analysis request: {len(text)} characters")
        
        # Preprocess the text
        processed_text = preprocess_text(text)
        
        # Transform text using the vectorizer
        text_vector = vectorizer.transform([processed_text])
        
        # Extract additional features
        additional_features = extract_additional_features(text)
        
        # Make prediction
        prediction_proba = model.predict_proba(text_vector)[0]
        fake_probability = prediction_proba[1]  # Assuming 1 is the fake class
        prediction = "fake" if fake_probability > 0.5 else "real"
        
        # Get feature importance
        feature_importance = get_feature_importance(text, prediction_proba)
        
        # Calculate confidence (distance from 0.5)
        confidence = abs(fake_probability - 0.5) * 2
        
        # Prepare response
        response = {
            'prediction': prediction,
            'confidence': float(confidence),
            'probability': float(fake_probability),
            'features': feature_importance,
            'additional_features': {k: float(v) if isinstance(v, (int, float, np.number)) else v 
                                   for k, v in additional_features.items()}
        }
        
        # Log the result
        logger.info(f"Analysis result: {prediction} with {confidence:.2f} confidence")
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in analyze_article: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/')
def index():
    """Serve the main page."""
    return render_template('index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
