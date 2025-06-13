import pandas as pd
import numpy as np
import os
import re
import json
import pickle
import logging
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.metrics import confusion_matrix, classification_report, roc_curve, auc
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import joblib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f"training_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Download NLTK resources if not already downloaded
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')

# Create directories
os.makedirs('models', exist_ok=True)
os.makedirs('results', exist_ok=True)

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

def load_data(filepath):
    """Load and prepare the dataset."""
    logger.info(f"Loading data from {filepath}")
    
    # Load the dataset
    df = pd.read_csv(filepath)
    
    # Check required columns
    required_columns = ['text', 'label']
    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Required column '{col}' not found in the dataset")
    
    # Basic data cleaning
    df = df.dropna(subset=['text', 'label'])
    
    # Ensure label is binary (0 for real, 1 for fake)
    if df['label'].nunique() > 2:
        logger.warning("Label column has more than 2 unique values. Converting to binary.")
        # Map non-zero values to 1 (fake)
        df['label'] = df['label'].apply(lambda x: 1 if x != 0 else 0)
    
    logger.info(f"Dataset loaded: {len(df)} rows")
    logger.info(f"Class distribution: {df['label'].value_counts().to_dict()}")
    
    return df

def train_and_evaluate_models(df, test_size=0.2, random_state=42):
    """Train and evaluate multiple models."""
    logger.info("Starting model training and evaluation")
    
    # Preprocess text
    logger.info("Preprocessing text data...")
    df['processed_text'] = df['text'].apply(preprocess_text)
    
    # Split the dataset
    X_train, X_test, y_train, y_test = train_test_split(
        df['processed_text'], 
        df['label'], 
        test_size=test_size, 
        random_state=random_state,
        stratify=df['label']  # Ensure balanced classes in train and test sets
    )
    
    logger.info(f"Training set: {len(X_train)} samples")
    logger.info(f"Test set: {len(X_test)} samples")
    
    # Define vectorizers
    vectorizers = {
        'tfidf': TfidfVectorizer(
            max_features=5000,
            min_df=5,
            max_df=0.7,
            ngram_range=(1, 2)
        ),
        'count': CountVectorizer(
            max_features=5000,
            min_df=5,
            max_df=0.7,
            ngram_range=(1, 2)
        )
    }
    
    # Define models
    models = {
        'random_forest': RandomForestClassifier(
            n_estimators=100,
            random_state=random_state,
            class_weight='balanced'
        ),
        'logistic_regression': LogisticRegression(
            C=1.0,
            class_weight='balanced',
            max_iter=1000,
            random_state=random_state
        ),
        'gradient_boosting': GradientBoostingClassifier(
            n_estimators=100,
            random_state=random_state
        ),
        'linear_svc': LinearSVC(
            C=1.0,
            class_weight='balanced',
            max_iter=10000,
            random_state=random_state
        )
    }
    
    # Train and evaluate each combination
    results = []
    best_model = None
    best_vectorizer = None
    best_f1 = 0
    
    for vec_name, vectorizer in vectorizers.items():
        logger.info(f"Vectorizing with {vec_name}...")
        X_train_vec = vectorizer.fit_transform(X_train)
        X_test_vec = vectorizer.transform(X_test)
        
        # Save feature names
        feature_names = vectorizer.get_feature_names_out()
        
        for model_name, model in models.items():
            logger.info(f"Training {model_name} with {vec_name} vectorizer...")
            
            # Train the model
            model.fit(X_train_vec, y_train)
            
            # Make predictions
            y_pred = model.predict(X_test_vec)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred)
            recall = recall_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred)
            
            logger.info(f"{model_name} with {vec_name} - Accuracy: {accuracy:.4f}, F1: {f1:.4f}")
            
            # Save results
            result = {
                'model_name': model_name,
                'vectorizer_name': vec_name,
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1': f1
            }
            results.append(result)
            
            # Check if this is the best model so far
            if f1 > best_f1:
                best_f1 = f1
                best_model = model
                best_vectorizer = vectorizer
                best_model_name = model_name
                best_vec_name = vec_name
    
    # Save results to CSV
    results_df = pd.DataFrame(results)
    results_df.to_csv('results/model_comparison.csv', index=False)
    
    logger.info(f"Best model: {best_model_name} with {best_vec_name} vectorizer (F1: {best_f1:.4f})")
    
    # Detailed evaluation of the best model
    X_test_vec = best_vectorizer.transform(X_test)
    y_pred = best_model.predict(X_test_vec)
    
    # Classification report
    report = classification_report(y_test, y_pred)
    logger.info(f"Classification Report:\n{report}")
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    logger.info(f"Confusion Matrix:\n{cm}")
    
    # Save confusion matrix plot
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=['Real', 'Fake'], 
                yticklabels=['Real', 'Fake'])
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.title('Confusion Matrix')
    plt.tight_layout()
    plt.savefig('results/confusion_matrix.png')
    
    # ROC curve if the model supports predict_proba
    if hasattr(best_model, 'predict_proba'):
        y_proba = best_model.predict_proba(X_test_vec)[:, 1]
        fpr, tpr, _ = roc_curve(y_test, y_proba)
        roc_auc = auc(fpr, tpr)
        
        plt.figure(figsize=(8, 6))
        plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (area = {roc_auc:.2f})')
        plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('Receiver Operating Characteristic')
        plt.legend(loc="lower right")
        plt.savefig('results/roc_curve.png')
    
    # Save the best model and vectorizer
    joblib.dump(best_model, 'models/fake_news_model.pkl')
    joblib.dump(best_vectorizer, 'models/tfidf_vectorizer.pkl')
    
    # Save feature names
    with open('models/feature_names.json', 'w') as f:
        json.dump(list(best_vectorizer.get_feature_names_out()), f)
    
    logger.info("Model and vectorizer saved successfully!")
    
    return best_model, best_vectorizer, results_df

def main():
    """Main function to run the training pipeline."""
    logger.info("Starting fake news detection model training")
    
    # Define the dataset path
    dataset_path = 'data/fake_news_dataset.csv'
    
    # Check if the dataset exists
    if not os.path.exists(dataset_path):
        logger.error(f"Dataset not found at {dataset_path}")
        logger.info("Creating a dummy dataset for demonstration purposes")
        
        # Create a dummy dataset
        from sklearn.datasets import fetch_20newsgroups
        
        # Get some sample data
        categories = ['alt.atheism', 'talk.religion.misc']
        newsgroups = fetch_20newsgroups(subset='train', categories=categories)
        
        # Create a DataFrame
        df = pd.DataFrame({
            'text': newsgroups.data,
            'label': newsgroups.target  # 0 for real, 1 for fake (just for demo)
        })
        
        # Save the dummy dataset
        os.makedirs('data', exist_ok=True)
        df.to_csv(dataset_path, index=False)
        logger.info(f"Dummy dataset created with {len(df)} samples")
    
    # Load the dataset
    df = load_data(dataset_path)
    
    # Train and evaluate models
    best_model, best_vectorizer, results = train_and_evaluate_models(df)
    
    logger.info("Training completed successfully!")

if __name__ == "__main__":
    main()
