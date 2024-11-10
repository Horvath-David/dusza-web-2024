import { Component, createSignal, For, onMount, Show } from "solid-js";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { BsPeopleFill } from "solid-icons/bs";
import {
  FaSolidHourglassEnd,
  FaSolidPaperclip,
  FaSolidPen,
  FaSolidPersonChalkboard,
  FaSolidSchool,
  FaSolidTrashCan,
  FaSolidXmark,
} from "solid-icons/fa";
import { FaSolidCheck } from "solid-icons/fa";
import { makeRequest } from "~/lib/api";
import { FilterOptions, Team } from "~/lib/models";
import { toast } from "solid-sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { BiRegularCategoryAlt } from "solid-icons/bi";
import { FiCode } from "solid-icons/fi";
import { Badge } from "~/components/ui/badge";
import { Hr } from "~/components/Sidebar";
import { Spinner } from "~/components/Spinner";

const FILTER_REG: FilterOptions[] = [
  { id: "", name: "Összes" },
  { id: "registered", name: "Registrált" },
  { id: "approved_by_school", name: "Jóváhagyásra vár" },
  { id: "approved_by_organizer", name: "Jóváhagyott" },
];

async function getTeams() {
  const res = await makeRequest<{
    status: string;
    error?: string;
    teams: Team[];
  }>({
    endpoint: "/team/all",
  });
  return res.data?.teams ?? [];
}

function saveCsv(filename: string, data: string) {
  const blob = new Blob([data], { type: "text/csv" });

  const elem = window.document.createElement("a");
  elem.href = window.URL.createObjectURL(blob);
  elem.download = filename;
  document.body.appendChild(elem);
  elem.click();
  document.body.removeChild(elem);
}

function objectsToCSV(arr: any[]) {
  const array = [Object.keys(arr[0])].concat(arr);
  return array
    .map((row) => {
      return Object.values(row)
        .map((value) => {
          return typeof value === "string" ? JSON.stringify(value) : value;
        })
        .toString();
    })
    .join("\n");
}

