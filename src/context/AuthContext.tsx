import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../services/db';
import { Restaurant, User } from '../types';

interface AuthContextType {
  user: User | null;
  activeRestaurant: Restaurant | null;
  allRestaurants: Restaurant[];
  isAuthenticated: boolean;
  isDemoMode: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (params: {
    restaurantName: string;
    slug: string;
    email: string;
    fullName: string;
    phone?: string;
  }) => Promise<Restaurant>;
  logout: () => void;
  switchRestaurant: (restaurantId: string) => void;
  refreshState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => db.getCurrentUser());
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(null);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);

  const loadCurrentData = () => {
    const restaurants = db.getRestaurants();
    setAllRestaurants(restaurants);

    const currentUser = db.getCurrentUser();
    setUser(currentUser);

    const activeId = db.getActiveRestaurantId();
    const matched = restaurants.find(r => r.id === activeId) || restaurants[0] || null;
    setActiveRestaurant(matched);
  };

  useEffect(() => {
    loadCurrentData();
    const unsubscribe = db.subscribe(() => {
      loadCurrentData();
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, _password?: string): Promise<boolean> => {
    // Check if user matches known demo or existing
    const restaurants = db.getRestaurants();
    let restaurantToActivate = restaurants[0];

    if (email.includes('atlas') || email.includes('casablanca')) {
      const atlas = restaurants.find(r => r.slug === 'cafe-atlas');
      if (atlas) restaurantToActivate = atlas;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      fullName: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Restaurant Manager',
      restaurantId: restaurantToActivate.id,
      role: 'owner'
    };

    db.setCurrentUser(newUser);
    db.setActiveRestaurantId(restaurantToActivate.id);
    loadCurrentData();
    return true;
  };

  const signup = async (params: {
    restaurantName: string;
    slug: string;
    email: string;
    fullName: string;
    phone?: string;
  }): Promise<Restaurant> => {
    const newRest = db.createRestaurant({
      name: params.restaurantName,
      slug: params.slug,
      phone: params.phone || '+212600000000',
      description: `Welcome to ${params.restaurantName}. Order fresh items directly from our digital menu.`
    });

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: params.email,
      fullName: params.fullName,
      restaurantId: newRest.id,
      role: 'owner'
    };

    db.setCurrentUser(newUser);
    db.setActiveRestaurantId(newRest.id);
    loadCurrentData();
    return newRest;
  };

  const logout = () => {
    db.setCurrentUser(null);
    setUser(null);
  };

  const switchRestaurant = (restaurantId: string) => {
    db.setActiveRestaurantId(restaurantId);
    loadCurrentData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRestaurant,
        allRestaurants,
        isAuthenticated: !!user,
        isDemoMode: true, // Clearly indicated demo environment
        login,
        signup,
        logout,
        switchRestaurant,
        refreshState: loadCurrentData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
