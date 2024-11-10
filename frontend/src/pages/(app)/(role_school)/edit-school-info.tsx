import { Component, createEffect, createSignal, onMount, Show } from "solid-js"
import { useRefetch, useSchool, useUser } from "~/contexts/userContext";
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

const SchoolInfo: Component<{}> = () => {

    const [newDisplayName, setNewDisplayName] = createSignal("")
    const [newUsername, setNewUsername] = createSignal("")
    const [newSchoolName, setNewSchoolName] = createSignal("")
    const [newSchoolAddress, setNewSchoolAddress] = createSignal("");
    const [saving, setSaving] = createSignal(false);

    const user = useUser()!;
    const school = useSchool()!;
    const refetch = useRefetch()!;

    onMount(()=>{
        setNewDisplayName(user()?.display_name ?? "")
        setNewUsername(user()?.username ?? "")
        setNewSchoolName(school()?.name ?? "")
        setNewSchoolAddress(school()?.address ?? "")
        
    })

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault();

        setSaving(true)

        const res = await makeRequest({
            endpoint: `/school/${school()?.id}/manage`,
            method: "PATCH",
            body: {
                username: newUsername(),
                school_name:newSchoolName(),
                address: newSchoolAddress(),
                display_name: newDisplayName(),
            }
          });
      
          if (res.ok) {
            toast.success("Sikeres mentés!");
            refetch();
          }
      
          setSaving(false);
    }

    // createEffect(()=>{
    //     setNewSchoolName(school()!.name);
    //     setNewSchoolAddress(school()!.adress);
    // })

    return (
        <form onSubmit={handleSubmit}>
            <div class="mx-auto flex max-w-sm flex-col items-center gap-4">
            <h1 class="my-8 text-2xl font-semibold">Adatok módosítása</h1>
          
            <Show when={school()} fallback={<Spinner></Spinner>}>
            <TextField
            class="max-w-full"
            value={newSchoolName()}
            onChange={setNewSchoolName}
            required
            >
            <TextFieldLabel>Iskola neve:</TextFieldLabel>
            <TextFieldInput type="text"></TextFieldInput>
            </TextField>
            <TextField
            class="max-w-full"
            value={newSchoolAddress()}
            onChange={setNewSchoolAddress}
            required
            >
            <TextFieldLabel>Iskola címe:</TextFieldLabel>
            <TextFieldInput type="text"></TextFieldInput>
            </TextField>
            <TextField
            class="max-w-full"
            value={newUsername()}
            onChange={setNewUsername}
            required
            >
            <TextFieldLabel>Iskola felhasználó neve:</TextFieldLabel>
            <TextFieldInput type="text"></TextFieldInput>
            </TextField>
            <TextField
            class="max-w-full"
            value={newDisplayName()}
            onChange={setNewDisplayName}
            required
            >
            <TextFieldLabel>Kapcsolat tartó neve:</TextFieldLabel>
            <TextFieldInput type="text"></TextFieldInput>
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
}

export default SchoolInfo;

function until(arg0: (_: any) => import("../../../lib/models").School | undefined) {
    throw new Error("Function not implemented.");
}
