import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { User, Heart, Activity, Weight, Edit, Save, X } from "lucide-react"

//dummy data
const initialUserData = {
  name: "Alex Johnson",
  age: 32,
  gender: "Male",
  height: 175, //cm
  weight: 78, //kg
  bmi: 25.5,
  allergies: ["Peanuts", "Shellfish"],
  conditions: ["Mild Asthma"],
  medications: ["Albuterol (as needed)"],
}

//dummy histories (will come from an endpoint later on)
const weightHistory = [
  { date: "2023-09-01", value: 81 },
  { date: "2023-10-01", value: 80 },
  { date: "2023-11-01", value: 79 },
  { date: "2023-12-01", value: 79 },
  { date: "2024-01-01", value: 78 },
  { date: "2024-02-01", value: 78 },
]

const bmiHistory = [
  { date: "2023-09-01", value: 26.5 },
  { date: "2023-10-01", value: 26.1 },
  { date: "2023-11-01", value: 25.8 },
  { date: "2023-12-01", value: 25.8 },
  { date: "2024-01-01", value: 25.5 },
  { date: "2024-02-01", value: 25.5 },
]

const Dashboard = () => {
  const [userData, setUserData] = useState(initialUserData)
  const [editMode, setEditMode] = useState({
    profile: false,
    allergies: false,
    conditions: false,
    medications: false,
  })
  const [editData, setEditData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    newAllergy: "",
    newCondition: "",
    newMedication: "",
  })

  const weightChartRef = useRef(null)
  const bmiChartRef = useRef(null)

  useEffect(() => {
    // Calculate BMI whenever weight or height changes
    if (userData.weight && userData.height) {
      const heightInMeters = userData.height / 100
      const bmi = userData.weight / (heightInMeters * heightInMeters)
      setUserData((prev) => ({
        ...prev,
        bmi: Number.parseFloat(bmi.toFixed(1)),
      }))
    }
  }, [userData.weight, userData.height])

  useEffect(() => {
    renderWeightChart()
    renderBmiChart()
  }, [])

  const renderWeightChart = () => {
    if (!weightChartRef.current) return

    const container = weightChartRef.current
    container.innerHTML = ""

    const maxValue = Math.max(...weightHistory.map((item) => item.value)) * 1.1

    weightHistory.forEach((data, index) => {
      const barHeight = (data.value / maxValue) * 100
      const bar = document.createElement("div")
      bar.className = "chart-bar chart-bar-weight"
      bar.style.height = `${barHeight}%`

      const tooltip = document.createElement("div")
      tooltip.className =
        "opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 transition-opacity"
      tooltip.textContent = `${data.value} kg`

      const tooltipArrow = document.createElement("div")
      tooltipArrow.className =
        "absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"

      tooltip.appendChild(tooltipArrow)

      const barContainer = document.createElement("div")
      barContainer.className = "relative w-8 group"
      barContainer.appendChild(bar)
      barContainer.appendChild(tooltip)

      const label = document.createElement("div")
      label.className = "text-xs text-gray-500 dark:text-gray-400 mt-1 text-center"
      label.textContent = new Date(data.date).toLocaleDateString("en-US", { month: "short" })

      const column = document.createElement("div")
      column.className = "flex flex-col items-center"
      column.appendChild(barContainer)
      column.appendChild(label)

      container.appendChild(column)
    })
  }

  const renderBmiChart = () => {
    if (!bmiChartRef.current) return

    const container = bmiChartRef.current
    container.innerHTML = ""

    const rangesContainer = document.createElement("div")
    rangesContainer.className = "absolute inset-0 flex flex-col"

    const obeseRange = document.createElement("div")
    obeseRange.className = "flex-1 bg-red-50 dark:bg-red-900/20 opacity-30"

    const overweightRange = document.createElement("div")
    overweightRange.className = "flex-1 bg-yellow-50 dark:bg-yellow-900/20 opacity-30"

    const normalRange = document.createElement("div")
    normalRange.className = "flex-1 bg-green-50 dark:bg-green-900/20 opacity-30"

    const underweightRange = document.createElement("div")
    underweightRange.className = "flex-1 bg-blue-50 dark:bg-blue-900/20 opacity-30"

    rangesContainer.appendChild(obeseRange)
    rangesContainer.appendChild(overweightRange)
    rangesContainer.appendChild(normalRange)
    rangesContainer.appendChild(underweightRange)

    container.appendChild(rangesContainer)

    const labelsContainer = document.createElement("div")
    labelsContainer.className = "absolute inset-0 flex flex-col justify-between pointer-events-none"

    const obeseLabel = document.createElement("div")
    obeseLabel.className = "border-b border-red-200 dark:border-red-700 flex justify-end"
    obeseLabel.innerHTML = '<span class="text-xs text-red-500 dark:text-red-400 pr-1">30 - Obese</span>'

    const overweightLabel = document.createElement("div")
    overweightLabel.className = "border-b border-yellow-200 dark:border-yellow-700 flex justify-end"
    overweightLabel.innerHTML = '<span class="text-xs text-yellow-500 dark:text-yellow-400 pr-1">25 - Overweight</span>'

    const normalLabel = document.createElement("div")
    normalLabel.className = "border-b border-green-200 dark:border-green-700 flex justify-end"
    normalLabel.innerHTML = '<span class="text-xs text-green-500 dark:text-green-400 pr-1">18.5 - Normal</span>'

    const underweightLabel = document.createElement("div")
    underweightLabel.className = "border-b border-blue-200 dark:border-blue-700 flex justify-end"
    underweightLabel.innerHTML = '<span class="text-xs text-blue-500 dark:text-blue-400 pr-1">Underweight</span>'

    labelsContainer.appendChild(obeseLabel)
    labelsContainer.appendChild(overweightLabel)
    labelsContainer.appendChild(normalLabel)
    labelsContainer.appendChild(underweightLabel)

    container.appendChild(labelsContainer)

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("class", "absolute inset-0 w-full h-full overflow-visible")

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
    const linearGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient")
    linearGradient.setAttribute("id", "bmiGradient")
    linearGradient.setAttribute("x1", "0%")
    linearGradient.setAttribute("y1", "0%")
    linearGradient.setAttribute("x2", "100%")
    linearGradient.setAttribute("y2", "0%")

    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop")
    stop1.setAttribute("offset", "0%")
    stop1.setAttribute("stop-color", "#10b981")

    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop")
    stop2.setAttribute("offset", "100%")
    stop2.setAttribute("stop-color", "#0ea5e9")

    linearGradient.appendChild(stop1)
    linearGradient.appendChild(stop2)
    defs.appendChild(linearGradient)
    svg.appendChild(defs)

    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline")
    let points = ""

    bmiHistory.forEach((data, index) => {
      const x = (index / (bmiHistory.length - 1)) * 100
      const y = (1 - (data.value - 15) / 20) * 100
      points += `${x},${y} `
    })

    polyline.setAttribute("points", points.trim())
    polyline.setAttribute("fill", "none")
    polyline.setAttribute("stroke", "url(#bmiGradient)")
    polyline.setAttribute("stroke-width", "2")
    polyline.setAttribute("stroke-linecap", "round")
    polyline.setAttribute("stroke-linejoin", "round")

    svg.appendChild(polyline)

    //Add data points
    bmiHistory.forEach((data, index) => {
      const x = (index / (bmiHistory.length - 1)) * 100 + "%"
      const y = (1 - (data.value - 15) / 20) * 100 + "%"

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      circle.setAttribute("cx", x)
      circle.setAttribute("cy", y)
      circle.setAttribute("r", "4")
      circle.setAttribute("fill", "white")
      circle.setAttribute("stroke", "#10b981")
      circle.setAttribute("stroke-width", "2")
      circle.setAttribute("class", "hover:r-6 transition-all duration-200")

      svg.appendChild(circle)
    })

    container.appendChild(svg)

    //x-axis labels
    const xAxisContainer = document.createElement("div")
    xAxisContainer.className =
      "absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-1"

    bmiHistory.forEach((data) => {
      const label = document.createElement("div")
      label.textContent = new Date(data.date).toLocaleDateString("en-US", { month: "short" })
      xAxisContainer.appendChild(label)
    })

    container.appendChild(xAxisContainer)
  }

  const toggleEditMode = (section) => {
    if (section === "profile" && !editMode.profile) {
      setEditData({
        ...editData,
        name: userData.name,
        age: userData.age,
        gender: userData.gender,
        height: userData.height,
        weight: userData.weight,
      })
    }

    setEditMode((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const saveProfileChanges = () => {
    // Validate data
    const newAge = Number.parseInt(editData.age)
    const newHeight = Number.parseFloat(editData.height)
    const newWeight = Number.parseFloat(editData.weight)

    if (isNaN(newAge) || isNaN(newHeight) || isNaN(newWeight)) {
      alert("Please enter valid numbers for age, height, and weight")
      return
    }

    setUserData((prev) => ({
      ...prev,
      name: editData.name,
      age: newAge,
      gender: editData.gender,
      height: newHeight,
      weight: newWeight,
    }))

    toggleEditMode("profile")
  }

  const addAllergy = () => {
    if (editData.newAllergy.trim() === "") return

    setUserData((prev) => ({
      ...prev,
      allergies: [...prev.allergies, editData.newAllergy.trim()],
    }))

    setEditData((prev) => ({
      ...prev,
      newAllergy: "",
    }))
  }

  const removeAllergy = (index) => {
    setUserData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }))
  }

  const addCondition = () => {
    if (editData.newCondition.trim() === "") return

    setUserData((prev) => ({
      ...prev,
      conditions: [...prev.conditions, editData.newCondition.trim()],
    }))

    setEditData((prev) => ({
      ...prev,
      newCondition: "",
    }))
  }

  const removeCondition = (index) => {
    setUserData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }))
  }

  const addMedication = () => {
    if (editData.newMedication.trim() === "") return

    setUserData((prev) => ({
      ...prev,
      medications: [...prev.medications, editData.newMedication.trim()],
    }))

    setEditData((prev) => ({
      ...prev,
      newMedication: "",
    }))
  }

  const removeMedication = (index) => {
    setUserData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }))
  }

  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-500 dark:text-blue-400" }
    if (bmi < 25) return { category: "Healthy", color: "text-green-500 dark:text-green-400" }
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-500 dark:text-yellow-400" }
    return { category: "Obese", color: "text-red-500 dark:text-red-400" }
  }

  const bmiStatus = getBmiCategory(userData.bmi)

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="health-container py-8">
      <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeInUp}>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Your Health Dashboard</h1>
        {/* <div>
              <h1 className="text-3xl font-bold text-green-700 dark:text-green-400">{userData.name}'s Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400">Last updated: Today at 9:45 AM</p>
            </div> */}
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your health metrics and manage your medical information
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <motion.div className="card col-span-1" variants={fadeInUp}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center text-gray-800 dark:text-gray-100">
                <User className="mr-2 text-emerald-500 dark:text-emerald-400" size={20} />
                Profile
              </h2>
              <button
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => toggleEditMode("profile")}
              >
                {editMode.profile ? (
                  <X size={18} className="text-gray-500 dark:text-gray-400" />
                ) : (
                  <Edit size={18} className="text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>

            {!editMode.profile ? (
              <div className="flex flex-col space-y-4">
                <div className="flex justify-center mb-2">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 dark:from-emerald-600 dark:to-teal-700 flex items-center justify-center text-white text-2xl font-bold">
                    {userData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-100">{userData.name}</h3>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{userData.age}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{userData.gender}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Height</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{userData.height} cm</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Weight</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{userData.weight} kg</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">BMI</span>
                    <span className={`text-sm font-medium ${bmiStatus.color}`}>{bmiStatus.category}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-red-500 dark:from-green-500 dark:to-red-600"
                      style={{ width: `${(userData.bmi / 40) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 text-center font-semibold text-gray-800 dark:text-gray-100">
                    {userData.bmi.toFixed(1)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="age" className="form-label">
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={editData.age}
                    onChange={handleEditChange}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gender" className="form-label">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={editData.gender}
                    onChange={handleEditChange}
                    className="input-field"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="height" className="form-label">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    value={editData.height}
                    onChange={handleEditChange}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="weight" className="form-label">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={editData.weight}
                    onChange={handleEditChange}
                    className="input-field"
                  />
                </div>

                <div className="flex justify-end">
                  <button onClick={() => toggleEditMode("profile")} className="btn-outline mr-2">
                    Cancel
                  </button>
                  <button onClick={saveProfileChanges} className="btn-primary flex items-center">
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Medical Information */}
        <motion.div className="card col-span-1 md:col-span-2" variants={fadeInUp}>
          <div className="p-6">
            <h2 className="text-xl font-semibold flex items-center mb-4 text-gray-800 dark:text-gray-100">
              <Heart className="mr-2 text-emerald-500 dark:text-emerald-400" size={20} />
              Medical Information
            </h2>

            <div className="space-y-4 mt-2">
              {/* Allergies */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">Allergies</h3>
                  <button
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => toggleEditMode("allergies")}
                  >
                    {editMode.allergies ? (
                      <X size={16} className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <Edit size={16} className="text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="p-4">
                  {!editMode.allergies ? (
                    <div className="flex flex-wrap gap-2">
                      {userData.allergies.length > 0 ? (
                        userData.allergies.map((allergy, index) => (
                          <span
                            key={index}
                            className="pill-button bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                          >
                            {allergy}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No allergies recorded</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {userData.allergies.map((allergy, index) => (
                          <div
                            key={index}
                            className="pill-button bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 flex items-center"
                          >
                            {allergy}
                            <button
                              className="ml-1 p-0.5 rounded-full hover:bg-red-200 dark:hover:bg-red-800"
                              onClick={() => removeAllergy(index)}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex">
                        <input
                          type="text"
                          placeholder="Add new allergy"
                          value={editData.newAllergy}
                          onChange={(e) => setEditData({ ...editData, newAllergy: e.target.value })}
                          className="input-field mr-2"
                        />
                        <button className="btn-primary" onClick={addAllergy}>
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Medical Conditions */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">Medical Conditions</h3>
                  <button
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => toggleEditMode("conditions")}
                  >
                    {editMode.conditions ? (
                      <X size={16} className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <Edit size={16} className="text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="p-4">
                  {!editMode.conditions ? (
                    <div className="flex flex-wrap gap-2">
                      {userData.conditions.length > 0 ? (
                        userData.conditions.map((condition, index) => (
                          <span
                            key={index}
                            className="pill-button bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300"
                          >
                            {condition}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No medical conditions recorded</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {userData.conditions.map((condition, index) => (
                          <div
                            key={index}
                            className="pill-button bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 flex items-center"
                          >
                            {condition}
                            <button
                              className="ml-1 p-0.5 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800"
                              onClick={() => removeCondition(index)}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex">
                        <input
                          type="text"
                          placeholder="Add new condition"
                          value={editData.newCondition}
                          onChange={(e) => setEditData({ ...editData, newCondition: e.target.value })}
                          className="input-field mr-2"
                        />
                        <button className="btn-primary" onClick={addCondition}>
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Medications */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">Medications</h3>
                  <button
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => toggleEditMode("medications")}
                  >
                    {editMode.medications ? (
                      <X size={16} className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <Edit size={16} className="text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="p-4">
                  {!editMode.medications ? (
                    <div className="flex flex-wrap gap-2">
                      {userData.medications.length > 0 ? (
                        userData.medications.map((medication, index) => (
                          <span
                            key={index}
                            className="pill-button bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                          >
                            {medication}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No medications recorded</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {userData.medications.map((medication, index) => (
                          <div
                            key={index}
                            className="pill-button bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 flex items-center"
                          >
                            {medication}
                            <button
                              className="ml-1 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                              onClick={() => removeMedication(index)}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex">
                        <input
                          type="text"
                          placeholder="Add new medication"
                          value={editData.newMedication}
                          onChange={(e) => setEditData({ ...editData, newMedication: e.target.value })}
                          className="input-field mr-2"
                        />
                        <button className="btn-primary" onClick={addMedication}>
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Health Metrics */}
        <motion.div className="card col-span-1 md:col-span-3" variants={fadeInUp}>
          <div className="p-6">
            <h2 className="text-xl font-semibold flex items-center mb-6 text-gray-800 dark:text-gray-100">
              <Activity className="mr-2 text-emerald-500 dark:text-emerald-400" size={20} />
              Health Metrics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weight Chart */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center">
                    <Weight size={18} className="text-emerald-500 dark:text-emerald-400 mr-2" />
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">Weight History</h3>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Last 6 months</span>
                </div>
                <div className="p-4 h-64 relative">
                  <div ref={weightChartRef} className="chart-container flex items-end justify-between"></div>
                </div>
              </div>

              {/* BMI Chart */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity size={18} className="text-teal-500 dark:text-teal-400 mr-2" />
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">BMI Trend</h3>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Last 6 months</span>
                </div>
                <div className="p-4 h-64 relative">
                  <div ref={bmiChartRef} className="chart-container relative"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Dashboard

