import { ImSpinner2 } from "solid-icons/im";
import { Component } from "solid-js";
import { cn } from "~/lib/utils";

export const Spinner: Component<{ class?: string; size?: number }> = (
  props,
) => {
  return (
    <div class={cn("flex items-center justify-center", props.class)}>
      <ImSpinner2 size={props.size ?? 20} class="animate-spin" />
    </div>
  );
};
