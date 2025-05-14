"use client";

import React, { useState, useContext, ReactNode, useEffect } from "react";
import { User } from "@/types/user";
import { useClerk, useOrganization } from "@clerk/nextjs";
import { ClientService } from "@/services/clients.service";

interface ClientContextProps {
  client?: User;
}

export const ClientContext = React.createContext<ClientContextProps>({
  client: undefined,
});

interface ClientProviderProps {
  children: ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
  const [client, setClient] = useState<User>();
  const { user } = useClerk();
  const { organization } = useOrganization();
  const [clientLoading, setClientLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || !organization?.id) return;
      
      try {
        setClientLoading(true);
        const [clientResponse, orgResponse] = await Promise.all([
          ClientService.getClientById(
            user.id,
            user.emailAddresses[0]?.emailAddress as string,
            organization.id
          ),
          ClientService.getOrganizationById(
            organization.id,
            organization.name as string
          )
        ]);
        setClient(clientResponse);
      } catch (error) {
        console.error(error);
      } finally {
        setClientLoading(false);
      }
    };

    fetchData();
  }, [user?.id, organization?.id]);

  return (
    <ClientContext.Provider value={{ client }}>
      {children}
    </ClientContext.Provider>
  );
}

export const useClient = () => {
  const value = useContext(ClientContext);

  return value;
};
