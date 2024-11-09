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
import { toast } from "solid-sonner";

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
      endpoint: "/me/",
      noErrorToast: true,
    });

    const shouldBeLoggedIn = localStorage.getItem("shouldBeLoggedIn") == "true";
    if (!res.ok) {
      if (loc.pathname.startsWith("/auth")) return;
      if (shouldBeLoggedIn) toast.error("Nincs bejelentkezve!");
      navigate("/auth/login", {
        state: {
          redirect_path: loc.pathname,
        },
      });
      return;
    }
    setUser(res.data?.user_data);
    localStorage.setItem("shouldBeLoggedIn", "true");
  });

  return (
    <UserContext.Provider value={user}>{props.children}</UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
