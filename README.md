<<<<<<< HEAD
# AI Detection Systems

This repository contains two AI-powered detection systems:

1. **Fake News Detection**: A machine learning system that analyzes news articles to determine if they are likely to be fake or legitimate.
2. **Emotion Detection**: A computer vision system that analyzes facial expressions to detect emotions.

## Features

### Fake News Detection

- Text preprocessing and cleaning
- Feature extraction from news articles
- Machine learning classification
- Detailed explanation of prediction factors
- Web interface for easy interaction

### Emotion Detection

- Real-time webcam integration
- Facial expression analysis
- Emotion classification
- Confidence scoring
- Privacy-focused (all processing done locally)

## Technical Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Python, Flask, scikit-learn, NLTK
- **Machine Learning**: Random Forest, TF-IDF, Feature Engineering
- **Computer Vision**: TensorFlow, OpenCV, Convolutional Neural Networks
- **Deployment**: Docker, Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- Docker (optional)

### Installation

1. Clone the repository:
   \`\`\`
   git clone https://github.com/yourusername/ai-detection-systems.git
   cd ai-detection-systems
   \`\`\`

2. Install frontend dependencies:
   \`\`\`
   npm install
   \`\`\`

3. Install backend dependencies:
   \`\`\`
   cd backend
   pip install -r requirements.txt
   \`\`\`

### Running the Application

1. Start the backend server:
   \`\`\`
   cd backend
   python app.py
   \`\`\`

2. Start the frontend development server:
   \`\`\`
   npm run dev
   \`\`\`

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

\`\`\`
ai-detection-systems/
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   ├── page.tsx          # Main page
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── news-analyzer.tsx # Fake news detection UI
│   ├── emotion-detector.tsx # Emotion detection UI
│   └── ui/               # UI components
├── backend/              # Python backend
│   ├── app.py            # Flask application
│   ├── train_model.py    # Model training script
│   └── requirements.txt  # Python dependencies
├── models/               # Trained models
├── research/             # Research documentation
└── public/               # Static assets
\`\`\`

## Research Background

This project is based on academic research in machine learning, natural language processing, and computer vision. Key papers that influenced this work include:

### Fake News Detection

1. Shu, K., Sliva, A., Wang, S., Tang, J., & Liu, H. (2017). Fake news detection on social media: A data mining perspective. ACM SIGKDD Explorations Newsletter, 19(1), 22-36.

2. Pérez-Rosas, V., Kleinberg, B., Lefevre, A., & Mihalcea, R. (2018). Automatic detection of fake news. Proceedings of the 27th International Conference on Computational Linguistics, 3391-3401.

### Emotion Detection

1. Li, S., & Deng, W. (2020). Deep facial expression recognition: A survey. IEEE Transactions on Affective Computing.

2. Mollahosseini, A., Hasani, B., & Mahoor, M. H. (2017). AffectNet: A database for facial expression, valence, and arousal computing in the wild. IEEE Transactions on Affective Computing, 10(1), 18-31.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The fake news dataset used for training is derived from multiple public sources
- The emotion detection model is trained on publicly available facial expression datasets
- Thanks to the open-source community for the tools and libraries used in this project
\`\`\`

Let's create a detailed API documentation file:
=======
# Fake-News-Emotion-Detect
>>>>>>> ecdd1523f4142dffff65f97ba89ebe272ad932ae
