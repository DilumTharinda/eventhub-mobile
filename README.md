# EventHub Mobile App

EventHub is a cross-platform mobile application that allows users to discover, book, and manage events. Built with React Native and Expo, it provides a seamless experience for both attendees and event organizers.

## Features

- **User Accounts**: Register, log in, and manage your profile.
- **Event Discovery**: Browse available events, search by name, and filter by categories (Music, Tech, Sports, etc.).
- **Bookings**: Book seats for upcoming events and manage your past and current reservations.
- **Organizer Dashboard**: Users with the `organizer` role can create, edit, and delete events, as well as track bookings for their own events.
- **Push Notifications**: Receive local notifications when confirming or canceling a booking.

## Tech Stack

- **Framework**: React Native (Expo)
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Backend/Database**: Firebase (Firestore & Authentication)
- **Local Storage**: AsyncStorage

## Getting Started

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your Firebase project and add your credentials to a `.env` file (see `.env.example`).
4. Run the app:
   ```bash
   npx expo start
   ```
5. Scan the QR code with the Expo Go app on your phone, or press `i`/`a` to run on an iOS simulator or Android emulator.
