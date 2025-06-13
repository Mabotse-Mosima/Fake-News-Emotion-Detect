const fs = require("fs")
const path = require("path")
const https = require("https")

const modelsDir = path.join(process.cwd(), "public", "models")

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true })
}

// List of model files to download
const modelFiles = [
  {
    url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json",
    filename: "tiny_face_detector_model-weights_manifest.json",
  },
  {
    url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1",
    filename: "tiny_face_detector_model-shard1",
  },
  {
    url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json",
    filename: "face_expression_model-weights_manifest.json",
  },
  {
    url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1",
    filename: "face_expression_model-shard1",
  },
  {
    url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json",
    filename: "face_landmark_68_model-weights_manifest.json",
  },
  {
    url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1",
    filename: "face_landmark_68_model-shard1",
  },
  {
    url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json",
    filename: "face_recognition_model-weights_manifest.json",
  },
  {
    url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1",
    filename: "face_recognition_model-shard1",
  },
  {
    url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2",
    filename: "face_recognition_model-shard2",
  },
]

// Download function
function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(modelsDir, filename)

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`File ${filename} already exists, skipping...`)
      resolve()
      return
    }

    console.log(`Downloading ${filename}...`)

    const file = fs.createWriteStream(filePath)
    https
      .get(url, (response) => {
        response.pipe(file)
        file.on("finish", () => {
          file.close()
          console.log(`Downloaded ${filename}`)
          resolve()
        })
      })
      .on("error", (err) => {
        fs.unlink(filePath, () => {}) // Delete the file if there's an error
        reject(err)
      })
  })
}

// Download all model files
async function downloadAllModels() {
  try {
    for (const model of modelFiles) {
      await downloadFile(model.url, model.filename)
    }
    console.log("All model files downloaded successfully!")
  } catch (error) {
    console.error("Error downloading model files:", error)
    process.exit(1)
  }
}

downloadAllModels()
