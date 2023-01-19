import React, { createContext, useContext, useReducer } from 'react';
import { User } from '../types/auth';

interface AuthState {
  authenticated: boolean;
  user?: User;
  loading: boolean;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const defaultAuthState = {
  authenticated: false,
  user: undefined,
  loading: true,
};

interface Action {
  type: string;
  payload?: any;
}

const reducer = (state: AuthState, { type, payload }: Action) => {
  switch (type) {
    case 'LOGIN':
      return {
        ...state,
        authenticated: true,
        user: payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        authenticated: false,
        user: null,
      };
    case 'STOP_LOADING':
      return {
        ...state,
        loading: false,
      };
    default:
      throw new Error(`Unknown type: ${type}`);
  }
};

const AuthContext = createContext<AuthState>(defaultAuthState);

const DispatchContext = createContext<any>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, defaultDispatch] = useReducer(reducer, defaultAuthState);

  const dispatch = (type: string, payload: any) => {
    defaultDispatch({ type, payload });
  };

  console.log(state);

  return (
    <DispatchContext.Provider value={dispatch}>
      <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
    </DispatchContext.Provider>
  );
};

export const useAuthState = () => useContext(AuthContext);
export const useAuthDispatch = () => useContext(DispatchContext);
