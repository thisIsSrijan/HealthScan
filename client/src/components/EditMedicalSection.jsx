import React from 'react';
import { X } from 'lucide-react';


const EditMedicalSection = ({ items, newItem, setNewItem, addItem, removeItem, pillColor, placeholder }) => (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <div key={index} className={`pill-button ${pillColor} flex items-center`}>
            {item}
            <button
              className="ml-1 p-0.5 rounded-full hover:bg-opacity-70"
              onClick={() => removeItem(index)}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          placeholder={placeholder}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="input-field mr-2"
        />
        <button className="btn-primary" onClick={addItem}>
          Add
        </button>
      </div>
    </div>
  );

export default EditMedicalSection;