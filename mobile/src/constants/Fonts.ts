import { StyleSheet, TextStyle } from "react-native";

// Font families
const FontFamily = {
  LIGHT: "Inter_300Light",
  REGULAR: "Inter_400Regular",
  MEDIUM: "Inter_500Medium",
  SEMIBOLD: "Inter_600SemiBold",
  BOLD: "Inter_700Bold",
  EXTRABOLD: "Inter_800ExtraBold",
  BLACK: "Inter_900Black",
};

// Font sizes
const FontSize = {
  XS: 12,
  SMALL: 14,
  MD: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
  XXXL: 30,
};

// Precomputed font styles that can be used directly in StyleSheet
const Fonts = StyleSheet.create({
  // Font weights
  light: { fontFamily: FontFamily.LIGHT },
  regular: { fontFamily: FontFamily.REGULAR },
  medium: { fontFamily: FontFamily.MEDIUM },
  semibold: { fontFamily: FontFamily.SEMIBOLD },
  bold: { fontFamily: FontFamily.BOLD },

  // Font sizes
  xs: { fontSize: FontSize.XS },
  small: { fontSize: FontSize.SMALL },
  md: { fontSize: FontSize.MD },
  lg: { fontSize: FontSize.LG },
  xl: { fontSize: FontSize.XL },
  xxl: { fontSize: FontSize.XXL },
  xxxl: { fontSize: FontSize.XXXL },

  // Common combinations
  xsLight: { fontSize: FontSize.XS, fontFamily: FontFamily.LIGHT },
  xsRegular: { fontSize: FontSize.XS, fontFamily: FontFamily.REGULAR },
  xsMedium: { fontSize: FontSize.XS, fontFamily: FontFamily.MEDIUM },
  xsSemibold: { fontSize: FontSize.XS, fontFamily: FontFamily.SEMIBOLD },
  xsBold: { fontSize: FontSize.XS, fontFamily: FontFamily.BOLD },

  smallLight: { fontSize: FontSize.SMALL, fontFamily: FontFamily.LIGHT },
  smallRegular: { fontSize: FontSize.SMALL, fontFamily: FontFamily.REGULAR },
  smallMedium: { fontSize: FontSize.SMALL, fontFamily: FontFamily.MEDIUM },
  smallSemibold: { fontSize: FontSize.SMALL, fontFamily: FontFamily.SEMIBOLD },
  smallBold: { fontSize: FontSize.SMALL, fontFamily: FontFamily.BOLD },

  mdLight: { fontSize: FontSize.MD, fontFamily: FontFamily.LIGHT },
  mdRegular: { fontSize: FontSize.MD, fontFamily: FontFamily.REGULAR },
  mdMedium: { fontSize: FontSize.MD, fontFamily: FontFamily.MEDIUM },
  mdSemibold: { fontSize: FontSize.MD, fontFamily: FontFamily.SEMIBOLD },
  mdBold: { fontSize: FontSize.MD, fontFamily: FontFamily.BOLD },

  lgLight: { fontSize: FontSize.LG, fontFamily: FontFamily.LIGHT },
  lgRegular: { fontSize: FontSize.LG, fontFamily: FontFamily.REGULAR },
  lgMedium: { fontSize: FontSize.LG, fontFamily: FontFamily.MEDIUM },
  lgSemibold: { fontSize: FontSize.LG, fontFamily: FontFamily.SEMIBOLD },
  lgBold: { fontSize: FontSize.LG, fontFamily: FontFamily.BOLD },

  xlLight: { fontSize: FontSize.XL, fontFamily: FontFamily.LIGHT },
  xlRegular: { fontSize: FontSize.XL, fontFamily: FontFamily.REGULAR },
  xlMedium: { fontSize: FontSize.XL, fontFamily: FontFamily.MEDIUM },
  xlSemibold: { fontSize: FontSize.XL, fontFamily: FontFamily.SEMIBOLD },
  xlBold: { fontSize: FontSize.XL, fontFamily: FontFamily.BOLD },

  xxlLight: { fontSize: FontSize.XXL, fontFamily: FontFamily.LIGHT },
  xxlRegular: { fontSize: FontSize.XXL, fontFamily: FontFamily.REGULAR },
  xxlMedium: { fontSize: FontSize.XXL, fontFamily: FontFamily.MEDIUM },
  xxlSemibold: { fontSize: FontSize.XXL, fontFamily: FontFamily.SEMIBOLD },
  xxlBold: { fontSize: FontSize.XXL, fontFamily: FontFamily.BOLD },
  xxlBlack: { fontSize: FontSize.XXL, fontFamily: FontFamily.BLACK },

  xxxlLight: { fontSize: FontSize.XXXL, fontFamily: FontFamily.LIGHT },
  xxxlRegular: { fontSize: FontSize.XXXL, fontFamily: FontFamily.REGULAR },
  xxxlMedium: { fontSize: FontSize.XXXL, fontFamily: FontFamily.MEDIUM },
  xxxlSemibold: { fontSize: FontSize.XXXL, fontFamily: FontFamily.SEMIBOLD },
  xxxlBold: { fontSize: FontSize.XXXL, fontFamily: FontFamily.BOLD },
  xxxlBlack: { fontSize: FontSize.XXXL, fontFamily: FontFamily.BLACK },
});

export { FontFamily, FontSize, Fonts };
export default Fonts;
