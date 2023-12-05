/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, useColorScheme, View as DefaultView, TouchableOpacity, TextInput } from 'react-native';

import Colors from '../constants/Colors';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function DangerText(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = "#ff0000"

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}


export function H1(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color, fontSize: 32, fontWeight: 'bold' }, style]} {...otherProps} />;
}

export function H2(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color, fontSize: 20, fontWeight: 'bold' }, style]} {...otherProps} />;
}


export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function OutlineButton(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');


  return <TouchableOpacity style={[{ backgroundColor, borderWidth: 1, borderColor: color, borderRadius: 4, padding: 8, width: '100%' }, style]} {...otherProps}>{props.children}</TouchableOpacity>;
}

export function OutlineTextbox(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

return <TextInput
  style={{ height: 40, borderColor: 'gray', borderWidth: 1, paddingLeft: 4, color }}
  placeholderTextColor={color}
  {...otherProps}
/>
}



export function DangerButton(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const color = "#ff0000";


  return <TouchableOpacity style={[{ backgroundColor, borderWidth: 1, borderColor: color, borderRadius: 4, padding: 8, width: '100%' }, style]} {...otherProps}>{props.children}</TouchableOpacity>;
}

export function VerticalSpace1(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor, height: 16 }, style]} {...otherProps} />;
}

export function HorizontalRule(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultView style={[{ backgroundColor, height: 1, width: '100%', opacity: 0.5 }, style]} {...otherProps} />;
}