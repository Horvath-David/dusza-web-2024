import { Component } from "solid-js";

export const Branding: Component<{}> = () => {
  return (
    <div class="flex items-center justify-center gap-2">
      <div class="aspect-square rounded-lg bg-gradient-to-tr from-purple-700 to-cyan-400 p-1 text-sm font-black">
        DP
      </div>
      <div class="font-bold uppercase leading-none [letter-spacing:1.5px]">
        DuszaPanel
      </div>
    </div>
  );
};
