import { Component, createSignal, onMount, ParentProps, Show } from "solid-js";
import { toast } from "solid-sonner";
import { useMe } from "~/contexts/userContext";
import { useNavigate } from "~/router";

const _layout: Component<{}> = (props: ParentProps) => {
  const navigate = useNavigate();
  const [me] = useMe();
  const [allowed, setAllowed] = createSignal(false);

  onMount(() => {
    if (me()?.user_data?.role !== "contestant") {
      toast.error("Nincs jogod ehhez!");
      navigate("/");
    } else {
      setAllowed(true);
    }
  });
  return <Show when={allowed()}>{props.children}</Show>;
};

export default _layout;
