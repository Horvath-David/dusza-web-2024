import { useLocation } from "@solidjs/router";
import { Component, createSignal, Show } from "solid-js";
import { toast } from "solid-sonner";
import { Branding } from "~/components/Branding";
import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/ui/button";
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
} from "~/components/ui/text-field";
import { makeRequest } from "~/lib/api";
import { UserData } from "~/lib/models";
import { useNavigate } from "~/router";

export const Login: Component<{}> = () => {
  const navigate = useNavigate();
  const loc = useLocation();

  const [loading, setLoading] = createSignal(false);
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await makeRequest<{
      status: string;
      user_data: UserData;
    }>({
      endpoint: "/auth/login",
      method: "POST",
      body: {
        username: username(),
        password: password(),
      },
    });

    if (res.ok) {
      toast.success("Sikeres bejelentkezés!");
      window.location.pathname =
        (loc.state as { redirect_path?: string })?.redirect_path ?? "/"; //TODO: instead set user context
    } else {
      console.log(res);
    }

    setLoading(false);
  };

  return (
    <form
      class="flex flex-col items-center gap-4 rounded-2xl"
      onSubmit={handleSubmit}
    >
      <div class="mx-auto mb-4 flex w-fit items-center gap-3 rounded-xl bg-white/5 p-4">
        <Branding />
        <div aria-hidden="true" class="h-8 w-[1px] bg-border"></div>
        <h1 class="text-center font-bold uppercase leading-none [letter-spacing:1.5px]">
          Bejelentkezés
        </h1>
      </div>

      <TextField required onChange={(val) => setUsername(val)}>
        <TextFieldLabel for="username">Felhasználónév</TextFieldLabel>
        <TextFieldInput
          value={username()}
          type="text"
          id="username"
          placeholder="Kovács Lajos"
        />
      </TextField>

      <TextField required onChange={(val) => setPassword(val)}>
        <TextFieldLabel for="password">Felhasználónév</TextFieldLabel>
        <TextFieldInput
          value={password()}
          type="password"
          id="password"
          placeholder="Jelszó..."
        />
      </TextField>

      <Button
        type="submit"
        variant="default"
        disabled={loading()}
        class="w-full max-w-xs"
      >
        <Show when={loading()}>
          <Spinner />
        </Show>
        Bejelentkezés
      </Button>

      <Button
        variant="link"
        class="w-full max-w-xs"
        onClick={() => navigate("/auth/register")}
      >
        Még nincs fiókod? Regisztráció
      </Button>
    </form>
  );
};

export default Login;
