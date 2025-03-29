import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Camera, CheckCircle, XCircle, AlertCircle, RefreshCw, AlertTriangle, Info } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const IngredientScanner = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [scanResult, setScanResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDetails, setShowDetails] = useState({})
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);

  const fileInputRef = useRef(null)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const analyzeImage = async () => {
    if (!file) {
      alert("Please upload an image before analyzing.")
      return
    }

    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/upload`, {
        method: "POST",
        credentials: "include", // Include cookies for authentication
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze the image.")
      }

      const data = await response.json()
      console.log("Analysis Result:", data)

      // Update scanResult with the response from the backend
      setScanResult(data.groqResponse)
      console.log("Scan Result:", data.groqResponse)
    } catch (error) {
      console.error("Error during image analysis:", error.message)
      alert(error.message)
    } finally {
      setIsAnalyzing(false)
    }
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

  // Add this function to group ingredients by safety
  const groupIngredientsBySafety = (ingredients) => {
    return ingredients.reduce((groups, ingredient) => {
      const { safety } = ingredient
      if (!groups[safety]) {
        groups[safety] = []
      }
      groups[safety].push(ingredient)
      return groups
    }, {})
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

  // Function to prepare data for macronutrient chart
  const prepareMacroData = (nutrition) => {
    if (!nutrition) return [];
    
    const carbs = nutrition["Carbohydrate"]?.per_100g || 0;
    const protein = nutrition["Protein"]?.per_100g || 0;
    const fat = nutrition["Total fat"]?.per_100g || 0;
    
    return [
      { name: 'Carbs', value: carbs, color: '#4ade80' },
      { name: 'Protein', value: protein, color: '#60a5fa' },
      { name: 'Fat', value: fat, color: '#f87171' }
    ].filter(item => item.value > 0);
  };
  
  // Function to prepare data for fat composition chart
  const prepareFatData = (nutrition) => {
    if (!nutrition) return [];
    
    const saturated = nutrition["Saturated fat"]?.per_100g || 0;
    const trans = nutrition["Trans fat"]?.per_100g || 0;
    const total = nutrition["Total fat"]?.per_100g || 0;
    const otherFats = Math.max(0, total - saturated - trans);
    
    return [
      { name: 'Saturated', value: saturated, color: '#ef4444' },
      { name: 'Trans', value: trans, color: '#f97316' },
      { name: 'Other Fats', value: otherFats, color: '#facc15' }
    ].filter(item => item.value > 0);
  };
  
  // Function to prepare data for sugar breakdown chart
  const prepareSugarData = (nutrition) => {
    if (!nutrition) return [];
    
    const totalSugar = nutrition["Total Sugars"]?.per_100g || 0;
    const addedSugar = nutrition["Added Sugars"]?.per_100g || 0;
    const naturalSugar = Math.max(0, totalSugar - addedSugar);
    
    return [
      { name: 'Added Sugar', value: addedSugar, color: '#f87171' },
      { name: 'Natural Sugar', value: naturalSugar, color: '#fcd34d' }
    ].filter(item => item.value > 0);
  };
  
  // Function to prepare data for sodium and other nutrients
  const prepareNutrientData = (nutrition) => {
    if (!nutrition) return [];
    
    // Get sodium value and RDA percentage
    const sodium = nutrition["Sodium"]?.per_100g || 0;
    const sodiumRda = nutrition["Sodium"]?.rda_percentage || 0;
    
    // Add other key nutrients if available
    const nutrients = [
      { name: 'Sodium', value: sodiumRda, unit: 'mg', amount: sodium, color: '#fb7185' }
    ];
    
    // Add other nutrients if they exist in the data
    ['Calcium', 'Iron', 'Potassium', 'Vitamin A', 'Vitamin C'].forEach(nutrient => {
      if (nutrition[nutrient] && nutrition[nutrient].rda_percentage) {
        nutrients.push({
          name: nutrient,
          value: nutrition[nutrient].rda_percentage,
          unit: nutrition[nutrient].unit,
          amount: nutrition[nutrient].per_100g,
          color: getRandomColor(nutrient)
        });
      }
    });
    
    return nutrients;
  };
  
  // Function to get a consistent color for a given nutrient
  const getRandomColor = (str) => {
    const colors = [
      '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', 
      '#84cc16', '#eab308', '#f59e0b', '#f97316',
      '#ef4444', '#ec4899', '#d946ef', '#a855f7'
    ];
    
    // Simple hash function to get a consistent index for each string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // Add this new function to prepare data for nutritional weight distribution chart
  const prepareNutritionalWeightData = (nutrition) => {
    if (!nutrition) return [];
    
    // Filter for entries with unit 'g' or 'mg' and convert mg to g (divide by 1000)
    const weightData = Object.entries(nutrition)
      .filter(([name, info]) => (info.unit === 'g' || info.unit === 'mg') && info.per_100g !== null)
      .map(([name, info]) => ({
        name: name,
        value: info.unit === 'mg' ? info.per_100g / 1000 : info.per_100g, // Convert mg to g for consistent scale
        originalValue: info.per_100g,
        unit: info.unit,
        color: getRandomColor(name)
      }));
    
    // Filter out any zero values
    return weightData.filter(item => item.value > 0);
  };

  // Custom tooltip for the weight distribution chart
  const NutritionalWeightTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-md">
          <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {data.originalValue} {data.unit} per 100g
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {(payload[0].percent * 100).toFixed(1)}% of measured weight
          </p>
        </div>
      );
    }
    return null;
  };

  // Helper function to render the nutritional weight chart responsively
  const renderNutritionalWeightChart = () => {
    const data = prepareNutritionalWeightData(scanResult.nutrition_info);
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
          No weight-based nutritional data available
        </div>
      );
    }
    
    // Determine if we're on mobile
    const isMobile = windowWidth < 768;
    
    return (
      <div className="h-[300px] md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={!isMobile}
              label={isMobile ? null : ({ name, percent }) => 
                `${name.length > 8 ? name.substring(0, 8) + '...' : name} (${(percent * 100).toFixed(0)}%)`
              }
              outerRadius={isMobile ? 70 : 100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<NutritionalWeightTooltip />} />
            <Legend 
              layout={isMobile ? "horizontal" : "vertical"}
              align={isMobile ? "center" : "right"}
              verticalAlign={isMobile ? "bottom" : "middle"}
              wrapperStyle={isMobile ? { fontSize: '10px' } : null}
              formatter={(value) => value.length > (isMobile ? 10 : 15) ? `${value.substring(0, isMobile ? 10 : 15)}...` : value}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

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
                  <div className="space-y-6">
                    <AnimatePresence>
                      {Object.entries(groupIngredientsBySafety(scanResult.ingredients)).map(([safety, ingredients]) => (
                        <motion.div 
                          key={safety} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`border rounded-lg overflow-hidden ${
                            safety === 'danger' 
                              ? 'border-red-200 dark:border-red-800' 
                              : safety === 'caution'
                                ? 'border-yellow-200 dark:border-yellow-800'
                                : safety === 'safe'
                                  ? 'border-green-200 dark:border-green-800'
                                  : 'border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          <div className={`p-3 ${safetyColors[safety]} flex items-center`}>
                            {safetyIcons[safety]}
                            <span className="font-medium ml-1">
                              {safety.charAt(0).toUpperCase() + safety.slice(1)} Ingredients
                            </span>
                          </div>
                          
                          <div className="p-3 bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {ingredients.map((ingredient, index) => (
                              <motion.div
                                key={ingredient.name}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="py-2 first:pt-0 last:pb-0"
                              >
                                {/* Ingredient Header */}
                                <div
                                  className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                                  onClick={() => toggleDetails(ingredient.name)}
                                >
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{ingredient.name}</span>
                                  </div>
                                  {/* Toggle Button */}
                                  <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600">
                                    {showDetails[ingredient.name] ? (
                                      <XCircle size={18} className="text-gray-500 dark:text-gray-400" />
                                    ) : (
                                      <Info size={18} className="text-gray-500 dark:text-gray-400" />
                                    )}
                                  </button>
                                </div>

                                {/* Ingredient Details (Expandable Section) */}
                                {showDetails[ingredient.name] && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="px-2 pt-2"
                                  >
                                    {/* Description */}
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{ingredient.description}</p>

                                    {/* Warning (if present) */}
                                    {ingredient.warning && (
                                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 rounded border border-red-100 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                                        {ingredient.warning}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </motion.div>
                            ))}
                          </div>
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

      {/* Nutritional Charts Section */}
      {scanResult && scanResult.nutrition_info && (
        <motion.div 
          variants={itemVariants} 
          className="card mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Nutritional Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Macronutrient Breakdown */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">Macronutrient Breakdown</h3>
                {prepareMacroData(scanResult.nutrition_info).length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={prepareMacroData(scanResult.nutrition_info)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {prepareMacroData(scanResult.nutrition_info).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value.toFixed(1)}g`, 'Amount']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb', 
                            color: '#1f2937'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
                    No macronutrient data available
                  </div>
                )}
              </div>
              
              {/* Fat Composition */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">Fat Composition</h3>
                {prepareFatData(scanResult.nutrition_info).length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={prepareFatData(scanResult.nutrition_info)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {prepareFatData(scanResult.nutrition_info).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value.toFixed(1)}g`, 'Amount']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb', 
                            color: '#1f2937'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
                    No fat composition data available
                  </div>
                )}
              </div>
              
              {/* Sugar Breakdown */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">Sugar Breakdown</h3>
                {prepareSugarData(scanResult.nutrition_info).length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={prepareSugarData(scanResult.nutrition_info)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {prepareSugarData(scanResult.nutrition_info).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value.toFixed(1)}g`, 'Amount']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb', 
                            color: '#1f2937'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
                    No sugar data available
                  </div>
                )}
              </div>
              
              {/* Nutritional Information Summary */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">Key Nutrition Facts (per 100g)</h3>
                <div className="space-y-3">
                  {Object.entries(scanResult.nutrition_info).map(([name, info]) => (
                    <div key={name} className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">{name}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {info.per_100g !== null ? `${info.per_100g} ${info.unit}` : 'N/A'}
                        {info.rda_percentage ? ` (${info.rda_percentage}% RDA)` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* UPDATED CHART: Nutritional Weight Distribution */}
            <div className="mt-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
                  Nutritional Weight Distribution (per 100g)
                </h3>
                {renderNutritionalWeightChart()}
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <p>* This chart shows the proportional weight of measurable nutrients in the product per 100g.</p>
                  <p>* Milligram values have been converted to grams for consistent scaling.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <p>* RDA: Recommended Daily Allowance based on a 2,000 calorie diet.</p>
              <p>* Values are calculated per 100g of the product unless otherwise stated.</p>
            </div>
          </div>
        </motion.div>
      )}

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

