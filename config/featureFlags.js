// Feature flags centralizados
// Cambia ONBOARDING a true para activar el onboarding
export const FEATURE_FLAGS = {
  ONBOARDING: false,
  ONBOARDING_REPROMPT_DAYS: 7
};

let remoteOnboardingEnabled = null;

export const isOnboardingEnabled = () => {
  if (remoteOnboardingEnabled === null) return FEATURE_FLAGS.ONBOARDING === true;
  return remoteOnboardingEnabled === true;
};

export const setRemoteOnboardingEnabled = (value) => {
  remoteOnboardingEnabled = value;
};

export default FEATURE_FLAGS;


