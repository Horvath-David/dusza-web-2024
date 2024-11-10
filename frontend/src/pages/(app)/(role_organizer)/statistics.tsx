import { Component, createSignal, onMount, Show } from "solid-js";
import { Spinner } from "~/components/Spinner";
import { BarChart, PieChart } from "~/components/ui/charts"
import { Card } from "~/components/ui/card";
import { makeRequest } from "~/lib/api";
import { Statics } from "~/lib/models";
import { Progress, ProgressLabel, ProgressValueLabel } from "~/components/ui/progress";



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

const Statistics: Component<{}> = () => {

    const [statics, setStatics] = createSignal<Statics>();
    const [isLoading, setIsLoading] = createSignal(true);


    const [valueOfStatus, setValueOfStatus] = createSignal(0);
    const [maxValueOfStatus, setMaxValueOfStatus] = createSignal(0);
    // const data = [{}];

    const barChartData = {
        labels: [] as string[],
        datasets: [
          {
            label: "Csapatok",
            data: [] as number[]
          }
        ]
    }
    const pieChartData = {
        labels: [] as string[],
        datasets: [
          {
            data: [] as number[]
          }
        ]
    }

    onMount(async () => {
        setStatics(await getStatistics());
        if(statics() !== undefined){
            // console.log(statics()?.number_of_teams_per_school);í
            statics()?.number_of_teams_per_school?.forEach(element => {
                pieChartData.labels.push(element.school__name)
                pieChartData.datasets[0].data.push(element.team_count)
            });
            statics()?.number_of_teams_per_prog_lang?.forEach(element => {
                barChartData.labels.push(element.prog_lang__name);
                barChartData.datasets[0].data.push(element.team_count);
            });
            statics()?.number_of_teams_per_status?.forEach(element => {
                console.log(element.team_count)
                var teamCount = element.team_count;
                if(element.status === "approved_by_organizor") {
                    setValueOfStatus(teamCount)
                }
                setMaxValueOfStatus(maxValueOfStatus()+teamCount)
            });

        }
        setIsLoading(false);
    
    });

    return(
    <div class="mx-auto flex flex-col items-center gap-4">
      <h1 class="my-8 text-2xl font-semibold">Statisztikák</h1>
      <Show when={!isLoading()} fallback={<Spinner></Spinner>}>
      <Card class="max-w-2xl p-5">
        <Progress value={valueOfStatus()} minValue={0} maxValue={maxValueOfStatus()} class="w-[30em] space-y-1" getValueLabel={({ value, max }) => `${value} csapat van jóváhagyva a ${max} csapatból`}>
        <div class="flex justify-between">
            <ProgressLabel>Jóváhagyott csapatok</ProgressLabel>
            <ProgressValueLabel />
        </div>
        </Progress>
        </Card>
        <Card class="max-h-64 max-w-2xl p-5">
            <h3>Intézmények csapat számai</h3>
        <PieChart data={pieChartData} />
        </Card>
        <Card class="max-h-64 max-w-2xl p-5">
            <h3>Programnyelvek csapatai</h3>
        <BarChart data={barChartData} />
        </Card>
      
       
    </Show>
    </div>
    );
}

export default Statistics;