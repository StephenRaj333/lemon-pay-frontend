import React, { useState, useEffect } from 'react';
import {Modal ,Datepicker} from "antd"; 

import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

interface TaskFormValues {
  id?: string;
  taskName: string;
  description: string;
  date: Dayjs | null;
}

interface TaskData {
  _id: string;
  taskName: string;
  description: string;
  dueDate: string;
}

interface PopupProps {
  open: boolean;
  onCancel: () => void;
  title: string;
  onSave?: (values: TaskFormValues) => void;
  onUpdate?: (values: TaskFormValues) => void;
  taskData?: TaskData | null; // For editing existing tasks
  isEditing?: boolean;
}

const Popup: React.FC<PopupProps> = ({ 
  open, 
  title, 
  onCancel, 
  onSave, 
  onUpdate, 
  taskData, 
  isEditing = false 
}) => { 
  const [taskName, setTaskName] = useState<string>(''); 
  const [description, setDescription] = useState<string>(''); 
  const [date, setDate] = useState<Dayjs | null>(null); 

  // Pre-fill form when editing
  useEffect(() => {
    if (isEditing && taskData) {
      setTaskName(taskData.taskName);
      setDescription(taskData.description || '');
      setDate(taskData.dueDate ? dayjs(taskData.dueDate) : null);
    } else {
      // Reset form for new task with today's date as default
      setTaskName('');
      setDescription('');
      setDate(dayjs()); // Set today's date as default
    }
  }, [isEditing, taskData, open]);

  const handleSave = () => {
    const values: TaskFormValues = {
      taskName,
      description,
      date
    };
    
    if (isEditing && taskData) {
      values.id = taskData._id;
      if (onUpdate) {
        onUpdate(values);
      }
    } else {
      if (onSave) {
        onSave(values);
      }
    }
    
    // Reset form
    setTaskName('');
    setDescription('');
    setDate(dayjs()); // Reset to today's date
    onCancel();
  };

  const handleCancel = () => {
    // Reset form
    setTaskName('');
    setDescription('');
    setDate(dayjs()); // Reset to today's date
    onCancel();
  };

  return (
    <>
      <Modal
        className="modal-container"
        title={<h2 className='text-[24px] leading-[35%] font-[700] text-center mb-[34px]'>{title}</h2>}  
        centered
        closeIcon={false}
        open={open}
        footer={false}
        onCancel={handleCancel}
        width={600}
      >
        <div className="form-container max-w-[375px] m-auto">  
          <div className="space-y-6">
            {/* Task Name Input */}
            <div className="mb-6 max-[768px]:text-center">
              <input
                type="text"
                placeholder="Enter Task Name"   
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full h-[60px] max-[768px]:max-w-[90%] max-[768px]:h-[46px] text-[16px] bg-gray-100 border-0 rounded-[8px] placeholder-gray-500 px-4 focus:outline-none" 
              />  
            </div>

            {/* Description Input */}
            <div className="mb-6 max-[768px]:text-center">
              <input 
                type="text" 
                placeholder="Description"   
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-[16px] max-[768px]:max-w-[90%] max-[768px]:h-[46px] bg-gray-100 border-0 rounded-[8px] placeholder-gray-500 px-4 py-4 focus:outline-none resize-none"
              />  
            </div>

            {/* Date Picker */}
            <div className="mb-8 max-[768px]:text-center">
              <DatePicker
                placeholder="Select Date"  
                value={date}
                onChange={(selectedDate) => setDate(selectedDate)}
                format="DD/MM/YYYY"  
                className="w-full h-[60px] text-[16px] bg-gray-100 border-0 rounded-[8px] max-[768px]:max-w-[90%] max-[768px]:h-[46px]" 
                style={{
                  backgroundColor: '#f3f4f6',   
                  border: 'none',
                  boxShadow: 'none'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-[40px] mt-8">
              <button
                onClick={handleSave}
                className="w-[90px] h-[47px] bg-[#1E3BA3] hover:bg-[#1E3BA3]/90 border-0 rounded-[25px] text-[14px] leading-[35%] font-semibold text-white cursor-pointer"
              >
                {isEditing ? 'Update' : 'Save'}
              </button>
              
              <button
                onClick={handleCancel}
                className="text-[18px] font-medium text-gray-700 hover:text-gray-900 border-0 bg-transparent text-[14px] leading-[35%] font-semibold text-dark cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Popup;