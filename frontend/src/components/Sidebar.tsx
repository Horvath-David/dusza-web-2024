import { Component } from "solid-js";
import { Button } from "./ui/button";
import { FiLogOut } from "solid-icons/fi";
import { cn } from "~/lib/utils";

export const Sidebar: Component<{}> = () => {
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
        
      </div>
      <Button variant="outline">
        <FiLogOut />
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
