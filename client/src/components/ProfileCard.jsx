import React from "react";
import { motion } from "framer-motion";
import { User, Edit, X } from "lucide-react";
// import { fadeInUp } from "../utils/motion";
import ProfileView from "./ProfileView";
import ProfileEdit from "./ProfileEdit";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

const ProfileCard = ({ userData, editMode, editData, toggleEditMode, handleEditChange, saveProfileChanges, bmiStatus }) => (
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
          <ProfileView userData={userData} bmiStatus={bmiStatus} />
        ) : (
          <ProfileEdit editData={editData} handleEditChange={handleEditChange} toggleEditMode={toggleEditMode} saveProfileChanges={saveProfileChanges} />
        )}
      </div>
    </motion.div>
  );

export default ProfileCard;