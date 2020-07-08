import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsList = await AsyncStorage.getItem('@GoMarketplace:Items');

      if (productsList) {
        setProducts([...JSON.parse(productsList)]);
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const findProduct = products.find(item => item.id === product.id);

      if (findProduct) {
        const getProducts = products.map(item =>
          item.id === product.id
            ? { ...product, quantity: item.quantity + 1 }
            : { ...item },
        );

        setProducts(getProducts);
      } else {
        const newProduct = { ...product, quantity: 1 };

        setProducts([...products, newProduct]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:Items',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const toProduct = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      );

      setProducts(toProduct);
      await AsyncStorage.setItem(
        '@GoMarketplace:Items',
        JSON.stringify(toProduct),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const findItems = products.filter(item => item.id === id);

      if (findItems[0].quantity > 0) {
        const toProduct = products.map(item =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        );
        setProducts(toProduct);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:Items',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
