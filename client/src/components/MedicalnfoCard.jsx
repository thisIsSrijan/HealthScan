import React from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
// import { fadeInUp } from "../utils/motion";
import MedicalSection from "./MedicalSection";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

const MedicalInfoCard = ({ 
    userData, 
    editMode, 
    editData, 
    toggleEditMode, 
    setEditData, 
    addAllergy, 
    removeAllergy, 
    addCondition, 
    removeCondition, 
    addMedication, 
    removeMedication 
  }) => (
    <motion.div className="card col-span-1 md:col-span-2" variants={fadeInUp}>
      <div className="p-6">
        <h2 className="text-xl font-semibold flex items-center mb-4 text-gray-800 dark:text-gray-100">
          <Heart className="mr-2 text-emerald-500 dark:text-emerald-400" size={20} />
          Medical Information
        </h2>
  
        <div className="space-y-4 mt-2">
          <MedicalSection
            title="Allergies"
            items={userData.allergies}
            editMode={editMode.allergies}
            toggleEdit={() => toggleEditMode("allergies")}
            newItem={editData.newAllergy}
            setNewItem={(value) => setEditData(prev => ({ ...prev, newAllergy: value }))}
            addItem={addAllergy}
            removeItem={removeAllergy}
            pillColor="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
          />
          
          <MedicalSection
            title="Medical Conditions"
            items={userData.medicalConditions}
            editMode={editMode.medicalConditions}
            toggleEdit={() => toggleEditMode("medicalConditions")}
            newItem={editData.newCondition}
            setNewItem={(value) => setEditData(prev => ({ ...prev, newCondition: value }))}
            addItem={addCondition}
            removeItem={removeCondition}
            pillColor="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300"
          />
          
          <MedicalSection
            title="Medications"
            items={userData.medications}
            editMode={editMode.medications}
            toggleEdit={() => toggleEditMode("medications")}
            newItem={editData.newMedication}
            setNewItem={(value) => setEditData(prev => ({ ...prev, newMedication: value }))}
            addItem={addMedication}
            removeItem={removeMedication}
            pillColor="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
          />
        </div>
      </div>
    </motion.div>
  );

export default MedicalInfoCard;