const Teams: Component<{}> = () => {
  const [allTeamInfo, setAllTeamInfo] = createSignal<Team[]>([]);

  const [loading, setLoading] = createSignal(false);
  const [alerting, setAlerting] = createSignal(false);
  const [deleting, setDeleting] = createSignal(false);
  const [approving, setApproving] = createSignal(false);

  const [filterByRegistry, setFilterByregistry] = createSignal<FilterOptions>({
    id: "",
    name: "",
  });

  onMount(async () => {
    setLoading(true);
    setAllTeamInfo(await getTeams());
    setLoading(false);
  });

  async function alertTeam(id: number) {
    setAlerting(true);
    const res = await makeRequest({
      method: "POST",
      endpoint: `/team/${id}/request_info_fix`,
      noErrorToast: true,
    });
    if (res.status === 304) {
      toast.warning("Már küldtek értesítést ennek a csapatnak");
    } else if (!res.ok) {
      toast.error("Hiba történt!", {
        description: res.data
          ? res.data.error
          : `Ismeretlen hiba (${res.status} ${res.statusText})`,
      });
    } else {
      toast.success("Sikeres üzenet küldés");
    }
    setAlerting(false);
  }

  async function approveTeam(id: number) {
    setApproving(true);
    const res = await makeRequest({
      method: "POST",
      endpoint: `/team/${id}/change_status/approved_by_organizer`,
      body: {},
    });
    if (res.ok) {
      toast.success("Sikeres státusz változtatás");
    }
    setApproving(false);
  }

  async function deleteTeam(id: number) {
    setDeleting(true);
    const res = await makeRequest({
      method: "DELETE",
      endpoint: `/team/${id}/manage`,
    });
    if (res.status === 200) {
      toast.success("Sikeres törlés");
      setAllTeamInfo([...allTeamInfo().filter((x) => x.id !== id)]);
    } else {
      toast.error("Hiba történt");
    }
    setDeleting(false);
  }

  async function handleExport() {
    const csv = objectsToCSV(
      allTeamInfo().map((x) => ({
        "Csapat neve": x.name,
        "Iskola neve": x.school.name,
        "Csapattag1 név": x.members.at(0)?.name ?? "",
        "Csapattag1 évfolyam": x.members.at(0)?.grade ?? "",
        "Csapattag2 név": x.members.at(1)?.name ?? "",
        "Csapattag2 évfolyam": x.members.at(1)?.grade ?? "",
        "Csapattag3 név": x.members.at(2)?.name ?? "",
        "Csapattag3 évfolyam": x.members.at(2)?.grade ?? "",
        "Pót tag név": x.supplementary_members?.at(0)?.name ?? "",
        "Pót tag évfolyam": x.supplementary_members?.at(0)?.name
          ? (x.members?.at(2)?.grade ?? "")
          : "",
        "Felkészítő tanár/tanárok": x.teacher_name,
        Kategória: x.category.name,
        "Választott programnyelv": x.prog_lang.name,
        Állapot: {
          registered: "regisztrált",
          approved_by_school: "iskola által jóváhagyva",
          approved_by_organizer: "szervezők által jóváhagyva",
        }[x.status],
      })),
    );
    saveCsv("csapatok.csv", csv);
  }

  return (
    <div class="mx-auto flex flex-col items-center gap-4">
      <h1 class="my-8 text-2xl font-semibold">Csapatok</h1>

      <Show when={!loading()} fallback={<Spinner class="mt-12" />}>
        <div class="grid w-full max-w-3xl grid-cols-1 gap-4">
          <Select<FilterOptions>
            options={FILTER_REG}
            placeholder="Szűrés"
            optionValue="id"
            optionTextValue="name"
            class="w-full"
            value={filterByRegistry()}
            onChange={setFilterByregistry}
            itemComponent={(props) => (
              <SelectItem item={props.item}>
                {props.item.rawValue.name}
              </SelectItem>
            )}
          >
            <SelectTrigger class="w-48">
              <SelectValue<string>>
                {(state) => state.selectedOption()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent />
          </Select>
          <For
            each={allTeamInfo().filter((x) =>
              (filterByRegistry()?.id === ""
                ? ["registered", "approved_by_school", "approved_by_organizer"]
                : [filterByRegistry()?.id]
              ).includes(x.status),
            )}
          >
            {(team) => (
              <Card>
                <CardHeader class="flex-row items-center border-b py-4">
                  <div>
                    <CardTitle class="flex items-center gap-2">
                      <span class="leading-none">{team.name}</span>
                      <Badge
                        class="mt-1"
                        variant={
                          {
                            registered: "secondary",
                            approved_by_organizer: "green",
                            approved_by_school: "yellow",
                          }[team.status] as "secondary" | "green" | "yellow"
                        }
                      >
                        {
                          {
                            registered: "iskolai jóváhagyásra vár",
                            approved_by_organizer: "jóváhagyva",
                            approved_by_school: "szervezői jóváhagyásra vár",
                          }[team.status]
                        }
                      </Badge>
                    </CardTitle>
                    <CardDescription class="flex items-center gap-2">
                      <BiRegularCategoryAlt />
                      {team.category.name}
                    </CardDescription>
                  </div>
                  {(() => {
                    const [open, setOpen] = createSignal(false);
                    return (
                      <Dialog open={open()} onOpenChange={setOpen}>
                        <DialogTrigger class="ml-auto">
                          <Button variant="secondary">Kezelés</Button>
                        </DialogTrigger>
                        <DialogContent noDefaultCloseButton={true} class="py-4">
                          <DialogHeader class="flex-row items-center">
                            <DialogTitle class="text-xl">
                              {team.name} adatai
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
                          <div class="flex flex-col gap-0.5">
                            <div class="flex items-center gap-2 font-semibold">
                              <FaSolidSchool />
                              <span class="line-clamp-2 break-words">
                                Iskola neve
                              </span>
                            </div>
                            {team.school.name}
                          </div>
                          <div class="grid w-full grid-cols-2 gap-4">
                            <div class="flex flex-col gap-0.5">
                              <div class="flex items-center gap-2 font-semibold">
                                <BiRegularCategoryAlt />
                                <span class="line-clamp-2 break-words">
                                  Kategória
                                </span>
                              </div>
                              {team.category.name}
                            </div>
                            <div class="flex flex-col gap-0.5">
                              <div class="flex items-center gap-2 font-semibold">
                                <FiCode />
                                <span class="line-clamp-2 break-words">
                                  Programnyelv
                                </span>
                              </div>
                              {team.prog_lang.name}
                            </div>
                          </div>
                          <div class="flex flex-col gap-0.5">
                            <div class="flex items-center gap-2 font-semibold">
                              <BsPeopleFill />
                              <span class="line-clamp-2 break-words">
                                Csapattagok
                              </span>
                            </div>
                            {team.members
                              .map((x) => `${x.name} (${x.grade}.)`)
                              .join(", ") +
                              (team.supplementary_members?.at(0)?.name
                                ? ", " +
                                  team.supplementary_members
                                    ?.map(
                                      (x) => `${x.name} (${x.grade}. - pót)`,
                                    )
                                    .at(0)
                                : "")}
                          </div>
                          <div class="grid w-full grid-cols-2 gap-4">
                            <div class="flex flex-col gap-0.5">
                              <div class="flex items-center gap-2 font-semibold">
                                <FaSolidPersonChalkboard />
                                <span class="line-clamp-2 break-words">
                                  Felkészítő tanár
                                </span>
                              </div>
                              {team.teacher_name}
                            </div>
                            <div class="flex flex-col gap-0.5">
                              <div class="flex items-center gap-2 font-semibold">
                                <FaSolidHourglassEnd />
                                <span class="line-clamp-2 break-words">
                                  Állapot
                                </span>
                              </div>
                              <Badge
                                class="mt-1 w-fit"
                                variant={
                                  {
                                    registered: "secondary",
                                    approved_by_organizer: "green",
                                    approved_by_school: "yellow",
                                  }[team.status] as
                                    | "secondary"
                                    | "green"
                                    | "yellow"
                                }
                              >
                                {
                                  {
                                    registered: "iskolai jóváhagyásra vár",
                                    approved_by_organizer: "jóváhagyva",
                                    approved_by_school:
                                      "szervezői jóváhagyásra vár",
                                  }[team.status]
                                }
                              </Badge>
                            </div>
                          </div>
                          <Hr padding="1.5rem" />
                          <DialogFooter class="-mx-2 flex-col gap-4">
                            <div class="flex w-full gap-4">
                              <Button
                                variant="warning"
                                class="flex-1"
                                onClick={() => {
                                  alertTeam(team.id);
                                }}
                                disabled={alerting()}
                              >
                                <Show when={!alerting()} fallback={<Spinner />}>
                                  <FaSolidPen />
                                </Show>
                                Módosítás kérése
                              </Button>
                              <Button
                                variant="destructive"
                                class="flex-1"
                                onClick={() => {
                                  deleteTeam(team.id);
                                }}
                                disabled={deleting()}
                              >
                                <Show when={!deleting()} fallback={<Spinner />}>
                                  <FaSolidTrashCan />
                                </Show>
                                Törlés
                              </Button>
                            </div>
                            <Show when={team.status === "approved_by_school"}>
                              <Button
                                variant="default"
                                onClick={() => {
                                  approveTeam(team.id);
                                }}
                                disabled={approving()}
                              >
                                <Show
                                  when={!approving()}
                                  fallback={<Spinner />}
                                >
                                  <FaSolidCheck />
                                </Show>
                                Jóváhagyás
                              </Button>
                            </Show>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    );
                  })()}
                </CardHeader>
                <CardContent class="flex gap-6 py-4">
                  <div class="flex flex-1 flex-col justify-center gap-2">
                    <div class="flex items-center gap-2 text-sm">
                      <FaSolidSchool />
                      <span class="line-clamp-2 break-words">
                        {team.school.name}
                      </span>
                    </div>
                  </div>
                  <div class="flex flex-1 flex-col gap-2">
                    <div class="flex items-center gap-2 text-sm">
                      <FiCode />
                      {team.prog_lang.name}
                    </div>
                    <div class="flex items-center gap-2 text-sm">
                      <FaSolidPersonChalkboard />
                      {team.teacher_name}
                    </div>
                  </div>
                  <div class="flex flex-[2] flex-col justify-center gap-2">
                    <div class="flex items-center gap-4">
                      <BsPeopleFill />
                      <div class="grid grid-cols-2 flex-col gap-x-2 text-sm">
                        <For each={team.members}>
                          {(member) => (
                            <div>
                              {member.name} ({member.grade}.)
                            </div>
                          )}
                        </For>
                        <Show when={team.supplementary_members?.at(0)?.name}>
                          <div class="text-muted-foreground">
                            {team.supplementary_members?.at(0)?.name} (
                            {team.supplementary_members?.at(0)?.grade}.)
                          </div>
                        </Show>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </For>
        </div>
      </Show>
      <Show when={!loading()}>
        <Button
          variant="default"
          class="absolute bottom-10 right-10"
          onClick={handleExport}
        >
          <FaSolidPaperclip />
          Exportálás CSV-ként
        </Button>
      </Show>
    </div>
  );
};

export default Teams;
