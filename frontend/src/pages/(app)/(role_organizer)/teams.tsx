import { Component, createEffect, createSignal, For, onMount } from "solid-js";
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
import { BsInfoLg } from "solid-icons/bs";
import { FaSolidTrashCan } from "solid-icons/fa";
import { FaSolidCheck } from "solid-icons/fa";
import { makeRequest } from "~/lib/api";
import { Team } from "~/lib/models";
import { toast } from "solid-sonner";

async function getTeams() {
  const res = await makeRequest<{
    status: string;
    error?: string;
    teams: Team[];
  }>({
    endpoint: "/team/get/approved_by_school",
  });
  return res.data?.teams ?? [];
}

const Teams: Component<{}> = () => {
  const [allTeamInfo, setAllTeamInfo] = createSignal<Team[]>([]);

  onMount(async () => {
    setAllTeamInfo(await getTeams());
  });

  createEffect(() => console.log(allTeamInfo()));

  async function sendAlert(idNum: number) {
    const res = await makeRequest({
      method: "POST",
      endpoint: `/team/${idNum}/request_info_fix`,
      body: {},
    });
    if (res.status === 304) {
      toast.warning("Már küldtek értesítést ennek a csapatnak");
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
