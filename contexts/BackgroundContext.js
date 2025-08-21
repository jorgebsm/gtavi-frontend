import React, { createContext, useContext, useMemo } from 'react';

// Mapa estático de fondos. Ajusta extensión si alguna imagen es .png
const BACKGROUND_SOURCES = {
  1: require('../assets/backgrounds/1.jpg'),
  2: require('../assets/backgrounds/2.jpg'),
  3: require('../assets/backgrounds/3.jpg'),
  4: require('../assets/backgrounds/4.jpg'),
  5: require('../assets/backgrounds/5.jpg'),
  6: require('../assets/backgrounds/6.jpg'),
  7: require('../assets/backgrounds/7.jpg'),
  8: require('../assets/backgrounds/8.jpg'),
  9: require('../assets/backgrounds/9.jpg'),
};

const BACKGROUND_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const HOME_ALLOWED = [1, 4, 7, 9];

const SCREEN_NAMES = ['Home', 'Trailers', 'News', 'Leaks', 'Wallpapers', 'More'];

const BackgroundContext = createContext({
  getBackgroundFor: (screenName) => undefined,
});

export const BackgroundProvider = ({ children }) => {
  const mapping = useMemo(() => {
    // Elegir fondo de Home de su lista permitida
    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const used = new Set();
    const homeBg = pickRandom(HOME_ALLOWED);
    used.add(homeBg);

    // Pool restante (puede incluir ids no permitidos por Home)
    const remaining = BACKGROUND_IDS.filter((id) => !used.has(id));

    // Elegir 5 distintos para las demás screens
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    const others = shuffled.slice(0, 5);

    const result = {
      Home: homeBg,
    };

    const otherScreens = SCREEN_NAMES.filter((n) => n !== 'Home');
    otherScreens.forEach((name, idx) => {
      result[name] = others[idx % others.length];
    });

    return result;
  }, []);

  const getBackgroundFor = (screenName) => {
    const id = mapping[screenName];
    return id ? BACKGROUND_SOURCES[id] : undefined;
  };

  return (
    <BackgroundContext.Provider value={{ getBackgroundFor }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackgrounds = () => {
  const ctx = useContext(BackgroundContext);
  if (!ctx) throw new Error('useBackgrounds must be used within BackgroundProvider');
  return ctx;
};

export default BackgroundContext;


