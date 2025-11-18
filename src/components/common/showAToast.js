'use client';

import { toast } from 'react-toastify';


const showAToast = (type, content) => {
  // Validate type (success, error, info, warning)
  const options = {
    position: "top-right", 
    autoClose: 5000, 
    hideProgressBar: false, 
    closeOnClick: true, 
    pauseOnHover: true, 
  };
  if (['success', 'error', 'info', 'warning'].includes(type)) {
    toast[type](content, options);  
  } else {
    toast.info('Invalid toast type');  
  }
};

export default showAToast;

