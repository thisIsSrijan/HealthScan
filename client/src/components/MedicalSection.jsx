import React from 'react';
import { Edit, X } from 'lucide-react';
import EditMedicalSection from './EditMedicalSection';

const MedicalSection = ({ 
    title, 
    items, 
    editMode, 
    toggleEdit, 
    newItem, 
    setNewItem, 
    addItem, 
    removeItem, 
    pillColor 
  }) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-medium text-gray-800 dark:text-gray-100">{title}</h3>
        <button
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          onClick={toggleEdit}
        >
          {editMode ? (
            <X size={16} className="text-gray-500 dark:text-gray-400" />
          ) : (
            <Edit size={16} className="text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>
      <div className="p-4">
        {!editMode ? (
          <div className="flex flex-wrap gap-2">
            {items.length > 0 ? (
              items.map((item, index) => (
                <span key={index} className={`pill-button ${pillColor}`}>
                  {item}
                </span>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No {title.toLowerCase()} recorded</p>
            )}
          </div>
        ) : (
          <EditMedicalSection
            items={items}
            newItem={newItem}
            setNewItem={setNewItem}
            addItem={addItem}
            removeItem={removeItem}
            pillColor={pillColor}
            placeholder={`Add new ${title.toLowerCase().slice(0, -1)}`}
          />
        )}
      </div>
    </div>
  );

export default MedicalSection;