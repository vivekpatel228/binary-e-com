import React from 'react';
import {
  Ionicons,
  type IoniconsIconName,
} from '@react-native-vector-icons/ionicons';

type Props = {
  icon: IoniconsIconName;
  color: string;
  size: number;
};

const TabBarIcon: React.FC<Props> = ({ icon, color, size }) => (
  <Ionicons name={icon} size={size} color={color} />
);

export default TabBarIcon;
