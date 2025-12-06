import { get, ref, set } from 'firebase/database';
import { rtdb } from '../../lib/firebase';

export const getNextOrderNumber = async () => {
  try {
    // First check if we have a counter in settings
    const counterRef = ref(rtdb, 'settings/orderCounter');
    const counterSnapshot = await get(counterRef);
    
    if (counterSnapshot.exists()) {
      const currentCounter = counterSnapshot.val();
      const nextNumber = currentCounter + 1;
      await set(counterRef, nextNumber);
      return nextNumber;
    }
    
    // If no counter exists, find the highest existing order number
    const ordersRef = ref(rtdb, "orders");
    const snapshot = await get(ordersRef);
    
    let highestNumber = 0;
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const ordersArray = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...value,
      }));
      
      const existingNumbers = ordersArray
        .filter(order => order.order_number)
        .map(order => parseInt(order.order_number))
        .filter(num => !isNaN(num));
      
      highestNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    }
    
    const nextNumber = highestNumber + 1;
    await set(counterRef, nextNumber);
    return nextNumber;
    
  } catch (error) {
    console.error("Грешка при получаване на следващ номер:", error);
    // Fallback to timestamp-based number
    return Date.now() % 10000; // Last 4 digits of timestamp
  }
};

export const generateOrderNumber = (order) => {
  if (!order) return 'N/A';
  
  // If order already has an order_number, use it
  if (order.order_number) {
    return `ORD-${String(order.order_number).padStart(4, '0')}`;
  }
  
  return 'N/A';
};






