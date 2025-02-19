'use client';

import { get, ref } from 'firebase/database';
import { createContext, useContext, useEffect, useState } from 'react';
import { rtdb } from '../../lib/firebase';

const ProductsContext = createContext();

export function useProducts() {
  return useContext(ProductsContext);
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); 

  const fetchProducts = async () => {
    try {
      const productsRef = ref(rtdb, 'products');
      const snapshot = await get(productsRef);

      if (snapshot.exists()) {
        const productsArray = Object.entries(snapshot.val()).map(([id, product]) => ({
          id, 
          ...product,
        }));
        setProducts(productsArray);
      } else {
        console.log('No products found.');
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts();
  }, []);  

  return (
    <ProductsContext.Provider value={{ products, error, loading }}>
      {children}
    </ProductsContext.Provider>
  );
}
