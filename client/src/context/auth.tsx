import axios from 'axios';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
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
  type: AuthActionType;
  payload?: any;
}

export enum AuthActionType {
  LOGIN,
  LOGOUT,
  STOP_LOADING,
}

const reducer = (state: AuthState, { type, payload }: Action) => {
  switch (type) {
    case AuthActionType.LOGIN:
      return {
        ...state,
        authenticated: true,
        user: payload,
      };
    case AuthActionType.LOGOUT:
      return {
        ...state,
        authenticated: false,
        user: null,
      };
    case AuthActionType.STOP_LOADING:
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

  const dispatch = (type: AuthActionType, payload?: any) => {
    defaultDispatch({ type, payload });
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await axios.get('/auth/me');
        dispatch(AuthActionType.LOGIN, res.data);
      } catch (e) {
        console.error(e);
      } finally {
        dispatch(AuthActionType.STOP_LOADING);
      }
    };

    loadUser();
  }, []);

  return (
    <DispatchContext.Provider value={dispatch}>
      <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
    </DispatchContext.Provider>
  );
};

export const useAuthState = () => useContext(AuthContext);
export const useAuthDispatch = () => useContext(DispatchContext);
