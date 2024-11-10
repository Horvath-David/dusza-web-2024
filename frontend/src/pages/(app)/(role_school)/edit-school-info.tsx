import { Component, createSignal, onMount, Show } from "solid-js";
import {
  TextField,
  TextFieldLabel,
  TextFieldInput,
} from "~/components/ui/text-field.tsx";
import { Spinner } from "~/components/Spinner";
import { FaSolidFloppyDisk } from "solid-icons/fa";
import { Button } from "~/components/ui/button";
import { makeRequest } from "~/lib/api";
import { toast } from "solid-sonner";
import { useMe } from "~/contexts/userContext";

const SchoolInfo: Component<{}> = () => {
  const [newDisplayName, setNewDisplayName] = createSignal("");
  const [newUsername, setNewUsername] = createSignal("");
  const [newSchoolName, setNewSchoolName] = createSignal("");
  const [newSchoolAddress, setNewSchoolAddress] = createSignal("");
  const [newEmail, setNewEmail] = createSignal("");
  const [saving, setSaving] = createSignal(false);

  const [me, { refetch }] = useMe();

  onMount(() => {
    setNewDisplayName(me()?.user_data?.display_name ?? "");
    setNewUsername(me()?.user_data?.username ?? "");
    setNewEmail(me()?.user_data?.email ?? "")
    setNewSchoolName(me()?.school?.name ?? "");
    setNewSchoolAddress(me()?.school?.address ?? "");
  });

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    setSaving(true);

    const res = await makeRequest({
      endpoint: `/school/${me()?.school?.id}/manage`,
      method: "PATCH",
      body: {
        username: newUsername(),
        school_name: newSchoolName(),
        address: newSchoolAddress(),
        display_name: newDisplayName(),
        email: newEmail(),
      },
    });


    if (res.ok) {
      toast.success("Sikeres mentés!");
      refetch();
    }

    setSaving(false);
  };

  // createEffect(()=>{
  //     setNewSchoolName(me()?.school!.name);
  //     setNewSchoolAddress(me()?.school!.adress);
  // })

  return (
    <form onSubmit={handleSubmit}>
      <div class="mx-auto flex max-w-sm flex-col items-center gap-4">
        <h1 class="my-8 text-2xl font-semibold">Adatok módosítása</h1>

        <Show when={me()?.school} fallback={<Spinner></Spinner>}>
          <TextField
            class="max-w-full"
            value={newSchoolName()}
            onChange={setNewSchoolName}
            required
          >
            <TextFieldLabel>Intézmény neve:</TextFieldLabel>
            <TextFieldInput type="text"></TextFieldInput>
          </TextField>
          <TextField
            class="max-w-full"
            value={newSchoolAddress()}
            onChange={setNewSchoolAddress}
            required
          >
            <TextFieldLabel>Intézmény címe:</TextFieldLabel>
            <TextFieldInput type="text"></TextFieldInput>
          </TextField>
          <TextField
            class="max-w-full"
            value={newUsername()}
            onChange={setNewUsername}
            required
          >
            <TextFieldLabel>Intézmény felhasználó neve:</TextFieldLabel>
            <TextFieldInput type="text"></TextFieldInput>
          </TextField>
          <TextField
            class="max-w-full"
            value={newDisplayName()}
            onChange={setNewDisplayName}
            required
          >
            <TextFieldLabel>Kapcsolattartó neve:</TextFieldLabel>
            <TextFieldInput type="text"></TextFieldInput>
          </TextField>
          <TextField
            class="max-w-full"
            value={newEmail()}
            onChange={setNewEmail}
            required
          >
            <TextFieldLabel>Kapcsolattartó email címe:</TextFieldLabel>
            <TextFieldInput type="email"></TextFieldInput>
          </TextField>
          <Button class="mb-4 mt-6 w-full" type="submit">
            <Show when={!saving()} fallback={<Spinner />}>
              <FaSolidFloppyDisk />
            </Show>
            Mentés
          </Button>
        </Show>
      </div>
    </form>
  );
};

export default SchoolInfo;
