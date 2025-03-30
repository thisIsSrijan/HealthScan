import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
// import { User, Heart, Activity, Weight, Edit, Save, X } from "lucide-react";
import axios from "axios";
import ProfileCard from "../components/ProfileCard";
import MedicalInfoCard from "../components/MedicalnfoCard";
import HealthMetricsCard from "../components/HealthMetricsCard";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Constants
const BACKEND_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8080";
const AUTH_HEADERS = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
  withCredentials: true,
};

// API Service Module
const apiService = {
  getUserProfile: async () => {
    return axios.get(`${BACKEND_URL}/api/user/me`, AUTH_HEADERS);
  },
  updateBasicInfo: async (data) => {
    return axios.patch(`${BACKEND_URL}/api/user/update-basic`, data, AUTH_HEADERS);
  },
  addAllergy: async (allergy) => {
    return axios.patch(`${BACKEND_URL}/api/user/allergies/add`, { value: allergy }, AUTH_HEADERS);
  },
  removeAllergy: async (allergy) => {
    return axios.patch(`${BACKEND_URL}/api/user/allergies/remove`, { value: allergy }, AUTH_HEADERS);
  },
  addCondition: async (condition) => {
    return axios.patch(`${BACKEND_URL}/api/user/conditions/add`, { value: condition }, AUTH_HEADERS);
  },
  removeCondition: async (condition) => {
    return axios.patch(`${BACKEND_URL}/api/user/conditions/remove`, { value: condition }, AUTH_HEADERS);
  },
  addMedication: async (medication) => {
    return axios.patch(`${BACKEND_URL}/api/user/medications/add`, { value: medication }, AUTH_HEADERS);
  },
  removeMedication: async (medication) => {
    return axios.patch(`${BACKEND_URL}/api/user/medications/remove`, { value: medication }, AUTH_HEADERS);
  },
};

// Helper Functions
const calculateBmi = (weight, height) => {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return Number.parseFloat(bmi.toFixed(1));
};

