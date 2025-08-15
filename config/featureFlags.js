// Feature flags centralizados
// Cambia ONBOARDING_ENABLED a true para activar el onboarding
export const FEATURE_FLAGS = {
  ONBOARDING_ENABLED: true,
  ONBOARDING_REPROMPT_DAYS: 7
};

export const isOnboardingEnabled = () => FEATURE_FLAGS.ONBOARDING_ENABLED === true;

export default FEATURE_FLAGS;


