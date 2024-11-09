import { Component, createSignal, For, onMount } from "solid-js";
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
import { FaSolidTrashCan } from "solid-icons/fa";
import { makeRequest } from "~/lib/api";
import { Button } from "~/components/ui/button";

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

  onMount(async () => {
    setAllProgLang(await getAllProgLang());
  });
  const handleSubmitNewProgLang = async (event: SubmitEvent) => {
    event.preventDefault();
    const res = await makeRequest({
      method: "POST",
      endpoint: "/prog_lang/create",
      body: {
        name: newProgLang(),
      },
    });
    setAllProgLang([
      ...allProgLang(),
      { id: res.data?.created.id, name: newProgLang() },
    ]);
    setNewProgLang("");
  };

  async function deleteProgLang(id: Number) {
    await makeRequest({
      method: "DELETE",
      endpoint: `/prog_lang/delete/${id}`,
    });
    setAllProgLang([...allProgLang().filter((x) => x.id !== id)]);
  }

  return (
    <div class="mx-auto flex max-w-sm flex-col items-center gap-4">
      <h1 class="my-8 text-2xl font-semibold">Programozási nyelvek</h1>
      <form onSubmit={handleSubmitNewProgLang} class="flex items-end gap-4">
        <TextField onChange={setNewProgLang} value={newProgLang()} required>
          <TextFieldLabel>Programozási nyelv hozzáadása:</TextFieldLabel>
          <TextFieldInput type="text"></TextFieldInput>
        </TextField>
        <Button type="submit">Hozzáadás</Button>
      </form>

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
                  <Dialog>
                    <DialogTrigger>
                      <Button variant="destructive">
                        <FaSolidTrashCan />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Biztos hogy szeretné törölni?</DialogTitle>
                      </DialogHeader>

                      <DialogFooter>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            deleteProgLang(progLang.id);
                            setNewProgLang("");
                          }}
                        >
                          Igen
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            )}
          </For>
        </TableBody>
      </Table>
    </div>
  );
};

export default ProgrammingLangs;
