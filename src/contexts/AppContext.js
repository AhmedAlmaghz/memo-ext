import React, { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';

const AppContext = createContext();

const initialState = {
  isLoading: false,
  error: null,
  settings: {
    theme: 'light',
    language: 'ar',
    vectorStore: 'qdrant',
    embeddingProvider: 'openai',
    autoSync: true,
    notifications: true
  },
  ui: {
    sidebarOpen: false,
    modalOpen: false,
    currentModal: null
  }
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_SETTINGS':
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload }
      };
    case 'UPDATE_UI':
      return {
        ...state,
        ui: { ...state.ui, ...action.payload }
      };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}; 