import { Component } from "solid-js";
import { useMe } from "~/contexts/userContext";

const Home: Component<{}> = () => {
  const [me] = useMe();

  return (
    <div class="flex h-full w-full flex-col items-center justify-center gap-6 text-3xl">
      Üdv, {me()?.user_data?.display_name}
    </div>
  );
};

export default Home;
