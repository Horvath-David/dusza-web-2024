import { Component, createEffect, createSignal, onMount } from "solid-js";
import { BarList } from "~/components/ui/bar-list";
import { Card } from "~/components/ui/card";
import { makeRequest } from "~/lib/api";
import { Statics } from "~/lib/models";


async function getStatistics() {
    const res = await makeRequest<{
        status: string;
        error?: string;
        statistics: Statics[];
      }>({
        endpoint: "/statistics",
      });
      return res.data?.statistics ?? [];
}

const Statistics: Component<{}> = () => {

    const [statics, setStatics] = createSignal<Statics[]>();
       // const [data, setData] = createSignal([{}]);

    const data = [
        {name:"valami", value:10},
        {name:"Jó", value:15}
    ]

    onMount(async () => {
        setStatics(await getStatistics());
    //     if(statics() !== undefined){
    //         statics()[0].number_of_teams_per_schools.forEach(element => {
    //             setData([...data, {name: element.school__name, value: element.team_count}])
    //         });
    // }
    });

    createEffect(()=> {
        console.log(statics())
    });

    return(
    <div class="mx-auto flex flex-col items-center gap-4">
      <h1 class="my-8 text-2xl font-semibold">Statisztikák</h1>
      <Card class="mx-auto w-96 p-5">
      <h3 class="font-medium">Iskolák szerinti eloszlás</h3>
      <p class="mt-4 flex items-center justify-between text-muted-foreground">
        <span>Iskola</span>
        <span>Csapatok száma</span>
      </p>
      <BarList data={data} class="mt-2" />
    </Card>
    </div>
    );
}

export default Statistics;