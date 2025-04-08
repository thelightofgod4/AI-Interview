"use client";

import { ResponseService } from "@/services/responses.service";
import React, { useContext } from "react";

interface Response {
  createResponse: (payload: any) => void;
  saveResponse: (payload: any, call_id: string) => void;
}

export const ResponseContext = React.createContext<Response>({
  createResponse: () => {},
  saveResponse: () => {},
});

interface ResponseProviderProps {
  children: React.ReactNode;
}

export function ResponseProvider({ children }: ResponseProviderProps) {
  const createResponse = async (payload: any) => {
    const data = await ResponseService.createResponse({ ...payload });

    return data;
  };

  const saveResponse = async (payload: any, call_id: string) => {
    await ResponseService.saveResponse({ ...payload }, call_id);
  };

  return (
    <ResponseContext.Provider
      value={{
        createResponse,
        saveResponse,
      }}
    >
      {children}
    </ResponseContext.Provider>
  );
}

export const useResponses = () => {
  const value = useContext(ResponseContext);

  return value;
};