const getBmiCategory = (bmi) => {
  if (bmi < 18.5) return { category: "Underweight", color: "text-blue-500 dark:text-blue-400" };
  if (bmi < 25) return { category: "Healthy", color: "text-green-500 dark:text-green-400" };
  if (bmi < 30) return { category: "Overweight", color: "text-yellow-500 dark:text-yellow-400" };
  return { category: "Obese", color: "text-red-500 dark:text-red-400" };
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Main Dashboard Component
const Dashboard = () => {
  const [userData, setUserData] = useState({
    name: "",
    age: 0,
    gender: "",
    height: [],
    weight: [],
    bmi: 0,
    allergies: [],
    medicalConditions: [],
    medications: [],
  });
  const [loading, setLoading] = useState({
    profile: true,
    metrics: true,
    medical: true,
  });
  const [editMode, setEditMode] = useState({
    profile: false,
    allergies: false,
    medicalConditions: false,
    medications: false,
  });
  const [editData, setEditData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    newAllergy: "",
    newCondition: "",
    newMedication: "",
  });

  const weightChartRef = useRef(null);
  const bmiChartRef = useRef(null);

  const fetchUserProfile = async () => {
    try {
      const response = await apiService.getUserProfile();
      setUserData({
        ...response.data,
        bmi: calculateBmi(
          response.data.weight[response.data.weight.length - 1],
          response.data.height[response.data.height.length - 1]
        ),
      });
      setEditData({
        ...editData,
        name: response.data.name,
        age: response.data.age,
        gender: response.data.gender,
        height: response.data.height[response.data.height.length - 1],
        weight: response.data.weight[response.data.weight.length - 1],
      });
      setLoading((prev) => ({ ...prev, profile: false }));
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userData.weight.length > 0 && userData.height.length > 0) {
      const bmi = calculateBmi(
        userData.weight[userData.weight.length - 1],
        userData.height[userData.height.length - 1]
      );
      setUserData((prev) => ({ ...prev, bmi }));
    }
  }, [userData.weight, userData.height]);

  const toggleEditMode = (section) => {
    if (section === "profile" && !editMode.profile) {
      setEditData({
        ...editData,
        name: userData.name,
        age: userData.age,
        gender: userData.gender,
        height: userData.height[userData.height.length - 1],
        weight: userData.weight[userData.weight.length - 1],
      });
    }
    setEditMode((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfileChanges = async () => {
    const newAge = Number.parseInt(editData.age);
    const newHeight = Number.parseFloat(editData.height);
    const newWeight = Number.parseFloat(editData.weight);

    if (isNaN(newAge) || isNaN(newHeight) || isNaN(newWeight)) {
      toast.warn("Please enter valid numbers for age, height, and weight");
      return;
    }

    if (newHeight <= 0 || newWeight <= 0) {
      toast.warn("Height and weight must be positive numbers");
      return;
    }
    if (newAge < 0 || newAge > 120) {
      toast.warn("Please enter a valid age");
      return;
    }

    try {
      await apiService.updateBasicInfo({
        name: editData.name,
        age: newAge,
        gender: editData.gender,
        height: newHeight,
        weight: newWeight,
      });
      fetchUserProfile();
      toggleEditMode("profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const addAllergy = async () => {
    if (!editData.newAllergy.trim()) return;
    try {
      await apiService.addAllergy(editData.newAllergy.trim());
      setUserData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, editData.newAllergy.trim()],
      }));
      setEditData((prev) => ({ ...prev, newAllergy: "" }));
    } catch (error) {
      if (error.response?.status === 409) {
        toast.warn("Allergy already exists");
        return;
      }
      console.error("Error adding allergy:", error);
      toast.error("Failed to add allergy. Please try again.");
    }
  };

  const removeAllergy = async (index) => {
    const allergyToRemove = userData.allergies[index];
    try {
      await apiService.removeAllergy(allergyToRemove);
      setUserData((prev) => ({
        ...prev,
        allergies: prev.allergies.filter((_, i) => i !== index),
      }));
    } catch (error) {
      console.error("Error removing allergy:", error);
      toast.error("Failed to remove allergy. Please try again.");
    }
  };

  const addCondition = async () => {
    if (!editData.newCondition.trim()) return;
    try {
      await apiService.addCondition(editData.newCondition.trim());
      setUserData((prev) => ({
        ...prev,
        medicalConditions: [...prev.medicalConditions, editData.newCondition.trim()],
      }));
      setEditData((prev) => ({ ...prev, newCondition: "" }));
    } catch (error) {
      if (error.response?.status === 409) {
        toast.warn("Medical condition already exists");
        return;
      }
      console.error("Error adding condition:", error);
      toast.error("Failed to add condition. Please try again.");
    }
  };

  const removeCondition = async (index) => {
    const conditionToRemove = userData.medicalConditions[index];
    try {
      await apiService.removeCondition(conditionToRemove);
      setUserData((prev) => ({
        ...prev,
        medicalConditions: prev.medicalConditions.filter((_, i) => i !== index),
      }));
    } catch (error) {
      console.error("Error removing condition:", error);
      toast.warn("Failed to remove condition. Please try again.");
    }
  };

  const addMedication = async () => {
    if (!editData.newMedication.trim()) return;
    try {
      await apiService.addMedication(editData.newMedication.trim());
      setUserData((prev) => ({
        ...prev,
        medications: [...prev.medications, editData.newMedication.trim()],
      }));
      setEditData((prev) => ({ ...prev, newMedication: "" }));
    } catch (error) {
      if (error.response?.status === 409) {
        toast.warn("Medication already exists");
        return;
      }
      console.error("Error adding medication:", error);
      toast.error("Failed to add medication. Please try again.");
    }
  };

  const removeMedication = async (index) => {
    const medicationToRemove = userData.medications[index];
    try {
      await apiService.removeMedication(medicationToRemove);
      setUserData((prev) => ({
        ...prev,
        medications: prev.medications.filter((_, i) => i !== index),
      }));
    } catch (error) {
      console.error("Error removing medication:", error);
      toast.error("Failed to remove medication. Please try again.");
    }
  };

  const bmiStatus = getBmiCategory(userData.bmi);

  // if (loading.profile || loading.medical || !userData.name) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="health-container py-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
        theme="light"
      />
      <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeInUp}>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Your Health Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your health metrics and manage your medical information
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
          },
        }}
      >
        <ProfileCard
          userData={userData}
          editMode={editMode}
          editData={editData}
          toggleEditMode={toggleEditMode}
          handleEditChange={handleEditChange}
          saveProfileChanges={saveProfileChanges}
          bmiStatus={bmiStatus}
        />

        <MedicalInfoCard
          userData={userData}
          editMode={editMode}
          editData={editData}
          toggleEditMode={toggleEditMode}
          setEditData={setEditData}
          addAllergy={addAllergy}
          removeAllergy={removeAllergy}
          addCondition={addCondition}
          removeCondition={removeCondition}
          addMedication={addMedication}
          removeMedication={removeMedication}
        />

        {/* <HealthMetricsCard /> */}
      </motion.div>
        <HealthMetricsCard weights={userData.weight} heights={userData.height} />
    </div>
  );
};

export default Dashboard;