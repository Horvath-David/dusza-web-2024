import { Component, createSignal, For, onMount } from "solid-js";
import { Button } from "~/components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
  } from "~/components/ui/table"
import {
    TextField,
    TextFieldLabel,
    TextFieldInput,
  } from "~/components/ui/text-field.tsx";
import { FaSolidTrashCan } from 'solid-icons/fa'
import { makeRequest } from "~/lib/api";
import { Category, ProgrammingLanguage } from "~/lib/models";



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




const OrganizerView: Component<{}> = () => {

    const [newProgLang, setNewProgLang] = createSignal("");
    const [newCategory, setNewCategory] = createSignal("");

    const [allProgLang, setAllProgLang] = createSignal<ProgrammingLanguage[]>([]);
    const [allCategory, setAllCategory] = createSignal<Category[]>([]);

    onMount(async()=> {
        setAllProgLang(await getAllProgLang())
        setAllCategory(await getAllCategory())
    })


    const handleSubmitNewProgLang = async (event:SubmitEvent) => {
        event.preventDefault();

        await makeRequest({
            method: "POST",
            endpoint: "/prog_lang/create",
            body: {
              "name":newProgLang()
            },
          });
        setAllProgLang([...allProgLang(), {id: allProgLang().length, name: newProgLang()}])
        console.log(allProgLang());
    }

    const handleSubmitNewCategory = async (event:SubmitEvent) => {
        event.preventDefault();

        await makeRequest({
            method: "POST",
            endpoint: "/category/create",
            body: {
              "name":newCategory()
            },
          });
          setAllCategory([...allCategory(), {id: allCategory().length, name: newCategory()}])
        }

    async function deleteProgLang(id: Number) {
        await makeRequest({
            method: "DELETE",
            endpoint: `/prog_lang/delete/${id}`,
          });
          setAllProgLang([...allProgLang().filter((x)=>x.id!==id)])
    }

    async function deleteCategory(id: Number) {
        await makeRequest({
            method: "DELETE",
            endpoint: `/category/delete/${id}`,
          });
          setAllCategory([...allCategory().filter((x)=>x.id!==id)])
    }

    return (
        <div class="mx-auto flex max-w-sm flex-col items-center gap-4">
            <h1 class="my-8 text-2xl font-semibold">Adatok Módosítása</h1>
            <div>
                <h2 class="mb-4 mt-8 text-xl font-semibold">Programozási nyelv</h2>
                <form onSubmit={handleSubmitNewProgLang}  class="flex items-end gap-4">
                    <TextField onChange={setNewProgLang} value={newProgLang()} required>
                        <TextFieldLabel>Programozási nyelv hozzáadása:</TextFieldLabel>
                        <TextFieldInput type="text"></TextFieldInput>
                    </TextField>
                    <Button type="submit">Hozzáadás</Button>
                </form>

                <Table>
                    <TableCaption>Programozási nyelvek</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nyelvek</TableHead>
                            <TableHead class="text-right"><span class="mr-1.5 inline-block">Törlés</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <For each={allProgLang()}>
                            {(progLang) => (
                                <TableRow>
                                <TableCell>{progLang.name}</TableCell>
                                <TableCell class="text-right"><Button variant="destructive" onClick={()=>{deleteProgLang(progLang.id);setNewProgLang("")}}><FaSolidTrashCan /></Button></TableCell>
                                </TableRow>
                            )}
                            </For>
                    
                    </TableBody>
                </Table>
            </div>
            <div>
            <h2 class="mb-4 mt-8 text-xl font-semibold">Kategóriák</h2>
                <form onSubmit={handleSubmitNewCategory}  class="flex items-end gap-4">
                    <TextField onChange={setNewCategory} value={newCategory()} required>
                        <TextFieldLabel>Kategória hozzáadása:</TextFieldLabel>
                        <TextFieldInput type="text"></TextFieldInput>
                    </TextField>
                    <Button type="submit">Hozzáadás</Button>
                </form>

                <Table>
                    <TableCaption>Kategóriák</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kategóriák</TableHead>
                            <TableHead class="text-right"><span class="mr-1.5 inline-block">Törlés</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <For each={allCategory()}>
                            {(category) => (
                                <TableRow>
                                <TableCell>{category.name}</TableCell>
                                <TableCell class="text-right"><Button variant="destructive" onClick={()=>{deleteCategory(category.id); setNewCategory("")}}><FaSolidTrashCan /></Button></TableCell>
                                </TableRow>
                            )}
                            </For>
                    
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default OrganizerView;