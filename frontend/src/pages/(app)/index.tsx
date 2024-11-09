import { Component } from "solid-js";
import { useUser } from "~/contexts/userContext";

const Home: Component<{}> = () => {
  const user = useUser()!;

  return (
    <div class="flex h-full w-full flex-col items-center justify-center gap-6 text-3xl">
      Üdv, {user()?.display_name}
    </div>
  );
};

export default Home;
