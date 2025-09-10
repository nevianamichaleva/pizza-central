import { ShoppingCartOutlined } from "@ant-design/icons";
import { onValue, ref } from "firebase/database";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import { rtdb } from "../../lib/firebase";

const CartIcon = ({ userId }) => {
  const [cartItemCount, setCartItemCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (!userId) return;

    const ordersRef = ref(rtdb, `orders`);
    
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const orders = snapshot.val();
        
        const userOrders = Object.values(orders)
          .filter(order => order.user_id === userId && order.status === "pending");

        if (userOrders.length > 0) {
          const latestOrder = userOrders[userOrders.length - 1]; 
          
          if (latestOrder.items) {
            const itemCount = Object.keys(latestOrder.items).length; 
            setCartItemCount(itemCount);
          } else {
            setCartItemCount(0);
          }
        } else {
          setCartItemCount(0);
        }
      }
    });

    return () => unsubscribe(); 
  }, [userId]);

  return (
    <>
      {pathname !== '/order' &&
        <Link href="/order" className="cart-fab">
          <ShoppingCartOutlined style={{ fontSize: '24px' }} />
          {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
        </Link>
      }
    </>
  );
};

export default CartIcon;
