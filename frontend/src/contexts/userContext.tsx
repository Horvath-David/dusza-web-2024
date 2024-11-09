import {
  Accessor,
  createContext,
  createSignal,
  onMount,
  ParentProps,
  useContext,
} from "solid-js";
import { Notification, UserData } from "~/lib/models";
import { makeRequest } from "~/lib/api";
import { useNavigate } from "~/router";
import { useLocation } from "@solidjs/router";
import { toast } from "solid-sonner";

const UserContext = createContext<Accessor<UserData | undefined>>();
const NotificationContext = createContext<Accessor<Notification[]>>();

export const UserProvider = (props: ParentProps) => {
  const [user, setUser] = createSignal<UserData>();
  const [notifications, setNotifications] = createSignal<Notification[]>([]);
  const navigate = useNavigate();
  const loc = useLocation();

  onMount(async () => {
    const res = await makeRequest<{
      status: string;
      error: string;
      user_data: UserData;
      notifications: Notification[];
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
    setNotifications(res.data?.notifications ?? []);
    localStorage.setItem("shouldBeLoggedIn", "true");
  });

  return (
    <UserContext.Provider value={user}>
      <NotificationContext.Provider value={notifications}>
        {props.children}
      </NotificationContext.Provider>
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
export const useNotifications = () => useContext(NotificationContext);
