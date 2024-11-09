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
  FaSolidPersonChalkboard,
  FaSolidSchool,
  FaSolidXmark,
} from "solid-icons/fa";
import { FaSolidCheck } from "solid-icons/fa";
import { makeRequest } from "~/lib/api";
import { Team } from "~/lib/models";
import { toast } from "solid-sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { BiRegularCategoryAlt } from "solid-icons/bi";
import { FiCode } from "solid-icons/fi";
import { Badge } from "~/components/ui/badge";
import { Hr } from "~/components/Sidebar";
import { Spinner } from "~/components/Spinner";

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

  const [approving, setApproving] = createSignal(false);

  onMount(async () => {
    setAllTeamInfo(await getTeams());
  });

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
    toast.warning("Még nincs kész a feltöltős dolog");
    setApproving(false);
  }

  return (
    <div class="mx-auto flex flex-col items-center gap-4">
      <h1 class="my-8 text-2xl font-semibold">Csapatok</h1>

      <div class="grid w-full max-w-3xl grid-cols-1 gap-4">
        <For each={allTeamInfo()}>
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
                                  ?.map((x) => `${x.name} (${x.grade}. - pót)`)
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

                        <Show when={team.status === "registered"}>
                          <Hr padding="1.5rem" />
                          <DialogFooter class="-mx-2 flex-col gap-4">
                            <Button
                              variant="default"
                              onClick={() => {
                                approveTeam(team.id);
                              }}
                              disabled={approving()}
                            >
                              <Show when={!approving()} fallback={<Spinner />}>
                                <FaSolidCheck />
                              </Show>
                              Jóváhagyás
                            </Button>
                          </DialogFooter>
                        </Show>
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
    </div>
  );
};

export default Teams;
