import { Component, createSignal, Show } from "solid-js";
import { toast } from "solid-sonner";
import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/ui/button";
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
} from "~/components/ui/text-field";
import { makeRequest } from "~/lib/api";
import { UserData } from "~/lib/models";
import { setCurrentUser } from "~/lib/signals";
import { useNavigate } from "~/router";

export const Login: Component<{}> = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = createSignal(false);
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");

  const handleSubmit = async () => {
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
      setCurrentUser(res.data?.user_data);
      navigate("/");
    } else {
      console.log(res);
    }

    setLoading(false);
  };

  return (
    <>
      <h1 class="mb-4 text-2xl font-semibold">DuszaPanel - Bejelentkezés</h1>

      <TextField onChange={(val) => setUsername(val)}>
        <TextFieldLabel for="username">Felhasználónév</TextFieldLabel>
        <TextFieldInput
          value={username()}
          type="text"
          id="username"
          placeholder="Kovács Lajos"
        />
      </TextField>

      <TextField onChange={(val) => setPassword(val)}>
        <TextFieldLabel for="password">Felhasználónév</TextFieldLabel>
        <TextFieldInput
          value={password()}
          type="password"
          id="password"
          placeholder="Jelszó..."
        />
      </TextField>

      <Button
        variant="default"
        disabled={loading()}
        class="w-full max-w-xs"
        onClick={handleSubmit}
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
    </>
  );
};

export default Login;
