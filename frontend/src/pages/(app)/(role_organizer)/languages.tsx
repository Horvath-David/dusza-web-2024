import { Component, createSignal, For, onMount, Show } from "solid-js";
import { ProgrammingLanguage } from "~/lib/models";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  TextField,
  TextFieldLabel,
  TextFieldInput,
} from "~/components/ui/text-field.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  FaSolidCheck,
  FaSolidPlus,
  FaSolidTrashCan,
  FaSolidXmark,
} from "solid-icons/fa";
import { makeRequest } from "~/lib/api";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/Spinner";
import { Hr } from "~/components/Sidebar";
import { toast } from "solid-sonner";

async function getAllProgLang() {
  const res = await makeRequest<{
    status: string;
    error?: string;
    list: ProgrammingLanguage[];
  }>({
    endpoint: "/prog_lang/all",
  });
  return res.data?.list ?? [];
}


const ProgrammingLangs: Component<{}> = () => {
  const [newProgLang, setNewProgLang] = createSignal("");
  const [allProgLang, setAllProgLang] = createSignal<ProgrammingLanguage[]>([]);

  const [loading, setLoading] = createSignal(false);
  const [deleting, setDeleting] = createSignal(false);
  const [adding, setAdding] = createSignal(false);

  onMount(async () => {
    setLoading(true);
    setAllProgLang(await getAllProgLang());
    setAllProgLang(allProgLang().sort((a, b) => a.name.localeCompare(b.name)))
    setLoading(false)
  });

  const handleSubmitNewProgLang = async (event: SubmitEvent) => {
    event.preventDefault();
    setAdding(true);
    const res = await makeRequest({
      method: "POST",
      endpoint: "/prog_lang/create",
      body: {
        name: newProgLang(),
      },
    });
    if (res.ok) {
      setAllProgLang([
        ...allProgLang(),
        { id: res.data?.created.id, name: newProgLang() },
      ]);
      setNewProgLang("");
      toast.success("Programnyelv sikeresen hozzáadva!");
    }
    setAdding(false);
  };

  async function deleteProgLang(id: Number) {
    setDeleting(true);
    const res = await makeRequest({
      method: "DELETE",
      endpoint: `/prog_lang/delete/${id}`,
    });
    if (res.ok) {
      setAllProgLang([...allProgLang().filter((x) => x.id !== id)]);
      toast.success("Sikeres törlés!");
    }
    setDeleting(false);
  }

  return (
    <div class="mx-auto flex max-w-sm flex-col items-center gap-4">
      <h1 class="my-8 text-2xl font-semibold">Programozási nyelvek</h1>
      <form onSubmit={handleSubmitNewProgLang} class="flex items-end gap-4">
        <TextField onChange={setNewProgLang} value={newProgLang()} required>
          <TextFieldLabel>Programozási nyelv hozzáadása:</TextFieldLabel>
          <TextFieldInput type="text"></TextFieldInput>
        </TextField>
        <Button type="submit" disabled={adding()}>
          <Show when={!adding()} fallback={<Spinner />}>
            <FaSolidPlus />
          </Show>
          Hozzáadás
        </Button>
      </form>

      <Show when={!loading()} fallback={<Spinner class="mt-12" />}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nyelvek</TableHead>
              <TableHead class="text-right">
                <span class="mr-1.5 inline-block">Törlés</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <For each={allProgLang()}>
              {(progLang) => (
                <TableRow>
                  <TableCell>{progLang.name}</TableCell>
                  <TableCell class="text-right">
                    {(() => {
                      const [open, setOpen] = createSignal(false);
                      return (
                        <Dialog open={open()} onOpenChange={setOpen}>
                          <DialogTrigger class="ml-auto">
                            <Button variant="destructive" size="icon">
                              <FaSolidTrashCan />
                            </Button>
                          </DialogTrigger>
                          <DialogContent
                            noDefaultCloseButton={true}
                            class="py-4"
                          >
                            <DialogHeader class="flex-row items-center">
                              <DialogTitle class="text-xl">
                                Biztos, hogy szeretné törölni?
                              </DialogTitle>
                              <Button
                                size="icon"
                                variant="secondary"
                                class="-mr-2 ml-auto"
                                onClick={() => setOpen(false)}
                              >
                                <FaSolidXmark
                                  size={20}
                                  class="text-muted-foreground"
                                />
                              </Button>
                            </DialogHeader>
                            <Hr padding="1.5rem" />
                            <DialogFooter class="-mx-2 flex-col gap-4">
                              <div class="flex w-full gap-4">
                                <Button
                                  variant="secondary"
                                  class="flex-1"
                                  onClick={() => setOpen(false)}
                                >
                                  <FaSolidXmark />
                                  Nem
                                </Button>
                                <Button
                                  variant="destructive"
                                  class="flex-1"
                                  onClick={() => {
                                    deleteProgLang(progLang.id);
                                    setNewProgLang("");
                                  }}
                                  disabled={deleting()}
                                >
                                  <Show
                                    when={!deleting()}
                                    fallback={<Spinner />}
                                  >
                                    <FaSolidCheck />
                                  </Show>
                                  Igen
                                </Button>
                              </div>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              )}
            </For>
          </TableBody>
        </Table>
      </Show>
    </div>
  );
};

export default ProgrammingLangs;
