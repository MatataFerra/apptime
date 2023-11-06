"use client";

import { createContext, useContext, useReducer } from "react";

import { FormStep } from "@/types/forms";

const TYPE_ACTIONS = {
  SET_STEP: "SET_STEP",
} as const;

type StepContext = {
  currentStep: FormStep;
  setCurrentStep: () => void;
};

type State = {
  currentStep: FormStep;
};

type Action = { type: typeof TYPE_ACTIONS.SET_STEP };

function stepReducer(state: State, action: Action) {
  switch (action.type) {
    case TYPE_ACTIONS.SET_STEP:
      return {
        ...state,
        currentStep: state.currentStep + 1,
      };

    default:
      return state;
  }
}
export const StepContext = createContext({} as StepContext);

const INITIAL_STATE: State = {
  currentStep: FormStep.PERSONAL_INFO,
};

function StepProvider({ children }: { children: React.ReactElement | React.ReactElement[] }) {
  const [state, dispatch] = useReducer(stepReducer, INITIAL_STATE);

  function setCurrentStep() {
    dispatch({ type: TYPE_ACTIONS.SET_STEP });
  }

  return (
    <>
      <StepContext.Provider value={{ ...state, setCurrentStep }}>{children}</StepContext.Provider>
    </>
  );
}

export function useFormStep() {
  const { ...rest } = useContext(StepContext);

  return {
    ...rest,
  };
}

export default StepProvider;
