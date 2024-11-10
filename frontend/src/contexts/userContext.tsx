import {
  Accessor,
  createContext,
  createSignal,
  onMount,
  ParentProps,
  useContext,
} from "solid-js";
import { Notification, School, UserData } from "~/lib/models";
import { makeRequest } from "~/lib/api";
import { useNavigate } from "~/router";
import { useLocation } from "@solidjs/router";
import { toast } from "solid-sonner";

const UserContext = createContext<Accessor<UserData | undefined>>();
const NotificationContext = createContext<Accessor<Notification[]>>();
const SchoolContext = createContext<Accessor<School | undefined>>();
const RefetchContext = createContext<() => Promise<void>>();

export const UserProvider = (props: ParentProps) => {
  const [user, setUser] = createSignal<UserData>();
  const [notifications, setNotifications] = createSignal<Notification[]>([]);
  const [school, setSchool] = createSignal<School>();
  const navigate = useNavigate();
  const loc = useLocation();

  const fetchData = async () => {
    const res = await makeRequest<{
      status: string;
      error: string;
      user_data: UserData;
      notifications: Notification[];
      school?: School;
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
    setSchool(res.data?.school);
    localStorage.setItem("shouldBeLoggedIn", "true");
  };

  onMount(() => {
    fetchData();
  });

  return (
    <UserContext.Provider value={user}>
      <NotificationContext.Provider value={notifications}>
        <SchoolContext.Provider value={school}>
          <RefetchContext.Provider value={fetchData}>
            {props.children}
          </RefetchContext.Provider>
        </SchoolContext.Provider>
      </NotificationContext.Provider>
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext)!;
export const useNotifications = () => useContext(NotificationContext)!;
export const useSchool = () => useContext(SchoolContext)!;
export const useRefetch = () => useContext(RefetchContext)!;
