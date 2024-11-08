import { Component, ParentProps } from "solid-js";
import { Toaster } from "solid-sonner";

const RootLayout: Component<{}> = (props: ParentProps) => {
  return (
    <>
      <Toaster richColors={true} theme="dark" />
      {props.children}
    </>
  );
};

export default RootLayout;
