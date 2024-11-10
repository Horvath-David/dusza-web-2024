import { Component, createSignal, For, onMount, Show } from "solid-js";
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
import { Category } from "~/lib/models";
import { toast } from "solid-sonner";
import { Spinner } from "~/components/Spinner";
import { Hr } from "~/components/Sidebar";

async function getAllCategory() {
  const res = await makeRequest<{
    status: string;
    error?: string;
    list: Category[];
  }>({
    endpoint: "/category/all",
  });
  return res.data?.list ?? [];
}

const Categories: Component<{}> = () => {
  const [newCategory, setNewCategory] = createSignal("");
  const [allCategory, setAllCategory] = createSignal<Category[]>([]);

  const [loading, setLoading] = createSignal(false);
  const [deleting, setDeleting] = createSignal(false);
  const [adding, setAdding] = createSignal(false);

  onMount(async () => {
    setLoading(true);
    setAllCategory(await getAllCategory());
    setAllCategory(allCategory().sort((a, b) => a.name.localeCompare(b.name)))
    setLoading(false);
   
  });

  const handleSubmitNewCategory = async (event: SubmitEvent) => {
    event.preventDefault();

    setAdding(true);
    const res = await makeRequest({
      method: "POST",
      endpoint: "/category/create",
      body: {
        name: newCategory(),
      },
    });
    if (res.ok) {
      setAllCategory([
        ...allCategory(),
        { id: res.data?.created.id, name: newCategory() },
      ]);
      setNewCategory("");
      toast.success("Kategória sikeresen hozzáadva!");
    }
    setAdding(false);
  };

  async function deleteCategory(id: Number) {
    setDeleting(true);
    const res = await makeRequest({
      method: "DELETE",
      endpoint: `/category/delete/${id}`,
    });
    if (res.ok) {
      setAllCategory([...allCategory().filter((x) => x.id !== id)]);
      toast.success("Sikeres törlés!");
    }
    setDeleting(false);
  }

  return (
    <div class="mx-auto flex max-w-sm flex-col items-center gap-4">
      <h1 class="my-8 text-2xl font-semibold">Kategóriák</h1>
      <form onSubmit={handleSubmitNewCategory} class="flex items-end gap-4">
        <TextField onChange={setNewCategory} value={newCategory()} required>
          <TextFieldLabel>Kategória hozzáadása:</TextFieldLabel>
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
              <TableHead>Kategóriák</TableHead>
              <TableHead class="text-right">
                <span class="mr-1.5 inline-block">Törlés</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <For each={allCategory()}>
              {(category) => (
                <TableRow>
                  <TableCell>{category.name}</TableCell>
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
                                    deleteCategory(category.id);
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

export default Categories;
