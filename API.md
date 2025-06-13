# API Documentation

This document provides detailed information about the API endpoints available in the AI Detection Systems.

## Base URL

For local development:
\`\`\`
http://localhost:5000
\`\`\`

For production:
\`\`\`
https://api.aidetectionsystems.com
\`\`\`

## Authentication

Currently, the API does not require authentication for demonstration purposes. In a production environment, authentication would be implemented using API keys or OAuth.

## Fake News Detection API

### Analyze Article

Analyzes a news article to determine if it's likely to be fake or legitimate.

**Endpoint:** `/api/analyze`

**Method:** `POST`

**Content-Type:** `application/json`

**Request Body:**

\`\`\`json
{
  "text": "The full text of the news article to analyze"
}
\`\`\`

**Response:**

\`\`\`json
{
  "prediction": "fake",
  "confidence": 0.85,
  "probability": 0.925,
  "features": {
    "sensationalist_language": 0.9,
    "all_caps_usage": 0.8,
    "exclamation_marks": 0.7,
    "question_marks": 0.5,
    "text_length": 0.3
  },
  "additional_features": {
    "text_length": 1250,
    "exclamation_count": 5,
    "question_count": 3,
    "all_caps_count": 8,
    "sensationalist_word_count": 6,
    "avg_word_length": 4.7
  }
}
\`\`\`

**Response Fields:**

- `prediction`: Either "fake" or "real"
- `confidence`: A value between 0 and 1 indicating the confidence in the prediction
- `probability`: The raw probability of the article being fake (0-1)
- `features`: Key features that influenced the prediction, with their importance scores
- `additional_features`: Additional statistics about the text

**Status Codes:**

- `200 OK`: Analysis completed successfully
- `400 Bad Request`: Missing or invalid text
- `500 Internal Server Error`: Server error during analysis

**Example:**

\`\`\`bash
curl -X POST \
  http://localhost:5000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "SHOCKING NEWS! You won't BELIEVE what happened next! Scientists STUNNED by this INCREDIBLE discovery that will CHANGE EVERYTHING!"
  }'
\`\`\`

### Health Check

Checks if the API is running properly.

**Endpoint:** `/api/health`

**Method:** `GET`

**Response:**

\`\`\`json
{
  "status": "healthy",
  "timestamp": "2023-06-12T15:30:45.123Z"
}
\`\`\`

**Status Codes:**

- `200 OK`: API is healthy
- `500 Internal Server Error`: API is experiencing issues

## Emotion Detection API

### Detect Emotion

Analyzes an image to detect facial expressions and emotions.

**Endpoint:** `/api/detect-emotion`

**Method:** `POST`

**Content-Type:** `multipart/form-data`

**Request Parameters:**

- `image`: The image file containing a face
- `demo` (optional): Set to "true" to use demo mode

**Response:**

\`\`\`json
{
  "success": true,
  "emotion": "happy",
  "confidence": 0.92,
  "demo": false
}
\`\`\`

**Response Fields:**

- `success`: Boolean indicating if the detection was successful
- `emotion`: The detected emotion (happy, sad, angry, surprised, fearful, disgusted, neutral)
- `confidence`: A value between 0 and 1 indicating the confidence in the detection
- `demo`: Boolean indicating if the result is from demo mode

**Status Codes:**

- `200 OK`: Detection completed successfully
- `400 Bad Request`: Missing or invalid image
- `500 Internal Server Error`: Server error during detection

**Example:**

\`\`\`bash
curl -X POST \
  http://localhost:5000/api/detect-emotion \
  -H 'Content-Type: multipart/form-data' \
  -F 'image=@/path/to/face.jpg'
\`\`\`

## Error Handling

All API endpoints return errors in the following format:

\`\`\`json
{
  "error": "Description of the error"
}
\`\`\`

## Rate Limiting

In a production environment, rate limiting would be implemented to prevent abuse. The current limits would be:

- Fake News Detection: 100 requests per hour per IP
- Emotion Detection: 50 requests per hour per IP

## Versioning

The current API version is v1. The version is included in the base URL:

\`\`\`
https://api.aidetectionsystems.com/v1/
\`\`\`

Future versions will be available at:

\`\`\`
https://api.aidetectionsystems.com/v2/
\`\`\`

## Changelog

### v1.0.0 (2023-06-12)

- Initial release
- Added fake news detection endpoint
- Added emotion detection endpoint
- Added health check endpoint
\`\`\`

Let's create a Docker Compose file for easy deployment:
