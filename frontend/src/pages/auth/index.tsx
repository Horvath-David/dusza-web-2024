import { Component, onMount } from "solid-js";
import { useNavigate } from "~/router";

const index: Component<{}> = () => {
  const navigate = useNavigate();
  onMount(() => {
    navigate("/auth/login");
  });

  return <></>;
};

export default index;
