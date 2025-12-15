import { ShoppingCartOutlined } from "@ant-design/icons";
import { get, onValue, ref } from "firebase/database";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { rtdb } from "../../lib/firebase";

const CartIcon = ({ userId }) => {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartId, setCartId] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedCartId = window.localStorage.getItem("cartId");

    if (storedCartId) {
      setCartId(storedCartId);
      return;
    }

    if (userId) {
      const fetchUserCart = async () => {
        const ordersRef = ref(rtdb, "orders");
        const snapshot = await get(ordersRef);

        if (!snapshot.exists()) {
          return;
        }

        let foundCartId = null;

        snapshot.forEach((childSnapshot) => {
          const orderData = childSnapshot.val();
          if (
            orderData.user_id === userId &&
            orderData.status === "pending" &&
            !foundCartId
          ) {
            foundCartId = orderData.id || childSnapshot.key;
          }
        });

        if (foundCartId) {
          window.localStorage.setItem("cartId", foundCartId);
          setCartId(foundCartId);
        }
      };

      fetchUserCart();
    }
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleCartUpdate = (event) => {
      const nextCartId =
        event?.detail?.cartId ?? window.localStorage.getItem("cartId");
      setCartId(nextCartId || null);
    };

    window.addEventListener("cart:update", handleCartUpdate);

    return () => {
      window.removeEventListener("cart:update", handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    if (!cartId) {
      setCartItemCount(0);
      return;
    }

    const orderRef = ref(rtdb, `orders/${cartId}`);
    const unsubscribe = onValue(orderRef, (snapshot) => {
      if (!snapshot.exists()) {
        setCartItemCount(0);
        setCartId(null);
        return;
      }

      const order = snapshot.val();

      if (!order || order.status !== "pending") {
        setCartItemCount(0);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("cartId");
        }
        setCartId(null);
        return;
      }

      const items = order.items || {};
      const itemCount = Object.values(items).reduce((total, item) => {
        // Exclude packaging items from count
        if (item.isPackaging) {
          return total;
        }
        const quantity = Number(item.quantity);
        if (!Number.isFinite(quantity)) {
          return total;
        }
        return total + quantity;
      }, 0);

      setCartItemCount(itemCount);
    });

    return () => unsubscribe();
  }, [cartId]);

  return (
    <>
      {pathname !== "/order" && (
        <Link href="/order" className="cart-fab">
          <ShoppingCartOutlined style={{ fontSize: "24px" }} />
          {cartItemCount > 0 && (
            <span className="cart-count">{cartItemCount}</span>
          )}
        </Link>
      )}
    </>
  );
};

export default CartIcon;
