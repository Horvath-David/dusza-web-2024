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

export interface Me {
  user_data: UserData;
  notifications: Notification[];
  school?: School;
}

export type MeContextType = [
  Accessor<Me | undefined>,
  {
    refetch: () => Promise<void>;
  },
];

const MeContext = createContext<MeContextType>();

export const UserProvider = (props: ParentProps) => {
  const navigate = useNavigate();
  const loc = useLocation();

  const [me, setMe] = createSignal<Me>(),
    meCtx: MeContextType = [
      me,
      {
        async refetch() {
          console.log("Refetch started");
          const res = await makeRequest({
            endpoint: "/me/",
            noErrorToast: true,
          });
          console.log("Response received:", res);

          const shouldBeLoggedIn =
            localStorage.getItem("shouldBeLoggedIn") === "true";
          if (!res.ok) {
            if (loc.pathname.startsWith("/auth")) return;
            if (shouldBeLoggedIn) toast.error("Nincs bejelentkezve!");

            console.log("Navigating to /auth/login");
            navigate("/auth/login", {
              state: {
                redirect_path: loc.pathname,
              },
            });
            return;
          }

          console.log("Setting user data with res.data:", res.data);
          setMe(res.data);
          localStorage.setItem("shouldBeLoggedIn", "true");
          console.log("Refetch completed");
        },
      },
    ];

  onMount(async () => {
    const res = await makeRequest({
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
    setMe(res.data);
    localStorage.setItem("shouldBeLoggedIn", "true");
  });

  return (
    <MeContext.Provider value={meCtx}>{props.children}</MeContext.Provider>
  );
};

export function useMe(): MeContextType {
  const context = useContext(MeContext);
  if (!context) throw new Error("no me provider");
  return context;
}
