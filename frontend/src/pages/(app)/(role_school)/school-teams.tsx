import {
  Component,
  createEffect,
  createSignal,
  For,
  onMount,
  Show,
} from "solid-js";
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
  FaSolidFile,
  FaSolidHourglassEnd,
  FaSolidPersonChalkboard,
  FaSolidSchool,
  FaSolidTrashCan,
  FaSolidXmark,
} from "solid-icons/fa";
import { FaSolidCheck } from "solid-icons/fa";
import { API_URL, makeRequest } from "~/lib/api";
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
import { FileUploader } from "~/components/FileUploader";

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

  const [deleting, setDeleting] = createSignal(false);

  onMount(async () => {
    setAllTeamInfo(await getTeams());
  });

  async function handleDelete(team: Team) {
    setDeleting(true);
    const res = await makeRequest({
      endpoint: `/team/${team.id}/manage`,
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Sikeres törlés");
      setAllTeamInfo(allTeamInfo().filter((x) => x.id !== team.id));
    }
    setDeleting(false);
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
                  const [image, setImage] = createSignal("");
                  const [imageOpen, setImageOpen] = createSignal(false);
                  const [status, setStatus] = createSignal("");

                  createEffect(async () => {
                    if (open()) {
                      setStatus(team.status);
                      console.log(team.status);
                      if (team.status !== "registered") {
                        const res = await makeRequest({
                          endpoint: `/file/get/team/${team.id}`,
                        });
                        if (res.ok) {
                          console.log(res.data);
                          setImage(
                            `${API_URL}/file/get/${res?.data?.files?.at(0)}`,
                          );
                        }
                      }
                    }
                  });

                  return (
                    <>
                      <Dialog open={open()} onOpenChange={setOpen}>
                        <DialogTrigger class="ml-auto">
                          <Button variant="secondary">Kezelés</Button>
                        </DialogTrigger>
                        <DialogContent
                          noDefaultCloseButton={true}
                          class="overflow-hidden py-4"
                        >
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
                                  Felkészítő tanár(ok)
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
                          <DialogFooter class="-mx-2 flex-row gap-4">
                            <Button
                              variant="destructive"
                              class="flex-1"
                              onClick={() => handleDelete(team)}
                              disabled={deleting()}
                            >
                              <Show when={!deleting()} fallback={<Spinner />}>
                                <FaSolidTrashCan />
                              </Show>
                              Törlés
                            </Button>
                            <Show when={status() !== "registered"}>
                              <Button
                                variant="default"
                                class="flex-1"
                                onClick={() => setImageOpen(true)}
                              >
                                <FaSolidFile />
                                Jelentkezési lap
                              </Button>
                            </Show>
                            <Show when={status() === "registered"}>
                              <FileUploader
                                uid="reg-document"
                                onComplete={(url) => {
                                  setImage(url);
                                  setImageOpen(true);
                                  setStatus("approved_by_school");
                                }}
                                team={team.id}
                                class="flex-1"
                              >
                                <Button variant="default" class="w-full">
                                  <FaSolidCheck />
                                  Jóváhagyás
                                </Button>
                              </FileUploader>
                            </Show>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={imageOpen()} onOpenChange={setImageOpen}>
                        <DialogContent
                          noDefaultCloseButton={true}
                          class="h-[calc(100vh-3rem)] max-w-[calc(100vw-3rem)] overflow-hidden py-4"
                        >
                          <DialogHeader class="flex-row items-center">
                            <DialogTitle class="text-xl">
                              {team.name} jelentkezési lapja
                            </DialogTitle>
                            <Button
                              size="icon"
                              variant="secondary"
                              class="-mr-2 ml-auto"
                              onClick={() => setImageOpen(false)}
                            >
                              <FaSolidXmark
                                size={20}
                                class="text-muted-foreground"
                              />
                            </Button>
                          </DialogHeader>
                          <Hr padding="1.5rem" />

                          <img
                            src={image()}
                            alt={`${team.name} jelentkezési lapja`}
                            class="mx-auto max-h-[70vh]"
                          />

                          <Hr padding="1.5rem" />
                          <DialogFooter class="-mx-2 flex gap-4">
                            <Button
                              variant="default"
                              onClick={() => setImageOpen(false)}
                            >
                              <FaSolidXmark />
                              Bezárás
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
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
