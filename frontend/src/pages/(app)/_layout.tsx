import { Component, createEffect, ParentProps, Show } from "solid-js";
import { Sidebar } from "~/components/Sidebar";
import { Spinner } from "~/components/Spinner";
import { useMe } from "~/contexts/userContext";
import { cn } from "~/lib/utils";

const AppLayout: Component<{}> = (props: ParentProps) => {
  const [me] = useMe()!;
  createEffect(() => console.log("app layout user:", me()));

  return (
    <div class="relative h-screen w-screen">
      <Show when={me()?.user_data}>
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
          me()?.user_data && "pointer-events-none opacity-0",
        )}
        size={32}
      />
    </div>
  );
};

export default AppLayout;
