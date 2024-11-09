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

export const Register: Component<{}> = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = createSignal(false);
  const [username, setUsername] = createSignal("");
  const [displayName, setDisplayName] = createSignal("");
  const [password, setPassword] = createSignal("");

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await makeRequest<{
      status: string;
      user_data: UserData;
    }>({
      endpoint: "/auth/register",
      method: "POST",
      body: {
        username: username(),
        display_name: displayName(),
        password: password(),
      },
    });

    if (res.ok) {
      toast.success("Sikeres regisztráció!");
      window.location.pathname = "/"; //TODO: instead set user context
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
          Regisztráció
        </h1>
      </div>

      <TextField required onChange={(val) => setUsername(val)}>
        <TextFieldLabel>Felhasználónév</TextFieldLabel>
        <TextFieldInput
          value={username()}
          type="text"
          placeholder="kovacs.lajos"
        />
      </TextField>

      <TextField required onChange={(val) => setDisplayName(val)}>
        <TextFieldLabel>Teljes név</TextFieldLabel>
        <TextFieldInput
          value={displayName()}
          type="text"
          placeholder="Kovács Lajos"
        />
      </TextField>

      <TextField required onChange={(val) => setPassword(val)}>
        <TextFieldLabel>Jelszó</TextFieldLabel>
        <TextFieldInput
          value={password()}
          type="password"
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
        Regisztráció
      </Button>

      <Button
        variant="link"
        class="w-full max-w-xs"
        onClick={() => navigate("/auth/login")}
      >
        Már van fiókod? Bejelentkezés
      </Button>
    </form>
  );
};

export default Register;
