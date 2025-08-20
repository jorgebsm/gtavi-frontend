import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONESIGNAL_APP_ID = 'e1196afb-2642-4e32-a39b-c92a428bf51b';
const BACKEND_URL = 'https://gtavi-backend-production.up.railway.app';
const DENIED_KEY = '@gtavi_notifs_denied';
const REGISTERED_KEY = '@gtavi_notifs_registered';
let requestedThisSession = false;

export function useInitNotifications(setNotifStatus) {
  const promptInProgressRef = useRef(false);

  useEffect(() => {
    OneSignal.initialize(ONESIGNAL_APP_ID);

    const registerDevice = async (playerId) => {
      setNotifStatus && setNotifStatus({ status: 'pending', message: 'Registrando en backend...', playerId });
      try {
        const res = await fetch(`${BACKEND_URL}/api/devices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId, platform: Platform.OS })
        });
        const data = await res.json();
        if (data.success) {
          await AsyncStorage.setItem(REGISTERED_KEY, 'true');
          setNotifStatus && setNotifStatus({ status: 'success', message: 'Dispositivo registrado', playerId });
        } else {
          setNotifStatus && setNotifStatus({ status: 'error', message: data.error || 'Error desconocido', playerId });
        }
      } catch (err) {
        setNotifStatus && setNotifStatus({ status: 'error', message: 'Error registrando en backend', playerId });
        console.error('Error registrando dispositivo en backend:', err);
      }
    };

    // Obtener el playerId usando la nueva API
    const getPlayerId = async () => {
      try {
        const deviceState = OneSignal.User.pushSubscription;
        const playerId = deviceState?.id;
        
        if (playerId) {
          await registerDevice(playerId);
        } else {
          setNotifStatus && setNotifStatus({ status: 'error', message: 'No se pudo obtener playerId', playerId: '' });
          console.error('No se pudo obtener playerId');
        }
      } catch (err) {
        setNotifStatus && setNotifStatus({ status: 'error', message: 'Error obteniendo playerId', playerId: '' });
        console.error('Error obteniendo playerId:', err);
      }
    };

    const onSubscriptionChange = (event) => {
      const playerId = event.current.id;
      if (playerId) {
        registerDevice(playerId);
      }
    };

    // Agregar listener para cambios en la suscripción
    OneSignal.User.pushSubscription.addEventListener('change', onSubscriptionChange);

    const initFlow = async () => {
      try {
        const sub = OneSignal.User.pushSubscription;
        if (sub?.id || sub?.optedIn === true) {
          setNotifStatus && setNotifStatus({ status: 'success', message: 'Notificaciones ya activas', playerId: sub?.id || '' });
          await AsyncStorage.setItem(REGISTERED_KEY, 'true');
          return;
        }

        const denied = await AsyncStorage.getItem(DENIED_KEY);
        if (denied === 'true' || requestedThisSession || promptInProgressRef.current) {
          setNotifStatus && setNotifStatus({ status: 'idle', message: 'Permisos no solicitados (negado previamente o ya solicitado)', playerId: '' });
          return;
        }

        promptInProgressRef.current = true;
        requestedThisSession = true;
        const granted = await OneSignal.Notifications.requestPermission(false);
        promptInProgressRef.current = false;

        if (granted) {
          await getPlayerId();
        } else {
          await AsyncStorage.setItem(DENIED_KEY, 'true');
          setNotifStatus && setNotifStatus({ status: 'denied', message: 'Usuario denegó notificaciones', playerId: '' });
        }
      } catch (e) {
        promptInProgressRef.current = false;
        console.error('Init notifications error:', e?.message || e);
      }
    };

    initFlow();

    // Limpieza de listeners
    return () => {
      OneSignal.User.pushSubscription.removeEventListener('change', onSubscriptionChange);
    };
  }, [setNotifStatus]);
} 