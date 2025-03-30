import React from "react";
import BmiIndicator from "./BmiIndicator";
import InfoBox  from "./InfoBox";

const ProfileView = ({ userData, bmiStatus }) => (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-center mb-2">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 dark:from-emerald-600 dark:to-teal-700 flex items-center justify-center text-white text-2xl font-bold">
          {userData.name.split(" ").map((n) => n[0]).join("")}
        </div>
      </div>
  
      <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-100">
        {userData.name}
      </h3>
  
      <div className="grid grid-cols-2 gap-4 mt-4">
        <InfoBox label="Age" value={userData.age} />
        <InfoBox label="Gender" value={userData.gender} />
        <InfoBox label="Height" value={`${userData.height[userData.height.length-1]} cm`} />
        <InfoBox label="Weight" value={`${userData.weight[userData.weight.length-1]} kg`} />
      </div>
  
      <BmiIndicator bmi={userData.bmi} bmiStatus={bmiStatus} />
    </div>
  );

export default ProfileView;