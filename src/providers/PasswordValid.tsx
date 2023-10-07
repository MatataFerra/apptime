"use client";

import { createContext, useContext, useReducer } from "react";

type PasswordValidContext = {
  isPasswordValid: boolean;
  updateIsPasswordValid: (newState: boolean) => void;
};

type State = {
  isPasswordValid: boolean;
};

type Action = { type: "UPDATE"; payload: boolean };

function passwordValidationReducer(state: State, action: Action) {
  switch (action.type) {
    case "UPDATE":
      return {
        ...state,
        isPasswordValid: action.payload,
      };

    default:
      return state;
  }
}
export const PasswordValidContext = createContext({} as PasswordValidContext);

const INITIAL_STATE = {
  isPasswordValid: false,
};

function PasswordValidProvider({ children }: { children: React.ReactElement[] }) {
  const [state, dispatch] = useReducer(passwordValidationReducer, INITIAL_STATE);

  function updateIsPasswordValid(newState: boolean) {
    dispatch({ type: "UPDATE", payload: newState });
  }

  return (
    <>
      <PasswordValidContext.Provider value={{ ...state, updateIsPasswordValid }}>
        {children}
      </PasswordValidContext.Provider>
    </>
  );
}

export function usePasswordValid() {
  const { isPasswordValid, updateIsPasswordValid } = useContext(PasswordValidContext);

  return {
    isPasswordValid,
    updateIsPasswordValid,
  };
}

export default PasswordValidProvider;
