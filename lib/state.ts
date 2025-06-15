type State = {
  /** Whether the user has landed on the app or not. */
  skipLanding?: boolean;
  /** Name of the last wallet used. */
  lastWallet?: string;
};

export const getState = (): State => {
  const state = localStorage.getItem("state");

  if (!state) return {};

  return JSON.parse(state);
};

export const setState = (state: Partial<State>) => {
  const currentState = { ...getState(), ...state };

  // Only check undefined values in the passed state
  Object.entries(state).forEach(([key, value]) => {
    if (value === undefined) {
      delete (currentState as any)[key];
    }
  });

  localStorage.setItem("state", JSON.stringify(currentState));
};

export const removeState = (...keys: (keyof State)[]) => {
  const currentState = getState();

  keys.forEach((key) => {
    delete currentState[key];
  });

  localStorage.setItem("state", JSON.stringify(currentState));
};
