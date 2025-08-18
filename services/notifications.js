import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { OneSignal } from 'react-native-onesignal';

const ONESIGNAL_APP_ID = 'e1196afb-2642-4e32-a39b-c92a428bf51b'; // Tu App ID real
const BACKEND_URL = 'https://gtavi-backend-production.up.railway.app'; // URL de Railway

const isExpoGo = Constants?.appOwnership === 'expo';

// Control de solicitud en sesión (evita doble invocación por StrictMode/remontajes)
let requestedThisSession = false;
let promptInProgress = false;

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
    const permission = await OneSignal.Notifications.requestPermission(false);
    if (!permission) {
      setNotifStatus && setNotifStatus({ status: 'error', message: 'Permiso denegado', playerId: '' });
      return false;
    }

    // Esperar a que el playerId esté disponible
    setNotifStatus && setNotifStatus({ status: 'pending', message: 'Obteniendo playerId...', playerId: '' });

    const waitForPlayerId = (timeoutMs = 10000) => {
      return new Promise((resolve) => {
        let timeoutId;
        const onChange = (event) => {
          const id = event?.current?.id;
          if (id) {
            cleanup();
            resolve(id);
          }
        };
        const poll = async () => {
          try {
            const sub = await OneSignal.User.pushSubscription;
            const id = sub?.id;
            if (id) {
              cleanup();
              resolve(id);
            } else {
              pollId = setTimeout(poll, 500);
            }
          } catch (_) {
            pollId = setTimeout(poll, 500);
          }
        };
        let pollId = setTimeout(poll, 0);
        OneSignal.User.pushSubscription.addEventListener('change', onChange);
        timeoutId = setTimeout(() => {
          cleanup();
          resolve(null);
        }, timeoutMs);
        function cleanup() {
          try { OneSignal.User.pushSubscription.removeEventListener('change', onChange); } catch (_) {}
          if (pollId) clearTimeout(pollId);
          if (timeoutId) clearTimeout(timeoutId);
        }
      });
    };

    const playerId = await waitForPlayerId(12000);
    if (!playerId) {
      setNotifStatus && setNotifStatus({ status: 'error', message: 'No se pudo obtener playerId', playerId: '' });
      return false;
    }

    const res = await fetch(`${BACKEND_URL}/api/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, platform: Platform.OS })
    });
    try { await AsyncStorage.setItem('@gtavi_notifs_registered', 'true'); } catch(_) {}
    setNotifStatus && setNotifStatus({ status: 'success', message: 'Dispositivo registrado', playerId });
    return true;
  } catch (e) {
    setNotifStatus && setNotifStatus({ status: 'error', message: 'Error solicitando permisos', playerId: '' });
    return false;
  }
}

export function useInitNotifications(setNotifStatus) {
  const hasRequestedRef = useRef(false);
  useEffect(() => {
    // Inicializar OneSignal con la nueva API modular
    initializeOneSignal();
    
    // Solicitar permisos de notificación (una sola vez por sesión)
    const requestOnce = async () => {
      try {
        if (hasRequestedRef.current || requestedThisSession || promptInProgress || isExpoGo) return;

        // Respetar una denegación previa del usuario (persistida)
        const denied = await AsyncStorage.getItem('@gtavi_notifs_denied');
        if (denied === 'true') {
          setNotifStatus && setNotifStatus({ status: 'error', message: 'Permiso denegado (previo)', playerId: '' });
          hasRequestedRef.current = true;
          return;
        }

        hasRequestedRef.current = true;
        requestedThisSession = true;
        promptInProgress = true;
        // No abrir ajustes automáticamente si el usuario rechazó previamente
        const granted = await OneSignal.Notifications.requestPermission(false);
        if (!granted) {
          setNotifStatus && setNotifStatus({ status: 'error', message: 'Permiso denegado', playerId: '' });
          // Persistir la preferencia para no volver a solicitar automáticamente
          try { await AsyncStorage.setItem('@gtavi_notifs_denied', 'true'); } catch(_) {}
          promptInProgress = false;
          return; // No continuar si se deniega
        }
        // Si fue concedido ahora, limpiar bandera de denegado
        try { await AsyncStorage.removeItem('@gtavi_notifs_denied'); } catch(_) {}
        promptInProgress = false;
      } catch (_) {
        // Si falla la solicitud, no reintentar en bucle
        setNotifStatus && setNotifStatus({ status: 'error', message: 'Error solicitando permisos', playerId: '' });
        promptInProgress = false;
        return;
      }
    };

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
          // Sin playerId aún: no marcar error duro si el usuario puede haber denegado
          setNotifStatus && setNotifStatus({ status: 'pending', message: 'Esperando suscripción push', playerId: '' });
        }
      } catch (err) {
        setNotifStatus && setNotifStatus({ status: 'error', message: 'Error obteniendo playerId', playerId: '' });
        console.error('Error obteniendo playerId:', err);
      }
    };

    // Configurar listener para cuando se obtenga el playerId
    const onSubscriptionChange = (event) => {
      try {
        const playerId = event?.current?.id;
        if (playerId) {
          registerDevice(playerId);
        }
      } catch (_) {}
    };

    // Agregar listener para cambios en la suscripción
    OneSignal.User.pushSubscription.addEventListener('change', onSubscriptionChange);

    // Intentar solicitar permiso y luego obtener el playerId
    requestOnce().then(() => getPlayerId());

    // Limpieza de listeners
    return () => {
      OneSignal.User.pushSubscription.removeEventListener('change', onSubscriptionChange);
    };
  }, [setNotifStatus]);
} 