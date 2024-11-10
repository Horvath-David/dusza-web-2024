import { Component, createSignal, onMount, Show } from "solid-js";
import { Spinner } from "~/components/Spinner";
import { BarChart, DonutChart, PieChart } from "~/components/ui/charts";
import { Card } from "~/components/ui/card";
import { makeRequest } from "~/lib/api";
import { Statics } from "~/lib/models";
import {
    Progress,
    ProgressLabel,
    ProgressValueLabel,
} from "~/components/ui/progress";
import {
    FaSolidHourglassEnd,
    FaSolidSchool
} from "solid-icons/fa";
import { FiCode } from "solid-icons/fi";
import { BiRegularCategoryAlt } from "solid-icons/bi";

async function getStatistics() {
  const res = await makeRequest<{
    status: string;
    error?: string;
    statistics: Statics;
  }>({
    endpoint: "/statistics",
  });
  return res.data?.statistics;
}

const TEAM_STATUSES: { [key: string]: string } = {
  registered: "Regisztrált",
  approved_by_organizer: "Szervező által jóváhagyva",
  approved_by_school: "Iskola által jóváhagyva",
};

const Statistics: Component<{}> = () => {
  const [statistics, setStatistics] = createSignal<Statics>();
  const [isLoading, setIsLoading] = createSignal(true);

  onMount(async () => {
    setIsLoading(true);
    setStatistics(await getStatistics());
    setIsLoading(false);
  });

  return (
    <div class="mx-auto flex flex-col items-center gap-4">
      <h1 class="my-8 text-2xl font-semibold">Statisztikák</h1>

      <Show when={!isLoading()} fallback={<Spinner></Spinner>}>
        <Card class="max-w-2xl p-5">
          <Progress
            value={
              statistics()?.number_of_teams_per_status?.find(
                (x) => x.status === "approved_by_organizer",
              )?.team_count ?? 0
            }
            minValue={0}
            maxValue={statistics()?.number_of_teams}
            class="w-[30em] space-y-1"
            getValueLabel={({ value, max }) =>
              `${value} csapat van jóváhagyva a ${max} csapatból`
            }
          >
            <div class="flex justify-between">
              <ProgressLabel>Jóváhagyott csapatok</ProgressLabel>
              <ProgressValueLabel />
            </div>
          </Progress>
        </Card>

        <h1 class="mb-2 mt-4 text-2xl font-semibold">Csapatok eloszlása</h1>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card class="flex max-w-2xl flex-col gap-4 p-5">
            <div class="flex items-center gap-4">
              <FaSolidHourglassEnd size={20} />
              <h3 class="text-lg font-semibold">Állapot szerint</h3>
            </div>
            <div class="max-h-56">
              <Show
                when={!isLoading()}
                fallback={<Spinner class="h-56 w-full" size={32} />}
              >
                <DonutChart
                  data={{
                    labels: statistics()?.number_of_teams_per_status.map(
                      (x) => TEAM_STATUSES[x.status],
                    ),
                    datasets: [
                      {
                        label: "Csapatok",
                        data:
                          statistics()?.number_of_teams_per_status.map(
                            (x) => x.team_count,
                          ) ?? [],
                      },
                    ],
                  }}
                />
              </Show>
            </div>
          </Card>

          <Card class="flex max-w-2xl flex-col gap-4 p-5">
            <div class="flex items-center gap-4">
              <FaSolidSchool size={20} />
              <h3 class="text-lg font-semibold">Iskola szerint</h3>
            </div>
            <div class="max-h-56">
              <Show
                when={!isLoading()}
                fallback={<Spinner class="h-56 w-full" size={32} />}
              >
                <PieChart
                  data={{
                    labels: statistics()?.number_of_teams_per_school.map(
                      (x) => x.school__name,
                    ),
                    datasets: [
                      {
                        label: "Csapatok",
                        data:
                          statistics()?.number_of_teams_per_school.map(
                            (x) => x.team_count,
                          ) ?? [],
                      },
                    ],
                  }}
                />
              </Show>
            </div>
          </Card>

          <Card class="flex max-w-2xl flex-col gap-4 p-5">
            <div class="flex items-center gap-4">
              <FiCode size={20} />
              <h3 class="text-lg font-semibold">Programnyelv szerint</h3>
            </div>
            <div class="max-h-56">
              <Show
                when={!isLoading()}
                fallback={<Spinner class="h-56 w-full" size={32} />}
              >
                <BarChart
                  data={{
                    labels: statistics()?.number_of_teams_per_prog_lang.map(
                      (x) => x.prog_lang__name,
                    ),
                    datasets: [
                      {
                        label: "Csapatok",
                        data:
                          statistics()?.number_of_teams_per_prog_lang.map(
                            (x) => x.team_count,
                          ) ?? [],
                      },
                    ],
                  }}
                />
              </Show>
            </div>
          </Card>

          <Card class="flex max-w-2xl flex-col gap-4 p-5">
            <div class="flex items-center gap-4">
              <BiRegularCategoryAlt size={20} />
              <h3 class="text-lg font-semibold">Kategória szerint</h3>
            </div>
            <div class="max-h-56">
              <Show
                when={!isLoading()}
                fallback={<Spinner class="h-56 w-full" size={32} />}
              >
                <DonutChart
                  data={{
                    labels: statistics()?.number_of_teams_per_category.map(
                      (x) => x.category__name,
                    ),
                    datasets: [
                      {
                        label: "Csapatok",
                        data:
                          statistics()?.number_of_teams_per_category.map(
                            (x) => x.team_count,
                          ) ?? [],
                      },
                    ],
                  }}
                />
              </Show>
            </div>
          </Card>
        </div>
      </Show>
    </div>
  );
};

export default Statistics;
