# binaryECom

React Native e-commerce demo app built with TypeScript, Apollo Client (REST via GraphQL), React Navigation, and AsyncStorage persistence.

## Features

- Home experience with category pills, promotional banner, featured products grid, retry states, and app version display.
- Product browsing with search, category filter, price range filter, sort by price, active filter chips, pull-to-refresh, and pagination/infinite loading.
- Product detail screen with wishlist toggle, dynamic price display, and quantity management before/after adding to cart.
- Cart with quantity stepper, item removal, subtotal calculation, and checkout entry.
- Checkout with inline address validation, keyboard-aware form behavior, saved last-used address, and order summary (subtotal, shipping, tax, total).
- Wishlist with quick add/remove to cart and product detail navigation.
- Order flow with mock order placement, success screen, order list, and full order detail view.
- Profile summary with quick links and live counters for orders, wishlist, and cart.
- Local persistence for cart, wishlist, orders, and shipping address via AsyncStorage.
- Toast notifications for error/success feedback.

## Tech Stack

- React Native 0.85.1
- React 19
- TypeScript 5
- Apollo Client + apollo-link-rest (REST API consumed through GraphQL queries)
- React Navigation (Bottom Tabs + Native Stack)
- AsyncStorage for offline state persistence
- react-native-vector-icons (Ionicons)

## API

The app uses EscuelaJS public API:

- Base URL: https://api.escuelajs.co/api/v1/

Configured in src/graphql/client.ts.

## Prerequisites

- Node.js >= 22.11.0
- npm (or yarn/pnpm if you prefer)
- React Native environment setup completed for 0.85:
  https://reactnative.dev/docs/set-up-your-environment
- Android Studio + SDKs for Android development
- Xcode for iOS development (macOS only)

## Quick Start

1. Clone and install dependencies:

```sh
npm install
```

2. Start Metro:

```sh
npm start
```

3. Run the app in another terminal:

Android:

```sh
npm run android
```

iOS (macOS only):

```sh
bundle install
cd ios
bundle exec pod install
cd ..
npm run ios
```

## Scripts

- npm start: start Metro bundler
- npm run android: build and run Android app
- npm run ios: build and run iOS app
- npm test: run Jest tests
- npm run lint: run ESLint

## Project Structure

```text
src/
	components/    Reusable UI components
	constants/     Shared domain models
	context/       Cart, Wishlist, Orders state providers
	graphql/       Apollo client + REST-backed GraphQL queries/types
	navigation/    Tab and stack navigation
	screens/       Feature screens
	theme/         Colors, typography, spacing
	utils/         Mappers, formatters, responsive helpers, storage, toast
```

## State and Persistence

- Cart, wishlist, orders, and last shipping address are persisted in AsyncStorage.
- Hydration runs on app launch so state survives restarts.

## Troubleshooting

### 1) Icons not rendering correctly

If icons look wrong or show fallback glyphs:

```sh
# Rebuild Android assets/fonts
cd android
.\gradlew :app:mergeDebugAssets
cd ..

# Restart Metro with cache reset
npx react-native start --reset-cache
```

Then reinstall the app on the emulator/device.

### 2) iOS pods issues

```sh
cd ios
bundle exec pod install
cd ..
```

If needed, clean Xcode build folder and run again.

### 3) Android build issues

- Verify Android SDK/NDK and JDK are configured from the official RN setup guide.
- Ensure Gradle has enough memory (configured in android/gradle.properties).

## Notes

- New Architecture is enabled (see android/gradle.properties: newArchEnabled=true).
- Hermes is enabled for JavaScript execution.

## License

This project is for practical/demo purposes.
