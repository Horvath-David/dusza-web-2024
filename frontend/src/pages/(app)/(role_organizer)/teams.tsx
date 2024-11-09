import {
  Component, createSignal,
  For,
  onMount,
  Show
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { BsInfoLg, BsPeopleFill } from "solid-icons/bs";
import {
  FaSolidPersonChalkboard,
  FaSolidSchool,
  FaSolidTrashCan
} from "solid-icons/fa";
import { FaSolidCheck } from "solid-icons/fa";
import { makeRequest } from "~/lib/api";
import { Team } from "~/lib/models";
import { toast } from "solid-sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { BiRegularCategoryAlt } from "solid-icons/bi";
import { FiCode } from "solid-icons/fi";
import { Badge } from "~/components/ui/badge";

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

const Teams: Component<{}> = () => {
  const [allTeamInfo, setAllTeamInfo] = createSignal<Team[]>([]);

  onMount(async () => {
    setAllTeamInfo(await getTeams());
  });

  async function sendAlert(idNum: number) {
    const res = await makeRequest({
      method: "POST",
      endpoint: `/team/${idNum}/request_info_fix`,
      noErrorToast: true,
    });
    if (res.status === 304) {
      toast.warning("Már küldtek értesítést ennek a csapatnak");
    } else if (!res.ok) {
      toast.error("Hiba történt!", {
        description: `Ismeretlen hiba (${res.status} ${res.statusText})`,
      });
    } else {
      toast.success("Sikeres üzenet küldés");
    }
  }

  async function changeaStatus(idNum: number) {
    const res = await makeRequest({
      method: "POST",
      endpoint: `/team/${idNum}/change_status/approved_by_organizer`,
      body: {},
    });
    if (res.status === 200) {
      toast.success("Sikeres státusz változtatás");
    } else {
      toast.error("Hiba történt");
    }
  }

  async function deleteTeam(id: number) {
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
  }

  return (
    <div class="mx-auto flex flex-col items-center gap-4">
      <h1 class="my-8 text-2xl font-semibold">Csapatok</h1>

      <div class="grid max-w-4xl grid-cols-1 gap-4 lg:grid-cols-2">
        <For each={allTeamInfo()}>
          {(team) => (
            <Card class="cursor-pointer">
              <CardHeader class="border-b pb-4">
                <CardTitle>
                  {team.name}
                  <Badge
                    variant={
                      {
                        registered: "secondary",
                        approved_by_organizer: "green",
                        approved_by_school: "yellow",
                      }[team.status] as "secondary" | "green" | "yellow"
                    }
                    class="ml-2"
                  >
                    {
                      {
                        registered: "regisztrált",
                        approved_by_organizer: "jóváhagyva",
                        approved_by_school: "jóváhagyásra vár",
                      }[team.status]
                    }
                  </Badge>
                </CardTitle>
                <CardDescription class="flex items-center gap-2">
                  <BiRegularCategoryAlt />
                  {team.category.name}
                </CardDescription>
              </CardHeader>
              <CardContent class="grid grid-cols-2 gap-6 pt-4">
                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <BsPeopleFill />
                    <div class="flex flex-col text-sm">
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

                <div class="flex flex-col gap-2">
                  <div class="max-w-1/2 flex items-center gap-2 text-sm">
                    <FaSolidSchool />
                    <span class="line-clamp-2 break-all">
                      {team.school.name +
                        team.school.name +
                        team.school.name +
                        team.school.name}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <FiCode />
                    {team.prog_lang.name}
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <FaSolidPersonChalkboard />
                    {team.teacher_name}
                  </div>
                </div>
              </CardContent>
              <CardFooter class="border-t p-4">
                <Button variant="secondary" class="w-full">
                  Kezelés
                </Button>
              </CardFooter>
            </Card>
          )}
        </For>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Csapat neve</TableHead>
            <TableHead>Csapat Státusza</TableHead>
            <TableHead>Csapat adatai</TableHead>
            <TableHead>Csapat elfogadása</TableHead>
            <TableHead>Csapat törlése</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <For each={allTeamInfo()}>
            {(team) => (
              <TableRow>
                <TableCell>{team.name}</TableCell>
                <TableCell>{team.status}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger>
                      <Button>
                        <BsInfoLg />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{team.name} adatai</DialogTitle>
                      </DialogHeader>
                      <div>
                        <p>Neve: {team.name}</p>
                        <p>Tagok: </p>
                        <p class="ml-5">Első csapattag:</p>
                        <p class="ml-20">Neve: {team.members[0].name}</p>
                        <p class="ml-20"> Osztálya: {team.members[0].grade}</p>
                        <p class="ml-5">Második csapattag:</p>
                        <p class="ml-20">Neve: {team.members[1].name}</p>
                        <p class="ml-20"> Osztálya: {team.members[1].grade}</p>
                        <p class="ml-5">Harmadik csapattag:</p>
                        <p class="ml-20">Neve: {team.members[2].name}</p>
                        <p class="ml-20"> Osztálya: {team.members[2].grade}</p>
                        <p class="ml-5">Pót csapattag:</p>
                        <p class="ml-20">
                          Neve:{" "}
                          {team?.supplementary_members?.at(0)?.name || "Nincs"}
                        </p>
                        <p class="ml-20">
                          {" "}
                          Osztálya:{" "}
                          {team?.supplementary_members?.at(0)?.grade || "Nincs"}
                        </p>
                        <p>intézménye: {team.school.name}</p>
                        <p>Felkészítő tanár: {team.teacher_name}</p>
                        <p>Kategória: {team.category.name}</p>
                        <p>Program nyelve: {team.prog_lang.name}</p>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            sendAlert(team.id);
                          }}
                        >
                          Figyelmeztető küldése
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>
                  <Button
                    class="bg-green-600 hover:bg-green-500"
                    onClick={() => {
                      changeaStatus(team.id);
                    }}
                  >
                    <FaSolidCheck />
                  </Button>
                </TableCell>
                <TableCell>
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
                            deleteTeam(team.id);
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

export default Teams;
