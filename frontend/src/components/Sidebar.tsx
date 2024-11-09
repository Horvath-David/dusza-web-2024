import { Component, createSignal, Show } from "solid-js";
import { Button } from "./ui/button";
import { FiLogOut } from "solid-icons/fi";
import { cn } from "~/lib/utils";
import { Spinner } from "./Spinner";
import { makeRequest } from "~/lib/api";
import { toast } from "solid-sonner";
import { useUser } from "~/lib/userContext";
import { useNavigate } from "~/router";

export const Sidebar: Component<{}> = () => {
  const user = useUser()!;
  const navigate = useNavigate();
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

  return (
    <div class="flex h-full flex-col gap-4 p-4">
      {/* Branding */}
      <div class="flex justify-center gap-2">
        <div class="aspect-square rounded-lg bg-gradient-to-tr from-purple-700 to-cyan-400 p-1 text-sm font-black">
          DP
        </div>
        <div class="font-bold uppercase [letter-spacing:1.5px]">DuszaPanel</div>
      </div>

      <Hr padding="1rem" />

      <Hr padding="1rem" class="mt-auto" />

      {/* Bottom user part */}
      <div class="flex gap-4">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-700 to-cyan-400 text-xl font-black">
          {user()?.display_name?.at(0)?.toUpperCase() ?? "U"}
        </div>
        <div class="flex flex-col justify-between">
          <div class="font-semibold leading-none">{user()?.display_name}</div>
          <div class="text-sm font-semibold leading-none text-neutral-400">
            {
              {
                contestant: "versenyző",
                organizer: "szervező",
                school: "iskolai kapcsolattartó",
              }[user()?.role ?? ""]
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

const Hr: Component<{ padding: string; class?: string }> = (props) => {
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
