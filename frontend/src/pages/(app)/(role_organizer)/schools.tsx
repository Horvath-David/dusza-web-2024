import {
  Component,
  createEffect,
  createSignal,
  For,
  onMount,
  Show,
} from "solid-js";
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
  FaSolidFloppyDisk,
  FaSolidPencil,
  FaSolidPlus,
  FaSolidTrashCan,
  FaSolidXmark,
} from "solid-icons/fa";
import { makeRequest } from "~/lib/api";
import { Button } from "~/components/ui/button";
import { DetailedShool } from "~/lib/models";
import { Hr } from "~/components/Sidebar";
import { Spinner } from "~/components/Spinner";
import { toast } from "solid-sonner";

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

  const [loading, setLoading] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [deleting, setDeleting] = createSignal(false);
  const [adding, setAdding] = createSignal(false);
  const [addModalOpen, setAddModalOpen] = createSignal(false);

  onMount(async () => {
    setLoading(true);
    setAllSchool(await getAllShoolInfo());
    setLoading(false);
  });

  const handleSubmitNewShool = async (event: SubmitEvent) => {
    event.preventDefault();

    setAdding(true);
    const res = await makeRequest({
      endpoint: "/school/create",
      method: "POST",
      body: {
        username: schoolUserName(),
        password: schoolPassword(),
        school_name: schoolName(),
        address: schoolAddress(),
        display_name: communicatorName(),
        email: communicatorEmail(),
      },
    });
    if (res.ok) {
      setAllSchool([
        ...allSchool(),
        {
          id: res.data?.created.id,
          name: schoolName(),
          address: schoolAddress(),
          communicator: {
            username: schoolUserName(),
            display_name: communicatorName(),
            email: communicatorEmail(),
          },
        },
      ]);
      setSchoolName("");
      setSchoolAddress("");
      setCommunicatorName("");
      setCommunicatorEmail("");
      setSchoolPassword("");
      setSchoolUserName("");
      setAddModalOpen(false);
      toast.success("Iskola sikeresen hozzáadva!");
    }
    setAdding(false);
  };

  const handleSave = async (school: DetailedShool) => {
    setSaving(true);
    const res = await makeRequest<{
      status: string;
      error?: string;
      modified: DetailedShool;
    }>({
      endpoint: `/school/${school.id}/manage`,
      method: "PATCH",
      body: {
        username: schoolUserName(),
        school_name: schoolName(),
        address: schoolAddress(),
        display_name: communicatorName(),
        email: communicatorEmail(),
      },
    });
    if (res.ok) {
      setAllSchool(
        allSchool().map((x) => (x.id === school.id ? res.data!.modified : x)),
      );
      toast.success("Sikeres mentés!");
    }
    setSaving(false);
  };

  const handleDelete = async (school: DetailedShool) => {
    setDeleting(true);
    const res = await makeRequest<{
      status: string;
      error?: string;
      modified: DetailedShool;
    }>({
      endpoint: `/school/${school.id}/manage`,
      method: "DELETE",
    });
    if (res.ok) {
      setAllSchool(allSchool().filter((x) => x.id !== school.id));
      toast.success("Sikeres törlés!");
    }
    setDeleting(false);
  };

  return (
    <>
      <div>
        <h1 class="my-8 text-center text-2xl font-semibold">Intézmények</h1>
        <Table class="mx-auto max-w-2xl">
          <TableHeader>
            <TableRow>
              <TableHead>Intézméynek</TableHead>
              <TableHead>Kapcsolattartó</TableHead>
              <TableHead class="text-right">Szerkeztés</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <For each={allSchool()}>
              {(school) => {
                const [open, setOpen] = createSignal(false);

                createEffect(() => {
                  if (open()) {
                    setSchoolName(school.name);
                    setSchoolAddress(school.address);
                    setCommunicatorName(school.communicator.display_name);
                    setCommunicatorEmail(school.communicator.email);
                    setSchoolUserName(school.communicator.username);
                  }
                });

                return (
                  <Dialog open={open()} onOpenChange={setOpen}>
                    <DialogTrigger
                      as={() => (
                        <TableRow
                          class="cursor-pointer"
                          onClick={() => setOpen(true)}
                        >
                          <TableCell>{school.name}</TableCell>
                          <TableCell>
                            {school.communicator.display_name}
                          </TableCell>
                          <TableCell class="text-right">
                            <Button size="icon" variant="secondary">
                              <FaSolidPencil />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    ></DialogTrigger>
                    <DialogContent noDefaultCloseButton={true} class="py-4">
                      <DialogHeader class="flex-row items-center">
                        <DialogTitle class="text-xl">
                          {school.name} szerkeztése
                        </DialogTitle>
                        <Button
                          size="icon"
                          variant="secondary"
                          class="-mr-2 ml-auto shrink-0"
                          onClick={() => setOpen(false)}
                        >
                          <FaSolidXmark
                            size={20}
                            class="text-muted-foreground"
                          />
                        </Button>
                      </DialogHeader>
                      <Hr padding="1.5rem" />
                      <div class="flex flex-col gap-4">
                        <TextField class="max-w-full" onChange={setSchoolName}>
                          <TextFieldLabel>Neve</TextFieldLabel>
                          <TextFieldInput value={school.name} type="text" />
                        </TextField>
                        <TextField
                          class="max-w-full"
                          onChange={setSchoolAddress}
                        >
                          <TextFieldLabel>Címe</TextFieldLabel>
                          <TextFieldInput value={school.address} type="text" />
                        </TextField>
                        <TextField
                          class="max-w-full"
                          onChange={setSchoolUserName}
                        >
                          <TextFieldLabel>Felhasználó neve</TextFieldLabel>
                          <TextFieldInput
                            value={school.communicator.username}
                            type="text"
                          />
                        </TextField>
                        <div class="flex gap-4">
                          <TextField onChange={setCommunicatorName}>
                            <TextFieldLabel>Kapcsolattartó neve</TextFieldLabel>
                            <TextFieldInput
                              value={school.communicator.display_name}
                              type="text"
                            />
                          </TextField>
                          <TextField onChange={setCommunicatorEmail}>
                            <TextFieldLabel>
                              Kapcsolattartó email címe
                            </TextFieldLabel>
                            <TextFieldInput
                              value={school.communicator.email}
                              type="email"
                            />
                          </TextField>
                        </div>
                      </div>
                      <Hr padding="1.5rem" />
                      <DialogFooter class="-mx-2 flex-row gap-4">
                        <Button
                          class="flex-1"
                          variant="destructive"
                          onClick={() => handleDelete(school)}
                          disabled={deleting()}
                        >
                          <Show when={!deleting()} fallback={<Spinner />}>
                            <FaSolidTrashCan />
                          </Show>
                          Törlés
                        </Button>
                        <Button
                          class="flex-[2]"
                          onClick={() => handleSave(school)}
                          disabled={saving()}
                        >
                          <Show when={!saving()} fallback={<Spinner />}>
                            <FaSolidFloppyDisk />
                          </Show>
                          Mentés
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                );
              }}
            </For>
          </TableBody>
        </Table>

        <Show when={!loading()}>
          {(() => {
            createEffect(() => {
              if (addModalOpen()) {
                setSchoolName("");
                setSchoolAddress("");
                setCommunicatorName("");
                setCommunicatorEmail("");
                setSchoolPassword("");
                setSchoolUserName("");
              }
            });

            return (
              <Dialog open={addModalOpen()} onOpenChange={setAddModalOpen}>
                <DialogTrigger
                  as={() => (
                    <Button
                      variant="default"
                      class="absolute bottom-10 right-10"
                      onClick={() => setAddModalOpen(true)}
                    >
                      <FaSolidPlus />
                      Új hozzáadása
                    </Button>
                  )}
                ></DialogTrigger>
                <DialogContent noDefaultCloseButton={true} class="py-4">
                  <form
                    class="flex flex-col gap-4"
                    onSubmit={handleSubmitNewShool}
                  >
                    <DialogHeader class="flex-row items-center">
                      <DialogTitle class="text-xl">
                        Új iskola hozzáadása
                      </DialogTitle>
                      <Button
                        size="icon"
                        variant="secondary"
                        class="-mr-2 ml-auto shrink-0"
                        onClick={() => setAddModalOpen(false)}
                      >
                        <FaSolidXmark size={20} class="text-muted-foreground" />
                      </Button>
                    </DialogHeader>
                    <Hr padding="1.5rem" />
                    <div class="flex flex-col gap-4">
                      <div class="flex gap-4">
                        <TextField
                          required
                          class="max-w-full"
                          onChange={setSchoolUserName}
                        >
                          <TextFieldLabel>Felhasználónév</TextFieldLabel>
                          <TextFieldInput
                            value={schoolUserName()}
                            type="text"
                          />
                        </TextField>
                        <TextField
                          required
                          class="max-w-full"
                          onChange={setSchoolPassword}
                        >
                          <TextFieldLabel>Jelszó</TextFieldLabel>
                          <TextFieldInput
                            value={schoolPassword()}
                            type="password"
                          />
                        </TextField>
                      </div>
                      <TextField
                        required
                        class="max-w-full"
                        onChange={setSchoolName}
                      >
                        <TextFieldLabel>Iskola neve</TextFieldLabel>
                        <TextFieldInput value={schoolName()} type="text" />
                      </TextField>
                      <TextField
                        required
                        class="max-w-full"
                        onChange={setSchoolAddress}
                      >
                        <TextFieldLabel>Iskola címe</TextFieldLabel>
                        <TextFieldInput value={schoolAddress()} type="text" />
                      </TextField>
                      <div class="flex gap-4">
                        <TextField required onChange={setCommunicatorName}>
                          <TextFieldLabel>Kapcsolattartó neve</TextFieldLabel>
                          <TextFieldInput
                            value={communicatorName()}
                            type="text"
                          />
                        </TextField>
                        <TextField required onChange={setCommunicatorEmail}>
                          <TextFieldLabel>
                            Kapcsolattartó email címe
                          </TextFieldLabel>
                          <TextFieldInput
                            value={communicatorEmail()}
                            type="email"
                          />
                        </TextField>
                      </div>
                    </div>
                    <Hr padding="1.5rem" />
                    <DialogFooter class="-mx-2 flex-row gap-4">
                      <Button
                        class="flex-[2]"
                        variant="success"
                        type="submit"
                        disabled={adding()}
                      >
                        <Show when={!adding()} fallback={<Spinner />}>
                          <FaSolidPlus />
                        </Show>
                        Hozzáadás
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            );
          })()}
        </Show>
      </div>
    </>
  );
};

export default Schools;
