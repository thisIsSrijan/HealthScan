import React from "react";
import FormGroup from "./FormGroup";
import { Save } from "lucide-react";


const ProfileEdit = ({ editData, handleEditChange, toggleEditMode, saveProfileChanges }) => (
  <div className="space-y-4">
    <FormGroup label="Full Name" id="name" name="name" value={editData.name} onChange={handleEditChange} />
    <FormGroup label="Age" id="age" name="age" type="number" value={editData.age} onChange={handleEditChange} />
    
    <div className="form-group">
      <label htmlFor="gender" className="form-label">Gender</label>
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

    <FormGroup label="Height (cm)" id="height" name="height" type="number" value={editData.height} onChange={handleEditChange} />
    <FormGroup label="Weight (kg)" id="weight" name="weight" type="number" value={editData.weight} onChange={handleEditChange} />

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
);

export default ProfileEdit;