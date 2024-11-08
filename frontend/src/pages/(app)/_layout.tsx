import { Component, createEffect, ParentProps, Show } from "solid-js";
import { Spinner } from "~/components/Spinner";
import { useUser } from "~/lib/userContext";
import { cn } from "~/lib/utils";

const AppLayout: Component<{}> = (props: ParentProps) => {
  const user = useUser()!;
  createEffect(() => console.log("app layout user:", user()));

  return (
    <div class="relative h-screen w-screen">
      <Show when={user()}>
        <div class="flex h-full w-full">
          <aside class="basis-64 border-r bg-black">
            <Sidebar />
          </aside>
          <main class="max-h-screen flex-1 overflow-y-scroll p-6">
            {props.children}
          </main>
        </div>
      </Show>

      <Spinner
        class={cn(
          "absolute inset-0 h-full w-full bg-background opacity-100 transition-opacity duration-300",
          user() && "pointer-events-none opacity-0",
        )}
        size={32}
      />
    </div>
  );
};

export default AppLayout;

const Sidebar: Component<{}> = () => {
  return (
    <div class="flex flex-col gap-4 p-4">
      <div class="flex justify-center gap-2">
        <div class="aspect-square rounded-lg bg-gradient-to-tr from-purple-700 to-cyan-400 p-1 text-sm font-black">
          DP
        </div>
        <div class="font-bold uppercase [letter-spacing:1.5px]">DuszaPanel</div>
      </div>
      <Hr padding="1rem" />
    </div>
  );
};

const Hr: Component<{ padding: string }> = (props: { padding: string }) => {
  return (
    <div
      style={{
        width: `calc(100%+2*${props.padding})`,
        height: "1px",
        "margin-left": "-" + props.padding,
        "margin-right": "-" + props.padding,
      }}
      class="bg-border"
      aria-hidden="true"
    ></div>
  );
};
