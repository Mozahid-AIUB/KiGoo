export const colors = {
  ink: '#221B3D',
  inkSoft: '#3D3170',
  accent: '#6B5FD9',
  accentSoft: '#EDEBFB',
  paper: '#F7F6FB',
  card: '#FFFFFF',
  border: '#E4E1F5',
  text: '#3D3170',
  textMuted: '#7A7590',
  confirmed: '#1B9C6E',
  confirmedSoft: '#E4F5EC',
  warning: '#B8862E',
  warningSoft: '#FBF0DD',
  danger: '#D64545',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
};

export const fonts = {
  display: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
};

export const typography = {
  h1: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
  h2: { fontFamily: fonts.display, fontSize: 19, color: colors.ink },
  h3: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: 14, color: colors.text },
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  caption: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.textMuted, letterSpacing: 0.4 },
  numeral: { fontFamily: fonts.display, color: colors.ink },
};

export const shadow = {
  card: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
};
