import * as Permissions from 'expo-permissions';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useEffect, useRef } from 'react';
import { Subscription } from '@unimodules/react-native-adapter'
import { addToStore, readFromStore } from '../helpers';
import { PermissionStatus } from 'expo-permissions';

type NotificationHandler = (arg: Notifications.Notification) => void;
type ResponseHandler = (arg: Notifications.NotificationResponse) => void;

enum PushNotificationStorageKeys {
    PUSH_TOKEN = "PUSH_TOKEN",
    IN_APP_PERMISSION = "IN_APP_PERMISSION",
}

const handleIncomingToken = async (token?: string) => {
    if (!token) return;
    console.log(token); // remove for production

    await readFromStore(PushNotificationStorageKeys.PUSH_TOKEN).then(result => {
        if (result != token) {
            // update token on server
            addToStore(PushNotificationStorageKeys.PUSH_TOKEN, token);
        }
    });
}

export const usePushNotifications = (
        notificationHandler: NotificationHandler,
        interactionHandler: ResponseHandler,
        behavior?: Notifications.NotificationBehavior
    ) : void => {

    const notificationListener = useRef<Subscription>();
    const responseListener = useRef<Subscription>();

    useEffect(
        () => {
            checkForInAppPermission()
                .then((hasInAppPermission) => hasInAppPermission && handleSystemPermissions())
                .then(registerForPushNotificationsAsync)
                .then(handleIncomingToken)

            // This listener is fired whenever a notification is received while the app is foregrounded
            notificationListener.current
                = Notifications.addNotificationReceivedListener(notification => {
                    notificationHandler(notification);
                });

            // This listener is fired whenever a user taps on or interacts with a notification
            // (works when app is foregrounded, backgrounded, or killed)
            responseListener.current
                = Notifications.addNotificationResponseReceivedListener(response => {
                    interactionHandler(response)
                });

            return () => {
                notificationListener.current
                    && Notifications.removeNotificationSubscription(notificationListener.current);
                responseListener.current
                    && Notifications.removeNotificationSubscription(responseListener.current);
            };
        }
        , []
    );

    Notifications.setNotificationHandler({
        handleNotification: async () => (behavior ?? {
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
        }),
    });
}

const registerForPushNotificationsAsync = async (hasPermission: boolean): Promise<string | undefined> => {
    if (!hasPermission) return;

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return token;
}

const checkForInAppPermission = async (): Promise<boolean> => {
    const inAppPermission = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION)
    await inAppPermission ?? addToStore(PushNotificationStorageKeys.IN_APP_PERMISSION, true); // fix with dialog
    return inAppPermission ?? true; //fix with dialog
}

export const handleSystemPermissions = async (): Promise<boolean> => {

    if(!Constants.isDevice) return false;

    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);

    console.log(existingStatus);

    let finalStatus = existingStatus;
    if (existingStatus === PermissionStatus.UNDETERMINED) {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
    }

    console.log("finalStatus ", finalStatus)
    return finalStatus === PermissionStatus.GRANTED;

}

// handle the case of personal area permission being granted but system settings being denied
// create initial dialog
