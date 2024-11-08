import { createSignal } from "solid-js";
import { UserData } from "./models";

export const [currentUser, setCurrentUser] = createSignal<UserData | undefined>(
  undefined,
);
