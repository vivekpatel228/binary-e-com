import { fp } from '../utils/responsive';

export const typography = {
  h1: { fontSize: fp(3.2), fontWeight: '800' as const, letterSpacing: 0.2 },
  h2: { fontSize: fp(2.6), fontWeight: '700' as const },
  h3: { fontSize: fp(2.2), fontWeight: '700' as const },
  title: { fontSize: fp(2), fontWeight: '700' as const },
  body: { fontSize: fp(1.75), fontWeight: '500' as const, lineHeight: fp(2.4) },
  caption: { fontSize: fp(1.5), fontWeight: '500' as const },
  button: { fontSize: fp(1.9), fontWeight: '700' as const, letterSpacing: 0.3 },
  tab: { fontSize: fp(1.5), fontWeight: '600' as const },
};
