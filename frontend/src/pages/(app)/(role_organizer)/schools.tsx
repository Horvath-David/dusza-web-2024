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
import { FaSolidPencil } from "solid-icons/fa";
import { makeRequest } from "~/lib/api";
import { Button } from "~/components/ui/button";
import { DetailedShool } from "~/lib/models";

async function getAllShoolInfo() {
    const res = await makeRequest<{
      status: string;
      error?: string;
      list: DetailedShool[];
    }>({
      endpoint: "/school/all",
    });
    return res.data?.list ?? [];
  }


const Schools: Component<{}> = () => { 

    const [allSchool, setAllSchool] = createSignal<DetailedShool[]>([]);

    const [schoolName, setSchoolName] = createSignal("");
    const [schoolAddress, setSchoolAddress] = createSignal("");
    const [communicatorName, setCommunicatorName] = createSignal("");
    const [schoolUserName, setSchoolUserName] = createSignal("");
    const [communicatorEmail, setCommunicatorEmail] = createSignal("");
    const [schoolPassword, setSchoolPassword] = createSignal("");

    onMount(async () => {
        setAllSchool(await getAllShoolInfo());
      });
    
      
  const handleSubmitNewShool = async (event: SubmitEvent) => {
    event.preventDefault();

    const res = await makeRequest({
      method: "POST",
      endpoint: "/school/create",
      body: {
        username: schoolUserName(),
        password: schoolPassword(),
        school_name: schoolName(),
        address: schoolAddress(),
        display_name: communicatorName(),
        email: communicatorEmail(),
      },
    });
    setAllSchool([...allSchool(), {
        id: res.data?.created.id,
        name: schoolName(),
        address: schoolAddress(),
        communicator: {
            username: schoolUserName(),
            name: communicatorName(),
            email: communicatorEmail()
        }

    }])
    setSchoolName("");
    setSchoolAddress("");
    setCommunicatorName("");
    setCommunicatorEmail("");
    setSchoolPassword("");
    setSchoolUserName("");
    
  };
    

    return(
        <><div class="mx-auto flex max-w-sm flex-col items-center gap-4">
            <h1 class="my-8 text-2xl font-semibold">Intézmények</h1>
            <form
                class="mx-auto flex max-w-sm flex-col items-center gap-4"
                onSubmit={handleSubmitNewShool}>
                <TextField
                    value={schoolUserName()}
                    onChange={setSchoolUserName}
                    required
                >
                    <TextFieldLabel>Intézmény felhasználóneve:</TextFieldLabel>
                    <TextFieldInput type="text"></TextFieldInput>
                </TextField>
                <TextField
                    value={schoolPassword()}
                    onChange={setSchoolPassword}
                    required
                >
                    <TextFieldLabel>Intézmény jelszava:</TextFieldLabel>
                    <TextFieldInput type="password"></TextFieldInput>
                </TextField>
                <TextField value={schoolName()} onChange={setSchoolName} required>
                    <TextFieldLabel>Intézmény neve:</TextFieldLabel>
                    <TextFieldInput type="text"></TextFieldInput>
                </TextField>
                <TextField
                    value={schoolAddress()}
                    onChange={setSchoolAddress}
                    required
                >
                    <TextFieldLabel>Intézmény címe:</TextFieldLabel>
                    <TextFieldInput type="text"></TextFieldInput>
                </TextField>
                <TextField
                    value={communicatorName()}
                    onChange={setCommunicatorName}
                    required
                >
                    <TextFieldLabel>Kapcsolattartó neve:</TextFieldLabel>
                    <TextFieldInput type="text"></TextFieldInput>
                </TextField>
                <TextField
                    value={communicatorEmail()}
                    onChange={setCommunicatorEmail}
                    required
                >
                    <TextFieldLabel>Kapcsolattartó email címe:</TextFieldLabel>
                    <TextFieldInput type="email"></TextFieldInput>
                </TextField>
                <Button class="mb-4 mt-6 w-full" type="submit">
                    Hozzáadás
                </Button>
            </form>
        </div><div>
                <h2 class="mb-4 mt-8 text-xl font-semibold">
                    Intézmények megtekintése:
                </h2>
                <Table class="max-w-50">
                    <TableCaption>Intézmények</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Intézméynek</TableHead>
                            <TableHead class="text-right">Szerkeztés</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <For each={allSchool()}>
                            {(school) => (
                                <TableRow>
                                    <TableCell>{school.name}</TableCell>
                                    <TableCell class="text-right">
                                        <Dialog>
                                            <DialogTrigger>
                                                <Button variant="secondary">
                                                    <FaSolidPencil />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>{school.name} szerkeztése</DialogTitle>
                                                </DialogHeader>
                                                <div>
                                                    <TextField class="grid grid-cols-4 items-center gap-4" onChange={setSchoolName}>
                                                        <TextFieldLabel class="text-right text-sm">Neve</TextFieldLabel>
                                                        <TextFieldInput value={school.name} class="col-span-3" type="text" />
                                                    </TextField>
                                                    <TextField class="grid grid-cols-4 items-center gap-4" onChange={setSchoolAddress}>
                                                        <TextFieldLabel class="text-right text-sm">Címe</TextFieldLabel>
                                                        <TextFieldInput value={school.address} class="col-span-3" type="text" />
                                                    </TextField>
                                                    <TextField class="grid grid-cols-4 items-center gap-4" onChange={setSchoolUserName}>
                                                        <TextFieldLabel class="text-right text-sm">Felhasználó neve</TextFieldLabel>
                                                        <TextFieldInput value={school.communicator.username} class="col-span-3" type="text" />
                                                    </TextField>
                                                    <TextField class="grid grid-cols-4 items-center gap-4" onChange={setCommunicatorName}>
                                                        <TextFieldLabel class="text-right text-sm">Kapcsolattartó neve</TextFieldLabel>
                                                        <TextFieldInput value={school.communicator.name} class="col-span-3" type="text" />
                                                    </TextField>
                                                    <TextField class="grid grid-cols-4 items-center gap-4" onChange={setCommunicatorEmail}>
                                                        <TextFieldLabel class="text-right text-sm">Kapcsolattartó email címe</TextFieldLabel>
                                                        <TextFieldInput value={school.communicator.email} class="col-span-3" type="text" />
                                                    </TextField>

                                                </div>
                                                <DialogFooter>
                                                    <Button variant="destructive">Törlés</Button>
                                                    <Button>Szerkeztés</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            )}</For>
                    </TableBody>
                </Table>
            </div></>
    );
}

export default Schools;