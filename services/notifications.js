import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { OneSignal } from 'react-native-onesignal';

const ONESIGNAL_APP_ID = 'e1196afb-2642-4e32-a39b-c92a428bf51b'; // Tu App ID real
const BACKEND_URL = 'https://gtavi-backend-production.up.railway.app'; // URL de Railway

const isExpoGo = Constants?.appOwnership === 'expo';

export function initializeOneSignal() {
  if (isExpoGo) return; // Evitar usar OneSignal en Expo Go
  try {
    OneSignal.initialize(ONESIGNAL_APP_ID);
  } catch (e) {
    // ignore if already initialized
  }
}

export async function requestAndRegisterNotifications(setNotifStatus) {
  try {
    if (isExpoGo) {
      // En Expo Go no hay módulo nativo. Simular rechazo silencioso.
      setNotifStatus && setNotifStatus({ status: 'error', message: 'Notificaciones no disponibles en Expo Go', playerId: '' });
      return false;
    }
    initializeOneSignal();
    const permission = await OneSignal.Notifications.requestPermission(true);
    if (!permission) {
      setNotifStatus && setNotifStatus({ status: 'error', message: 'Permiso denegado', playerId: '' });
      return false;
    }

    // Intentar obtener el playerId luego del permiso
    const deviceState = await OneSignal.User.pushSubscription;
    const playerId = deviceState?.id;
    if (playerId) {
      await fetch(`${BACKEND_URL}/api/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, platform: Platform.OS })
      });
      setNotifStatus && setNotifStatus({ status: 'success', message: 'Dispositivo registrado', playerId });
      return true;
    }
    setNotifStatus && setNotifStatus({ status: 'error', message: 'No se pudo obtener playerId', playerId: '' });
    return false;
  } catch (e) {
    setNotifStatus && setNotifStatus({ status: 'error', message: 'Error solicitando permisos', playerId: '' });
    return false;
  }
}

export function useInitNotifications(setNotifStatus) {
  useEffect(() => {
    // Inicializar OneSignal con la nueva API modular
    initializeOneSignal();
    
    // Solicitar permisos de notificación
    OneSignal.Notifications.requestPermission(true);

    const registerDevice = (playerId) => {
      setNotifStatus && setNotifStatus({ status: 'pending', message: 'Registrando en backend...', playerId });
      fetch(`${BACKEND_URL}/api/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          platform: Platform.OS
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNotifStatus && setNotifStatus({ status: 'success', message: 'Dispositivo registrado', playerId });
          } else {
            setNotifStatus && setNotifStatus({ status: 'error', message: data.error || 'Error desconocido', playerId });
          }
          console.log('Registro de dispositivo en backend:');
        })
        .catch(err => {
          setNotifStatus && setNotifStatus({ status: 'error', message: 'Error registrando en backend', playerId });
          console.error('Error registrando dispositivo en backend:', err);
        });
    };

    // Obtener el playerId usando la nueva API
    const getPlayerId = async () => {
      try {
        const deviceState = await OneSignal.User.pushSubscription;
        const playerId = deviceState?.id;
        
        if (playerId) {
          registerDevice(playerId);
        } else {
          setNotifStatus && setNotifStatus({ status: 'error', message: 'No se pudo obtener playerId', playerId: '' });
          console.error('No se pudo obtener playerId');
        }
      } catch (err) {
        setNotifStatus && setNotifStatus({ status: 'error', message: 'Error obteniendo playerId', playerId: '' });
        console.error('Error obteniendo playerId:', err);
      }
    };

    // Configurar listener para cuando se obtenga el playerId
    const onSubscriptionChange = (event) => {
      const playerId = event.current.id;
      if (playerId) {
        registerDevice(playerId);
      }
    };

    // Agregar listener para cambios en la suscripción
    OneSignal.User.pushSubscription.addEventListener('change', onSubscriptionChange);

    // Intentar obtener el playerId inicial
    getPlayerId();

    // Limpieza de listeners
    return () => {
      OneSignal.User.pushSubscription.removeEventListener('change', onSubscriptionChange);
    };
  }, [setNotifStatus]);
} 