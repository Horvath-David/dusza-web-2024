import {
  Accessor,
  createContext,
  createSignal,
  onMount,
  ParentProps,
  useContext,
} from "solid-js";
import { UserData } from "./models";
import { makeRequest } from "./api";
import { useNavigate } from "~/router";
import { useLocation } from "@solidjs/router";

const UserContext = createContext<Accessor<UserData | undefined>>();

export const UserProvider = (props: ParentProps) => {
  const [user, setUser] = createSignal<UserData>();
  const navigate = useNavigate();
  const loc = useLocation();

  onMount(async () => {
    const res = await makeRequest<{
      status: string;
      error: string;
      user_data: UserData;
    }>({
      endpoint: "/me",
    });
    if (!res.ok && !loc.pathname.startsWith("/auth")) {
      navigate("/auth/login");
      return;
    }
    setUser(res.data?.user_data);
  });

  return (
    <UserContext.Provider value={user}>{props.children}</UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
