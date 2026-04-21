import {
  widthPercentageToDP,
  heightPercentageToDP,
} from 'react-native-responsive-screen';
import { PixelRatio } from 'react-native';

export const wp = (percentage: number): number =>
  widthPercentageToDP(`${percentage}%`);

export const hp = (percentage: number): number =>
  heightPercentageToDP(`${percentage}%`);

export const fp = (percentage: number): number => {
  const size = heightPercentageToDP(`${percentage}%`);
  return PixelRatio.roundToNearestPixel(size);
};
