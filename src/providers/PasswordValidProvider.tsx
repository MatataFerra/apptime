"use client";

import { createContext, useContext, useEffect, useReducer } from "react";

import { MAX_ATTEMPTS_TO_REGISTER, MAX_TIME_FOR_RETRY_REGISTER_IN_MS } from "@/utils/constants";

const TYPE_ACTIONS = {
  UPDATE: "UPDATE",
  ATTEMPS: "ATTEMPS",
  BUTTON_BLOQUED: "BUTTON_BLOQUED",
  RESTART_ATTEMPS: "RESTART_ATTEMPS",
} as const;

type PasswordValidContext = {
  isPasswordValid: boolean;
  attempsToRegister: number;
  isButtonBloqued: boolean;
  updateIsPasswordValid: (newState: boolean) => void;
  addAttempToRegister: () => void;
  updateButtonBloqued: () => void;
};

type State = {
  isPasswordValid: boolean;
  attempsToRegister: number;
  isButtonBloqued: boolean;
};

type Action =
  | { type: typeof TYPE_ACTIONS.UPDATE; payload: boolean }
  | { type: typeof TYPE_ACTIONS.ATTEMPS }
  | { type: typeof TYPE_ACTIONS.BUTTON_BLOQUED }
  | { type: typeof TYPE_ACTIONS.RESTART_ATTEMPS };

function passwordValidationReducer(state: State, action: Action) {
  switch (action.type) {
    case TYPE_ACTIONS.UPDATE:
      return {
        ...state,
        isPasswordValid: action.payload,
      };

    case TYPE_ACTIONS.ATTEMPS:
      return {
        ...state,
        attempsToRegister: state.attempsToRegister++,
      };
    case TYPE_ACTIONS.BUTTON_BLOQUED:
      return {
        ...state,
        isButtonBloqued: !state.isButtonBloqued,
      };

    case TYPE_ACTIONS.RESTART_ATTEMPS:
      return {
        ...state,
        attempsToRegister: 0,
      };

    default:
      return state;
  }
}
export const PasswordValidContext = createContext({} as PasswordValidContext);

const INITIAL_STATE: State = {
  isPasswordValid: false,
  attempsToRegister: 0,
  isButtonBloqued: false,
};

function PasswordValidProvider({
  children,
}: {
  children: React.ReactElement | React.ReactElement[];
}) {
  const [state, dispatch] = useReducer(passwordValidationReducer, INITIAL_STATE);

  useEffect(() => {
    if (state.attempsToRegister >= MAX_ATTEMPTS_TO_REGISTER) {
      setTimeout(() => {
        dispatch({ type: TYPE_ACTIONS.RESTART_ATTEMPS });
        dispatch({ type: TYPE_ACTIONS.BUTTON_BLOQUED });
      }, MAX_TIME_FOR_RETRY_REGISTER_IN_MS);
    }
  }, [state.attempsToRegister]);

  function updateIsPasswordValid(newState: boolean) {
    dispatch({ type: TYPE_ACTIONS.UPDATE, payload: newState });
  }

  function addAttempToRegister() {
    dispatch({ type: TYPE_ACTIONS.ATTEMPS });
  }

  function updateButtonBloqued() {
    dispatch({ type: TYPE_ACTIONS.BUTTON_BLOQUED });
  }

  return (
    <>
      <PasswordValidContext.Provider
        value={{ ...state, updateIsPasswordValid, addAttempToRegister, updateButtonBloqued }}
      >
        {children}
      </PasswordValidContext.Provider>
    </>
  );
}

export function usePasswordValid() {
  const { ...rest } = useContext(PasswordValidContext);

  return {
    ...rest,
  };
}

export default PasswordValidProvider;
