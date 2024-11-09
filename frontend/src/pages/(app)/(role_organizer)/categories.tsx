import { Component, createSignal, For, onMount } from "solid-js";
import {
    Table,
    TableBody,
    TableCaption,
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
import { Category } from "~/lib/models";


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

    onMount(async () => {
        setAllCategory(await getAllCategory());
      });
    
    const handleSubmitNewCategory = async (event: SubmitEvent) => {
        event.preventDefault();

        const res = await makeRequest({
        method: "POST",
        endpoint: "/category/create",
        body: {
            name: newCategory(),
        },
        });
        setAllCategory([
            ...allCategory(),
            { id: res.data?.created.id, name: newCategory() },
          ]);
          setNewCategory("");
    };

    async function deleteCategory(id: Number) {
        await makeRequest({
          method: "DELETE",
          endpoint: `/category/delete/${id}`,
        });
        setAllCategory([...allCategory().filter((x) => x.id !== id)]);
      }


    return (
        <div class="mx-auto flex max-w-sm flex-col items-center gap-4">
            <h1 class="my-8 text-2xl font-semibold">Kategóriák</h1>
            <form onSubmit={handleSubmitNewCategory} class="flex items-end gap-4">
          <TextField onChange={setNewCategory} value={newCategory()} required>
            <TextFieldLabel>Kategória hozzáadása:</TextFieldLabel>
            <TextFieldInput type="text"></TextFieldInput>
          </TextField>
          <Button type="submit">Hozzáadás</Button>
        </form>

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
                    <Dialog>
                      <DialogTrigger>
                        <Button variant="destructive">
                          <FaSolidTrashCan />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Biztos hogy szeretné törölni?
                          </DialogTitle>
                        </DialogHeader>

                        <DialogFooter>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              deleteCategory(category.id);}}>
                            Igen
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    {/* <Button variant="destructive" onClick={()=>{deleteCategory(category.id); setNewCategory("")}}><FaSolidTrashCan /></Button> */}
                  </TableCell>
                </TableRow>
              )}
            </For>
          </TableBody>
        </Table>
        </div>
    );
}

export default Categories;
