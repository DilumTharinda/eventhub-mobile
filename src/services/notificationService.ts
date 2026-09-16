import { Platform, Alert } from 'react-native';

// In Expo Go SDK 53+, importing expo-notifications on Android can cause a fatal crash
// because remote push functionality was removed. We try to import it, and if it fails,
// we fallback to simple Alerts.
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
  
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn("expo-notifications is not available in this environment, falling back to Alert.");
}

export async function registerForPushNotificationsAsync() {
  if (!Notifications) return;

  try {
    let token;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    return token;
  } catch (e) {
    console.warn("Failed to register for push notifications:", e);
  }
}

export async function scheduleLocalNotification(title: string, body: string) {
  if (Notifications) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null, // trigger immediately
      });
      return;
    } catch (e) {
      console.warn("Notification failed, falling back to Alert:", e);
    }
  }
  
  // Fallback if expo-notifications is missing or crashed
  Alert.alert(title, body);
}
