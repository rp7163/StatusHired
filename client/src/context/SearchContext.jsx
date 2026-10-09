import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext(undefined);

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [defaultNewAppStage, setDefaultNewAppStage] = useState('saved');

  const openNewAppModal = (stage = 'saved') => {
    setDefaultNewAppStage(stage);
    setIsNewAppModalOpen(true);
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        openNewAppModal,
        isNewAppModalOpen,
        setIsNewAppModalOpen,
        defaultNewAppStage,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
