import { Component, ParentProps } from "solid-js";

const AuthLayout: Component<{}> = (props: ParentProps) => {
  return (
    <div class="flex h-screen w-full flex-col items-center justify-center gap-4">
      {props.children}
    </div>
  );
};

export default AuthLayout;
