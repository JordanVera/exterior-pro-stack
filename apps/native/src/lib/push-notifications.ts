import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

/**
 * Register for push notifications and return the Expo push token
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  let token: string | null = null;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;
      if (!projectId) {
        console.error('Project ID not found');
        return null;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      console.log('Push token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#84CC16',
    });
  }

  return token;
}

/**
 * Get the last notification response (for handling notifications when app was closed)
 */
export async function getLastNotificationResponse() {
  return await Notifications.getLastNotificationResponseAsync();
}

/**
 * Add listener for notifications received while app is foregrounded
 */
export function addNotificationReceivedListener(
  listener: (notification: Notifications.Notification) => void,
) {
  return Notifications.addNotificationReceivedListener(listener);
}

/**
 * Add listener for notification responses (user tapped notification)
 */
export function addNotificationResponseReceivedListener(
  listener: (response: Notifications.NotificationResponse) => void,
) {
  return Notifications.addNotificationResponseReceivedListener(listener);
}

/**
 * Get current badge count
 */
export async function getBadgeCountAsync(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCountAsync(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear all notifications
 */
export async function dismissAllNotificationsAsync(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}
