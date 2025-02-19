'use client';

import { get, ref } from 'firebase/database';
import { createContext, useContext, useEffect, useState } from 'react';
import { rtdb } from '../../lib/firebase';

const CategoriesContext = createContext();

export function useCategories() {
  return useContext(CategoriesContext);
}

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); 

  const organizeChildren = (data) => {
    let result = {};

    for (let key in data) {
      result[key] = { id:key, ...data[key], children: [] };
    }

    for (let key in result) {
      const item = result[key];

      if (item.parent && result[item.parent]) {
        result[item.parent].children.push(result[key]);
      }
    }

    for (let key in result) {
      if (result[key].parent && result[key].parent !== '') {
        delete result[key];
      }
      if (result[key]?.children?.length == 0) {
        delete result[key].children;
      }
    }

    let datas = [];
    for (const id in result) {
      const item = result[id];
      const transformedItem = {
        ...item
      };
      
      datas.push(transformedItem);
    }

    return datas;
  }

  const fetchCategories = async () => {
    try {
      const catRef = ref(rtdb, 'category');
      const snapshot = await get(catRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const categoryArray = organizeChildren(data);
        setCategories(categoryArray);
      } else {
        console.log("No categories found.");
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories: ' + err.message); 
    } finally {
      setLoading(false);  
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);  

  return (
    <CategoriesContext.Provider value={{ categories, error, loading }}>
      {children}
    </CategoriesContext.Provider>
  );
}
