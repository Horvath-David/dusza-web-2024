import { Component, createSignal, For, Show } from "solid-js";
import { Button } from "./ui/button";
import { FiLogOut } from "solid-icons/fi";
import { cn } from "~/lib/utils";
import { Spinner } from "./Spinner";
import { makeRequest } from "~/lib/api";
import { toast } from "solid-sonner";
import { useMe } from "~/contexts/userContext";
import { Path, useNavigate } from "~/router";
import { routes } from "@generouted/solid-router";
import {
  FaSolidHouse,
  FaSolidPen,
  FaSolidPlus,
  FaSolidQuestion,
} from "solid-icons/fa";
import { IconTypes } from "solid-icons";
import { FaRegularFileCode } from "solid-icons/fa";
import { FaSolidSchoolFlag } from "solid-icons/fa";
import { BiRegularCategoryAlt } from "solid-icons/bi";
import { AiOutlineTeam } from "solid-icons/ai";
import { AiOutlineLineChart } from "solid-icons/ai";
import { useLocation } from "@solidjs/router";
import { Branding } from "./Branding";
import { TbSettings } from "solid-icons/tb";

interface RouteData {
  title?: string;
  icon?: IconTypes;
  order?: number;
  path?: string;
  showWhen?: (data: RouteData) => boolean;
}

function getRouteData(path: string): RouteData {
  switch (path) {
    case "/new-team":
      return {
        title: "Csapat hozzáadása",
        icon: FaSolidPlus,
        showWhen: () => {
          const [me] = useMe();
          return !me()?.user_data?.team_id;
        },
        order: 1,
      };
    case "/edit-team":
      return {
        title: "Csapat szerkesztése",
        icon: FaSolidPen,
        showWhen: () => {
          const [me] = useMe();
          return !!me()?.user_data?.team_id;
        },
        order: 1,
      };

    case "/languages":
      return {
        title: "Programozási nyelvek",
        icon: FaRegularFileCode,
        order: 1,
      };
    case "/categories":
      return {
        title: "Kategóriák",
        icon: BiRegularCategoryAlt,
        order: 2,
      };
    case "/schools":
      return {
        title: "Intézmények",
        icon: FaSolidSchoolFlag,
        order: 3,
      };
    case "/teams":
      return {
        title: "Csapatok",
        icon: AiOutlineTeam,
        order: 4,
      };
    case "/configuration":
      return {
        title: "Konfiguráció",
        icon: TbSettings,
        order: 5,
      };

    case "/statistics":
      return {
        title: "Statisztikák",
        icon: AiOutlineLineChart,
        order: 6,
      };

    case "/school-teams":
      return {
        title: "Csapatok",
        icon: AiOutlineTeam,
        order: 2,
      };
    case "/edit-school-info":
      return {
        title: "Adatok módosítása",
        icon: FaSolidPen,
        order: 1,
      };

    default:
      return {
        title: path,
        order: 999,
      };
  }
}

interface PathRoute {
  path: string;
  children?: PathRoute | PathRoute[] | undefined;
}

function flattenPaths(objects: PathRoute[]): string[] {
  const result: string[] = [];

  function traverse(obj: PathRoute, currentPath: string) {
    const fullPath = `${currentPath}${obj.path}`;

    if (!obj.children) {
      result.push(fullPath);
    }

    if (obj.children) {
      if (Array.isArray(obj.children)) {
        for (const child of obj.children) {
          traverse(child, fullPath);
        }
      } else {
        traverse(obj.children, fullPath);
      }
    }
  }

  for (const obj of objects) {
    traverse(obj, "/");
  }

  return result;
}

export const Sidebar: Component<{}> = () => {
  const [me] = useMe();
  const navigate = useNavigate();
  const loc = useLocation();
  const [loading, setLoading] = createSignal(false);

  const handleLogout = async () => {
    setLoading(true);
    const res = await makeRequest({
      endpoint: "/auth/logout",
      method: "GET",
    });
    if (res.ok) {
      toast.success("Sikeres kijelentkezés!");
      localStorage.setItem("shouldBeLoggedIn", "false");
      navigate("/auth/login");
      //TODO: set user context to undefined
    }
    setLoading(true);
  };

  const rootRoute = routes[0];
  const appLayout =
    rootRoute.children instanceof Array
      ? rootRoute.children.find(
          (x: any) => (x.id as string) === "(app)/_layout",
        )
      : rootRoute.children;
  const roleRoutes =
    appLayout?.children instanceof Array
      ? appLayout.children.filter((x: any) =>
          (x.id as string).startsWith("(app)/(role_"),
        )
      : [];

  return (
    <div class="flex h-full flex-col gap-4 p-4">
      <Branding />

      <Hr padding="1rem" />

      {/* Home nav item */}
      <Button
        variant={loc.pathname === "/" ? "sidebarPrimary" : "sidebarSecondary"}
        class="justify-start gap-4"
        onClick={() => navigate("/")}
      >
        <FaSolidHouse />
        Kezdőlap
      </Button>

      <Hr padding="1rem" />

      {/* Auto nav items */}
      <For each={roleRoutes}>
        {(roleRoute) => {
          const role = ((roleRoute as any).id as string)
            .replace("(app)/(role_", "")
            .split(")")[0];
          const roleChildren =
            roleRoute.children instanceof Array
              ? roleRoute.children
              : [roleRoute.children];
          const links = flattenPaths(roleChildren as PathRoute[]);

          return (
            <Show when={me()?.user_data?.role === role}>
              <For
                each={links
                  .map((x) => ({ ...getRouteData(x), path: x }))
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))}
              >
                {(linkData) => (
                  <Show
                    when={
                      linkData.showWhen ? linkData.showWhen(linkData) : true
                    }
                  >
                    <Button
                      variant={
                        loc.pathname === linkData.path
                          ? "sidebarPrimary"
                          : "sidebarLink"
                      }
                      onClick={() => navigate(linkData.path as Path)}
                    >
                      {(linkData.icon ?? FaSolidQuestion)({})}
                      {linkData.title}
                    </Button>
                  </Show>
                )}
              </For>
            </Show>
          );
        }}
      </For>

      <Hr padding="1rem" class="mt-auto" />

      {/* Bottom user part */}
      <div class="flex gap-4">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-700 to-cyan-400 text-xl font-black">
          {me()?.user_data?.display_name?.at(0)?.toUpperCase() ?? "U"}
        </div>
        <div class="flex flex-col justify-between">
          <div class="font-semibold leading-none">
            {me()?.user_data?.display_name}
          </div>
          <div class="text-sm font-semibold leading-none text-neutral-400">
            {
              {
                contestant: "versenyző/felk. tanár",
                organizer: "szervező",
                school: "iskolai kapcsolattartó",
              }[me()?.user_data?.role ?? ""]
            }
          </div>
        </div>
      </div>
      <Button variant="outline" disabled={loading()} onClick={handleLogout}>
        <Show when={!loading()} fallback={<Spinner size={16} />}>
          <FiLogOut />
        </Show>
        Kijelentkezés
      </Button>
    </div>
  );
};

export const Hr: Component<{ padding: string; class?: string }> = (props) => {
  return (
    <div
      style={{
        width: `calc(100%+2*${props.padding})`,
        height: "1px",
        "margin-left": "-" + props.padding,
        "margin-right": "-" + props.padding,
      }}
      class={cn("bg-border", props.class)}
      aria-hidden="true"
    ></div>
  );
};
