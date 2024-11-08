import { Component, onMount, ParentProps } from "solid-js";
import { currentUser } from "~/lib/signals";
import { useNavigate } from "~/router";

const AuthLayout: Component<{}> = (props: ParentProps) => {
  const navigate = useNavigate();
  onMount(() => {
    if (currentUser()) navigate("/");
  });

  return (
    <div class="flex h-screen w-full flex-col items-center justify-center gap-4">
      {props.children}
    </div>
  );
};

export default AuthLayout;
