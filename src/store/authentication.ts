import type { IAuthenticatedUser } from "@src/types";
import { writable } from "svelte/store";

// Create authenticated user store
function createAuthenticatedUser() {
  const { subscribe, set } = writable<IAuthenticatedUser | null>(null);

  return {
    subscribe,
    authenticate: (user: IAuthenticatedUser) => set(user),
    logout: () => set(null),
  };
}

export const authenticatedUser = createAuthenticatedUser();
