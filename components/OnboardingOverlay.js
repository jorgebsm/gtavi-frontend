import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const OnboardingOverlay = ({
  visible
}) => {
  const lottieRef = useRef(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    let timer;
    if (visible && lottieRef.current && !hasStartedRef.current) {
      timer = setTimeout(() => {
        try {
          // Asegura que el frame actual haya pintado antes de reproducir
          requestAnimationFrame(() => {
            try { lottieRef.current?.play(); hasStartedRef.current = true; } catch (_) {}
          });
        } catch (_) {}
      }, 4000);
    } else if (!visible && lottieRef.current) {
      try {
        // Detener y reiniciar para evitar flashes si cambia el flag remoto
        lottieRef.current?.reset?.();
        hasStartedRef.current = false;
      } catch (_) {}
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible]);

  return (
    <View
      pointerEvents={visible ? 'box-none' : 'none'}
      style={[styles.overlay, !visible && styles.hidden]}
    >
      <View pointerEvents="box-none" style={styles.content}>
        <View pointerEvents="none" style={styles.leftBlock}>
          <LottieView
            source={require('../assets/animations/scroll.json')}
            autoPlay={false}
            loop
            style={styles.lottie}
            speed={1}
            ref={lottieRef}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    opacity: 0,
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'transparent'
  },
  centerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: width * 0.6,
    height: width * 0.6,
    // left: "40%",
    // bottom: "0%",
    opacity: 1,
  },
  leftBlock: {
    position: 'absolute',
    // left: 16,
    top: '0%',
    left: "60%",
    // transform: [{ translateY: -((width * 0.3) / 2) }],
    // alignItems: 'flex-end',
    // justifyContent: 'center',
  },
  // Skip removed
});

export default OnboardingOverlay;


