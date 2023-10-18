// Example of TabBarIcon component
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

const TabBarIcon = ({ name, color }) => {
  return <Ionicons name={name} size={30} color={color} />;
};

export default TabBarIcon;
