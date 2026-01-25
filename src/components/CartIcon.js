import { ShoppingCartOutlined } from "@ant-design/icons";
import { get, onValue, ref } from "firebase/database";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { rtdb } from "../../lib/firebase";

const CartIcon = ({ userId }) => {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartId, setCartId] = useState(null);
  const [position, setPosition] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cartRef = useRef(null);
  const positionRef = useRef({ x: null, y: null });
  const startPositionRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const pathname = usePathname();

  // Helper function to constrain position to viewport bounds
  // Using useCallback to avoid recreating on every render, but function reads window.innerWidth dynamically
  const constrainToViewport = useCallback((x, y) => {
    if (typeof window === "undefined") {
      return { x, y };
    }

    // Get cart icon size - 60px on mobile, 56px on desktop
    const isMobile = window.innerWidth <= 768;
    const cartSize = isMobile ? 60 : 56;
    
    const maxX = window.innerWidth - cartSize;
    const maxY = window.innerHeight - cartSize;

    const constrainedX = Math.max(0, Math.min(x, maxX));
    const constrainedY = Math.max(0, Math.min(y, maxY));

    return { x: constrainedX, y: constrainedY };
  }, []);

  // Load saved position from localStorage
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedPosition = window.localStorage.getItem("cartIconPosition");
    if (savedPosition) {
      try {
        const { x, y } = JSON.parse(savedPosition);
        // Constrain the loaded position to viewport
        const constrained = constrainToViewport(x, y);
        setPosition(constrained);
        positionRef.current = constrained;
        
        // Update localStorage with constrained position if it was changed
        if (constrained.x !== x || constrained.y !== y) {
          window.localStorage.setItem(
            "cartIconPosition",
            JSON.stringify(constrained)
          );
        }
      } catch (e) {
        console.error("Error parsing saved cart position:", e);
      }
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

  // Helper function to get client coordinates from mouse or touch event
  const getClientCoords = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  // Drag handlers
  const handleStart = (e) => {
    if (e.type === "mousedown" && e.button !== 0) return; // Only handle left mouse button
    
    if (cartRef.current) {
      // Prevent default on touch to avoid triggering click immediately
      if (e.type === "touchstart") {
        e.preventDefault();
      }
      
      const coords = getClientCoords(e);
      const rect = cartRef.current.getBoundingClientRect();
      let currentX, currentY;
      
      if (position.x !== null && position.y !== null) {
        currentX = position.x;
        currentY = position.y;
      } else {
        // Calculate default position
        currentX = window.innerWidth - rect.width - 20;
        currentY = window.innerHeight - rect.height - 20;
      }
      
      startPositionRef.current = { x: coords.x, y: coords.y };
      setDragOffset({
        x: coords.x - currentX,
        y: coords.y - currentY,
      });
      setIsDragging(true);
      hasDraggedRef.current = false;
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      if (!isDragging) return;

      // Prevent default to stop scrolling on touch devices
      if (e.type === "touchmove") {
        e.preventDefault();
      }

      const coords = getClientCoords(e);
      
      // Check if pointer has moved significantly (more than 5px)
      const moveDistance = Math.sqrt(
        Math.pow(coords.x - startPositionRef.current.x, 2) +
        Math.pow(coords.y - startPositionRef.current.y, 2)
      );

      if (moveDistance > 5) {
        hasDraggedRef.current = true;
      }

      const newX = coords.x - dragOffset.x;
      const newY = coords.y - dragOffset.y;

      // Constrain to viewport using helper function
      const newPosition = constrainToViewport(newX, newY);
      setPosition(newPosition);
      positionRef.current = newPosition;
    };

    const handleEnd = () => {
      const wasDragging = hasDraggedRef.current;
      setIsDragging(false);
      
      // Save position to localStorage if we actually dragged
      if (wasDragging && positionRef.current.x !== null && positionRef.current.y !== null) {
        window.localStorage.setItem(
          "cartIconPosition",
          JSON.stringify({ x: positionRef.current.x, y: positionRef.current.y })
        );
      }
      
      // Reset hasDragged after a short delay to allow click to work
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 100);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, dragOffset, constrainToViewport]);

  // Recalculate position on viewport resize to keep it within bounds
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      if (positionRef.current.x !== null && positionRef.current.y !== null) {
        const constrained = constrainToViewport(
          positionRef.current.x,
          positionRef.current.y
        );
        
        // Only update if position changed
        if (constrained.x !== positionRef.current.x || constrained.y !== positionRef.current.y) {
          setPosition(constrained);
          positionRef.current = constrained;
          
          // Update localStorage with new constrained position
          window.localStorage.setItem(
            "cartIconPosition",
            JSON.stringify(constrained)
          );
        }
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [constrainToViewport]);

  // Calculate position style
  const getPositionStyle = () => {
    const baseStyle = {
      cursor: isDragging ? "grabbing" : "grab",
      userSelect: "none",
      WebkitUserSelect: "none",
    };

    if (position.x !== null && position.y !== null) {
      // Ensure position is still within bounds (double-check)
      const constrained = constrainToViewport(position.x, position.y);
      
      return {
        ...baseStyle,
        position: "fixed",
        left: `${constrained.x}px`,
        top: `${constrained.y}px`,
        bottom: "auto",
        right: "auto",
      };
    }
    
    // Default position - bottom right
    return {
      ...baseStyle,
      position: "fixed",
      bottom: "20px",
      right: "20px",
    };
  };

  const handleClick = (e) => {
    // Prevent navigation if we just finished dragging
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <>
      {pathname !== "/order" && (
        <Link
          href="/order"
          className="cart-fab"
          ref={cartRef}
          style={getPositionStyle()}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          onClick={handleClick}
          draggable={false}
          aria-label={cartItemCount > 0 ? `Количка с ${cartItemCount} ${cartItemCount === 1 ? 'продукт' : 'продукта'}` : "Количка"}
        >
          <ShoppingCartOutlined style={{ fontSize: "24px", pointerEvents: "none" }} />
          {cartItemCount > 0 && (
            <span className="cart-count" aria-hidden="true">{cartItemCount}</span>
          )}
        </Link>
      )}
    </>
  );
};

export default CartIcon;
