import * as Permissions from 'expo-permissions';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
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

export const usePushNotifications = (
        notificationHandler: NotificationHandler,
        interactionHandler: ResponseHandler,
        behavior?: Notifications.NotificationBehavior
    ) : void => {

    const notificationListener = useRef<Subscription>();
    const responseListener = useRef<Subscription>();

    const [inAppPermission, setInAppPermission] = useState<boolean | undefined>(false);
    const [systemPermission, setSystemPermission] = useState<boolean | undefined>(false);

    const readInAppPermissionFromStore = useCallback(async () => {
        readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION)
            .then(setInAppPermission);
    },[setInAppPermission])

    useEffect(() => {
        readInAppPermissionFromStore();
    }, [])

    const updateSystemPermissionState = useCallback(async () => {
        const newSystemPermission = await handleSystemPermissions();
        setSystemPermission(newSystemPermission);

        //fixme tabbing out, changing permission, tabbing in needs to be checked
    }, [setSystemPermission])

    useEffect(() => {
        if(inAppPermission) updateSystemPermissionState()
    }, [inAppPermission])

    useEffect(() => {
        if(inAppPermission && systemPermission) {
            registerForPushNotificationsAsync().then(handleIncomingToken);
    
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
        } else if (!inAppPermission) {
            Notifications.removeAllNotificationListeners();
            // FIXME notify server
        }
    }, [inAppPermission, systemPermission]);

    useEffect(() => {
        inAppPermission ?? showInitialPushAlert(setInAppPermission)
    }, [inAppPermission])

    Notifications.setNotificationHandler({
        handleNotification: async () => (behavior ?? {
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
        }),
    });
}

export const handleSystemPermissions = async (): Promise<boolean> => {

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

const showInitialPushAlert = (setInAppPermission: (arg: boolean | undefined) => void): void=> {
    const { greetingBody, greetingTitle, approve, decline} = texts.pushNotifications;
    Alert.alert(
        greetingTitle,
        greetingBody,
        [
            {
                text: decline,
                onPress: () => addToStore(PushNotificationStorageKeys.IN_APP_PERMISSION, false)
                    .then(() => setInAppPermission(false))
            },
            {
                text: approve,
                onPress: () => addToStore(PushNotificationStorageKeys.IN_APP_PERMISSION, true)
                    .then(() => setInAppPermission(true)),
                style: 'cancel'
            },
        ],
        { cancelable: false }
    );
}
// handle the case of personal area permission being granted but system settings being denied
// create initial dialog
