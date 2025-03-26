import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Camera, CheckCircle, XCircle, AlertCircle, RefreshCw, AlertTriangle, Info } from "lucide-react"

const IngredientScanner = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [scanResult, setScanResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDetails, setShowDetails] = useState({})

  const fileInputRef = useRef(null)

  //dummy scan results
  const mockScanResult = {
    overallRating: "Caution",
    overallColor: "text-yellow-500 dark:text-yellow-400",
    userSpecificWarning: "Contains peanuts (you have a peanut allergy)",
    ingredients: [
      {
        name: "Whole Grain Wheat",
        safety: "safe",
        description: "A nutritious grain that provides fiber and essential nutrients.",
      },
      {
        name: "Peanuts",
        safety: "danger",
        description: "Common allergen that can cause severe reactions in sensitive individuals.",
        warning: "You have a peanut allergy listed in your profile.",
      },
      {
        name: "High Fructose Corn Syrup",
        safety: "caution",
        description: "A sweetener that may contribute to weight gain and metabolic issues when consumed in excess.",
      },
      {
        name: "Sodium Nitrite",
        safety: "caution",
        description:
          "A preservative that in high amounts has been linked to increased risk of certain health conditions.",
      },
      {
        name: "Vitamin B12",
        safety: "safe",
        description: "An essential vitamin that helps keep the body's nerve and blood cells healthy.",
      },
      {
        name: "Natural Flavors",
        safety: "info",
        description: "A broad term for flavoring agents derived from plant or animal sources.",
      },
    ],
    nutritionalComments: [
      "High in added sugars compared to your daily recommended intake",
      "Contains moderate amount of sodium",
      "Good source of fiber",
    ],
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]

    if (selectedFile) {
      setFile(selectedFile)

      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result)
        setScanResult(null)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)

      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result)
        setScanResult(null)
      }
      reader.readAsDataURL(droppedFile)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const analyzeImage = () => {
    setIsAnalyzing(true)

    //API call delay mock
    setTimeout(() => {
      setScanResult(mockScanResult)
      setIsAnalyzing(false)
    }, 2000)
  }

  const resetScanner = () => {
    setFile(null)
    setPreview(null)
    setScanResult(null)
  }

  const toggleDetails = (ingredient) => {
    setShowDetails((prev) => ({
      ...prev,
      [ingredient]: !prev[ingredient],
    }))
  }

  //Safety badge colors
  const safetyColors = {
    safe: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
    caution: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
    danger: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300",
    info: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
  }

  //Safety icons
  const safetyIcons = {
    safe: <CheckCircle size={16} className="mr-1" />,
    caution: <AlertTriangle size={16} className="mr-1" />,
    danger: <XCircle size={16} className="mr-1" />,
    info: <Info size={16} className="mr-1" />,
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="health-container py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Ingredient Scanner</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Upload an image of product ingredients to get personalized health insights
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Upload Section */}
        <motion.div variants={itemVariants} className="card">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Upload Image</h2>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

            {!preview ? (
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors"
                onClick={triggerFileInput}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="flex flex-col items-center">
                  <Upload className="mb-2 text-gray-400 dark:text-gray-500" size={40} />
                  <p className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-200">
                    Drag & Drop or Click to Upload
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Upload a clear image of product ingredients
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Ingredient label preview"
                  className="rounded-lg w-full object-contain max-h-80"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md"
                      onClick={triggerFileInput}
                    >
                      <RefreshCw size={20} className="text-gray-700 dark:text-gray-300" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md"
                      onClick={resetScanner}
                    >
                      <XCircle size={20} className="text-red-500" />
                    </motion.button>
                    {!isAnalyzing && !scanResult && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-emerald-500 dark:bg-emerald-600 p-2 rounded-full shadow-md"
                        onClick={analyzeImage}
                      >
                        <Camera size={20} className="text-white" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {preview && !scanResult && (
              <div className="mt-4 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary flex items-center"
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="mr-2 animate-spin" size={16} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2" size={16} />
                      Analyze Ingredients
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Results Section */}
        <motion.div variants={itemVariants} className={`card ${!scanResult && !isAnalyzing ? "opacity-50" : ""}`}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Analysis Results</h2>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="animate-spin text-emerald-500 dark:text-emerald-400 mb-4" size={40} />
                <p className="text-gray-600 dark:text-gray-400">Analyzing ingredients...</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">This may take a few moments</p>
              </div>
            ) : scanResult ? (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center mb-2">
                    <div className={`text-2xl font-bold ${scanResult.overallColor}`}>{scanResult.overallRating}</div>
                  </div>

                  {scanResult.userSpecificWarning && (
                    <div className="flex items-start mt-2 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-100 dark:border-red-800">
                      <AlertCircle size={20} className="text-red-500 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 dark:text-red-300 text-sm">{scanResult.userSpecificWarning}</p>
                    </div>
                  )}

                  <div className="mt-4">
                    <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Nutritional Assessment</h3>
                    <ul className="space-y-1">
                      {scanResult.nutritionalComments.map((comment, index) => (
                        <li key={index} className="text-sm flex items-start text-gray-700 dark:text-gray-300">
                          <span className="mr-2">•</span>
                          {comment}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Ingredient Breakdown</h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {scanResult.ingredients.map((ingredient, index) => (
                        <motion.div
                          key={ingredient.name}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                          <div
                            className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => toggleDetails(ingredient.name)}
                          >
                            <div className="flex items-center">
                              <span className={`pill-button mr-2 flex items-center ${safetyColors[ingredient.safety]}`}>
                                {safetyIcons[ingredient.safety]}
                                {ingredient.safety.charAt(0).toUpperCase() + ingredient.safety.slice(1)}
                              </span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{ingredient.name}</span>
                            </div>
                            <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                              {showDetails[ingredient.name] ? (
                                <XCircle size={18} className="text-gray-500 dark:text-gray-400" />
                              ) : (
                                <Info size={18} className="text-gray-500 dark:text-gray-400" />
                              )}
                            </button>
                          </div>

                          {showDetails[ingredient.name] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="px-3 pb-3"
                            >
                              <p className="text-sm text-gray-600 dark:text-gray-400">{ingredient.description}</p>

                              {ingredient.warning && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 rounded border border-red-100 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                                  {ingredient.warning}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 text-gray-500 dark:text-gray-400">
                <Camera size={40} className="mb-4 opacity-50" />
                <p className="mb-2">No analysis results yet</p>
                <p className="text-sm">Upload an image and analyze to see personalized insights</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Instructions Card */}
      <motion.div variants={itemVariants} className="card mt-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-4">
                <Upload className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Step 1: Upload Image</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Take a clear photo of the product's ingredient list or upload an existing image
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-4">
                <Camera className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Step 2: Analyze</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our AI model will scan and identify all ingredients from the image
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-4">
                <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Step 3: Get Personalized Results</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive tailored analysis based on your health profile and dietary needs
              </p>
            </div>
          </div>
          <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
            <span className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 pill-button mr-1">
              Note
            </span>
            For best results, ensure the ingredient list is clearly visible and well-lit in your photo
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default IngredientScanner

