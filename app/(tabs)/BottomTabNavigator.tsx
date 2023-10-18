// src/navigation/BottomTabNavigator.tsx

import App from './index'; // Add this line
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabBarIcon from '../../TabBarIcon'; // Assuming TabBarIcon is located in the same directory


const BottomTab = createBottomTabNavigator();

// ...

<BottomTab.Screen
  name="Upload"
  component={App}
  options={{
    tabBarIcon: ({ color }) => <TabBarIcon name="md-upload" color={color} />,
  }}
/>
