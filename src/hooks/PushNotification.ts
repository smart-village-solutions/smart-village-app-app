import * as Permissions from 'expo-permissions';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';
import { useEffect, useRef } from 'react';
import { Subscription } from '@unimodules/react-native-adapter'
import { addToStore, readFromStore } from '../helpers';
import { PermissionStatus } from 'expo-permissions';
import { texts } from '../config';

type NotificationHandler = (arg: Notifications.Notification) => void;
type ResponseHandler = (arg: Notifications.NotificationResponse) => void;

enum PushNotificationStorageKeys {
    PUSH_TOKEN = "PUSH_TOKEN",
    IN_APP_PERMISSION = "IN_APP_PERMISSION",
}

export const setInAppPermission = async (newValue: boolean) => {
    const oldValue = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION)
    if(newValue !== oldValue) {

        // FIXME error handling: sync with server failed, etc
        addToStore(PushNotificationStorageKeys.IN_APP_PERMISSION, newValue);

        if(newValue) {
            const hasPermission = await handleSystemPermissions();
            
                if(!hasPermission) {
                    showSystemPermissionMissingDialog();
                } else {
                    registerForPushNotificationsAsync()
                        .then(handleIncomingToken);
                }
            }
    }
}

const initialize = async () => {
    const inAppPermission = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION)
    await inAppPermission && handleSystemPermissions()
        .then(registerForPushNotificationsAsync)
        .then(handleIncomingToken)
    inAppPermission ?? showInitialPushAlert();
    showSystemPermissionMissingDialog();
}


export const usePushNotifications = (
        notificationHandler: NotificationHandler,
        interactionHandler: ResponseHandler,
        behavior?: Notifications.NotificationBehavior
    ) : void => {

    const notificationListener = useRef<Subscription>();
    const responseListener = useRef<Subscription>();

    useEffect(() => {
        initialize();

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

        Notifications.setNotificationHandler({
            handleNotification: async () => (behavior ?? {
                shouldShowAlert: true,
                shouldPlaySound: false,
                shouldSetBadge: false,
            }),
        });

        return () => {
            notificationListener.current
                && Notifications.removeNotificationSubscription(notificationListener.current);
            responseListener.current
                && Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, [])

}

const handleSystemPermissions = async (): Promise<boolean> => {

    if(!Constants.isDevice) return false;

    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);

    let finalStatus = existingStatus;
    if (existingStatus === PermissionStatus.UNDETERMINED) {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
    }

    return finalStatus === PermissionStatus.GRANTED;
}

const registerForPushNotificationsAsync = async (): Promise<string | undefined> => {
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

const handleIncomingToken = async (token?: string) => {
    console.log(token); // remove for production

    await readFromStore(PushNotificationStorageKeys.PUSH_TOKEN).then(result => {
        if (result != token) {
            // update token on server
            addToStore(PushNotificationStorageKeys.PUSH_TOKEN, token);
        }
    });
}

const showSystemPermissionMissingDialog = () => {
    const { permissionMissingBody, permissionMissingTitle } = texts.pushNotifications;

    Alert.alert(
        permissionMissingTitle,
        permissionMissingBody,
        undefined,
        { cancelable: false }
    );
}

const showInitialPushAlert = (): void=> {
    const { greetingBody, greetingTitle, approve, decline} = texts.pushNotifications;
    Alert.alert(
        greetingTitle,
        greetingBody,
        [
            {
                text: decline,
                onPress: () => setInAppPermission(false)
            },
            {
                text: approve,
                onPress: () => setInAppPermission(true),
                style: 'cancel'
            },
        ],
        { cancelable: false }
    );
}
