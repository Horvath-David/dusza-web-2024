import { Component, createEffect, createSignal, onMount, Show } from "solid-js";
import {
  TextField,
  TextFieldLabel,
  TextFieldInput,
} from "~/components/ui/text-field.tsx";
import { FaSolidFloppyDisk } from "solid-icons/fa";
import { makeRequest } from "~/lib/api";
import { Button } from "~/components/ui/button";
import { toast } from "solid-sonner";
import { Spinner } from "~/components/Spinner";
import { TbClockBolt } from "solid-icons/tb";

const Categories: Component<{}> = () => {
  const [deadline, setDeadline] = createSignal("");

  const [loading, setLoading] = createSignal(false);
  const [saving, setSaving] = createSignal(false);

  createEffect(() => console.log(deadline()));

  onMount(async () => {
    setLoading(true);
    const deadlineRes = await makeRequest<{
      status: string;
      error?: string;
      deadline_date?: string;
    }>({
      endpoint: "/config/deadline/get",
      method: "GET",
    });
    setDeadline(deadlineRes.data?.deadline_date ?? "");
    setLoading(false);
  });

  const handleSaveDeadline = async (event: SubmitEvent) => {
    event.preventDefault();

    setSaving(true);
    const res = await makeRequest({
      endpoint: "/config/deadline/set",
      method: "POST",
      body: {
        deadline_date: deadline(),
      },
    });
    if (res.ok) {
      toast.success("Sikeres mentés!");
    }
    setSaving(false);
  };

  return (
    <div class="mx-auto flex max-w-[22.5rem] flex-col items-center gap-4">
      <h1 class="my-8 text-2xl font-semibold">Konfiguráció</h1>

      <Show when={!loading()} fallback={<Spinner class="mt-4" />}>
        <form onSubmit={handleSaveDeadline} class="flex w-full items-end gap-4">
          <TextField onChange={setDeadline} value={deadline()} required>
            <TextFieldLabel>Regisztráció határideje:</TextFieldLabel>
            <TextFieldInput
              type="datetime-local"
              min={new Date()
                .toISOString()
                .slice(0, new Date().toISOString().lastIndexOf(":"))}
            />
          </TextField>
          <Button type="submit" disabled={saving()}>
            <Show when={!saving()} fallback={<Spinner />}>
              <FaSolidFloppyDisk />
            </Show>
            Mentés
          </Button>
        </form>
        <Button
          type="submit"
          variant="destructive"
          class="w-full"
          disabled={saving()}
          onClick={(e: any) => {
            setDeadline(
              new Date()
                .toISOString()
                .slice(0, new Date().toISOString().lastIndexOf(":")),
            );
            handleSaveDeadline(e);
          }}
        >
          <Show when={!saving()} fallback={<Spinner />}>
            <TbClockBolt size={18} />
          </Show>
          Azonnali lezárás
        </Button>
      </Show>
    </div>
  );
};

export default Categories;
