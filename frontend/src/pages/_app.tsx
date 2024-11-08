import { Component, ParentProps } from "solid-js";
import { Toaster } from "solid-sonner";
import { UserProvider } from "~/lib/userContext";

const RootLayout: Component<{}> = (props: ParentProps) => {
  return (
    <>
      <Toaster richColors={true} theme="dark" />
      <UserProvider>{props.children}</UserProvider>
    </>
  );
};

export default RootLayout;
