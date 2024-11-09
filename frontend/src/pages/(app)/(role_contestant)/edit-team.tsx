import { Component, createSignal, onMount, Show } from "solid-js";
import {
  TextField,
  TextFieldLabel,
  TextFieldInput,
} from "~/components/ui/text-field.tsx";
import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemLabel,
  ComboboxTrigger,
} from "~/components/ui/combobox.tsx";
import { Button } from "~/components/ui/button.tsx";
import { makeRequest } from "~/lib/api";
import { Category, ProgrammingLanguage, School, Team } from "~/lib/models";
import {
  NumberField,
  NumberFieldDecrementTrigger,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from "~/components/ui/number-field";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/Spinner";
import { toast } from "solid-sonner";
import { useUser } from "~/lib/userContext";
import { FaSolidFloppyDisk } from "solid-icons/fa";

async function getProgLangs() {
  const res = await makeRequest<{
    status: string;
    error?: string;
    list: ProgrammingLanguage[];
  }>({
    endpoint: "/prog_lang/all",
  });
  return res.data?.list ?? [];
}

async function getCategory() {
  const res = await makeRequest<{
    status: string;
    error?: string;
    list: Category[];
  }>({
    endpoint: "/category/all",
  });
  return res.data?.list ?? [];
}

async function getSchool() {
  const res = await makeRequest<{
    status: string;
    error?: string;
    list: School[];
  }>({
    endpoint: "/school/all",
  });
  return res.data?.list ?? [];
}

const NewTeam: Component<{}> = () => {
  const user = useUser()!;

  const [teamName, setTeamName] = createSignal("");

  const [teamMateOneName, setTeamMateOneName] = createSignal("");
  const [teamMateOneGrade, setTeamMateOneGrade] = createSignal(8);
  const [teamMateSecondName, setTeamMateSecondName] = createSignal("");
  const [teamMateSecondGrade, setTeamMateSecondGrade] = createSignal(8);
  const [teamMateThirdName, setTeamMateThirdName] = createSignal("");
  const [teamMateThirdGrade, setTeamMateThirdGrade] = createSignal(8);
  const [substituteTeamMateName, setSubstitudeTeamMateName] = createSignal("");
  const [substituteTeamMateGrade, setSubstitudeTeamMateGrade] = createSignal(8);

  const [teacher, setTeacher] = createSignal("");

  const [allSchool, setAllSchool] = createSignal<School[]>([]);
  const [allCategory, setAllCategory] = createSignal<Category[]>([]);
  const [allProgLang, setAllProgLang] = createSignal<ProgrammingLanguage[]>([]);

  const [school, setSchool] = createSignal<School>();
  const [category, setCategory] = createSignal<Category>();
  const [programmingLang, setProgrammingLang] =
    createSignal<ProgrammingLanguage>();

  const [loading, setLoading] = createSignal(true);
  const [saving, setSaving] = createSignal(false);

  onMount(async () => {
    setLoading(true);

    setAllSchool(await getSchool());
    setAllCategory(await getCategory());
    setAllProgLang(await getProgLangs());

    const teamRes = await makeRequest<{
      status: string;
      error?: string;
      team: Team;
    }>({
      endpoint: "/team/me",
      method: "GET",
    });

    const team = teamRes.data?.team;

    setTeamName(team?.name ?? "");
    setTeamMateOneName(team?.members?.at(0)?.name ?? "");
    setTeamMateSecondName(team?.members?.at(1)?.name ?? "");
    setTeamMateThirdName(team?.members?.at(2)?.name ?? "");
    setSubstitudeTeamMateName(team?.supplementary_members?.at(0)?.name ?? "");
    setTeamMateOneGrade(team?.members?.at(0)?.grade ?? 8);
    setTeamMateSecondGrade(team?.members?.at(1)?.grade ?? 8);
    setTeamMateThirdGrade(team?.members?.at(2)?.grade ?? 8);
    setSubstitudeTeamMateGrade(team?.supplementary_members?.at(0)?.grade ?? 8);
    setTeacher(team?.teacher_name ?? "");

    setSchool(team?.school);
    setCategory(team?.category);
    setProgrammingLang(team?.prog_lang);

    setLoading(false);
  });

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    if (!school()) {
      toast.error("Hibás iskola!");
      return;
    }
    if (!category()) {
      toast.error("Hibás kategória!");
      return;
    }
    if (!programmingLang()) {
      toast.error("Hibás programnyelv!");
      return;
    }

    setSaving(true);

    const res = await makeRequest({
      endpoint: `/team/${user()?.team_id}/manage`,
      method: "PATCH",
      body: {
        name: teamName(),
        school: school()?.id,
        members: [
          {
            name: teamMateOneName(),
            grade: teamMateOneGrade(),
          },
          {
            name: teamMateSecondName(),
            grade: teamMateSecondGrade(),
          },
          {
            name: teamMateThirdName(),
            grade: teamMateThirdGrade(),
          },
        ],
        supplementary_members: [
          {
            name: substituteTeamMateName(),
            grade: substituteTeamMateGrade(),
          },
        ],
        teacher_name: teacher(),
        category: category()?.id,
        prog_lang: programmingLang()?.id,
      },
    });

    if (res.ok) {
      toast.success("Sikeres mentés!");
    }

    setSaving(false);
  };

  return (
    <form
      class="mx-auto flex max-w-sm flex-col items-center gap-4"
      onSubmit={handleSubmit}
    >
      <h1 class="my-8 text-2xl font-semibold">Csapat szerkesztése</h1>

      <Show when={!loading()} fallback={<Spinner />}>
        <TextField
          class="max-w-full"
          value={teamName()}
          onChange={setTeamName}
          required
        >
          <TextFieldLabel>Csapatnév:</TextFieldLabel>
          <TextFieldInput type="text" name="teamNameInput"></TextFieldInput>
        </TextField>
        <h2 class="mb-4 mt-8 text-xl font-semibold">Csapattagok: </h2>
        {/* Teammate #1 */}
        <div class="flex gap-4">
          <TextField
            value={teamMateOneName()}
            onChange={setTeamMateOneName}
            required
          >
            <TextFieldLabel>Első csapattag neve: </TextFieldLabel>
            <TextFieldInput type="text" />
          </TextField>
          <NumberField
            required
            class="grid w-full max-w-xs flex-1 basis-24 items-center gap-1.5"
            minValue={8}
            maxValue={13}
            value={teamMateOneGrade()}
            onChange={setTeamMateOneGrade}
          >
            <NumberFieldLabel>Osztálya:</NumberFieldLabel>
            <NumberFieldGroup>
              <NumberFieldInput />
              <NumberFieldIncrementTrigger />
              <NumberFieldDecrementTrigger />
            </NumberFieldGroup>
          </NumberField>
        </div>
        {/* Teammate #2 */}
        <div class="flex gap-4">
          <TextField
            required
            value={teamMateSecondName()}
            onChange={setTeamMateSecondName}
          >
            <TextFieldLabel>Második csapattag neve: </TextFieldLabel>
            <TextFieldInput type="text" />
          </TextField>
          <NumberField
            required={true}
            class="grid w-full max-w-xs flex-1 basis-24 items-center gap-1.5"
            minValue={8}
            maxValue={13}
            value={teamMateSecondGrade()}
            onChange={setTeamMateSecondGrade}
          >
            <NumberFieldLabel>Osztálya:</NumberFieldLabel>
            <NumberFieldGroup>
              <NumberFieldInput />
              <NumberFieldIncrementTrigger />
              <NumberFieldDecrementTrigger />
            </NumberFieldGroup>
          </NumberField>
        </div>
        {/* Teammate #3 */}
        <div class="flex gap-4">
          <TextField
            value={teamMateThirdName()}
            onChange={setTeamMateThirdName}
            required={true}
          >
            <TextFieldLabel>Harmadik csapattag neve: </TextFieldLabel>
            <TextFieldInput type="text" />
          </TextField>
          <NumberField
            required
            class="grid w-full max-w-xs flex-1 basis-24 items-center gap-1.5"
            minValue={8}
            maxValue={13}
            value={teamMateThirdGrade()}
            onChange={setTeamMateThirdGrade}
          >
            <NumberFieldLabel>Osztálya:</NumberFieldLabel>
            <NumberFieldGroup>
              <NumberFieldInput />
              <NumberFieldIncrementTrigger />
              <NumberFieldDecrementTrigger />
            </NumberFieldGroup>
          </NumberField>
        </div>
        {/* Substitute teammate */}
        <div class="flex gap-4">
          <TextField
            value={substituteTeamMateName()}
            onChange={setSubstitudeTeamMateName}
          >
            <TextFieldLabel>Pót csapattag neve: </TextFieldLabel>
            <TextFieldInput type="text" />
          </TextField>
          <NumberField
            class="grid w-full max-w-xs flex-1 basis-24 items-center gap-1.5"
            minValue={8}
            maxValue={13}
            value={substituteTeamMateGrade()}
            onChange={setSubstitudeTeamMateGrade}
          >
            <NumberFieldLabel>Osztálya:</NumberFieldLabel>
            <NumberFieldGroup>
              <NumberFieldInput />
              <NumberFieldIncrementTrigger />
              <NumberFieldDecrementTrigger />
            </NumberFieldGroup>
          </NumberField>
        </div>
        <h2 class="mb-4 mt-8 text-xl font-semibold">További adatok: </h2>
        <TextField
          required
          class="max-w-full"
          value={teacher()}
          onChange={setTeacher}
        >
          <TextFieldLabel>Felkészítő tanár neve: </TextFieldLabel>
          <TextFieldInput type="text" />
        </TextField>
        {/* School selection */}
        <Combobox<School>
          required
          options={allSchool()}
          optionValue="id"
          optionTextValue="name"
          optionLabel="name"
          placeholder="Válassz iskolát..."
          class="w-full"
          value={school()}
          onChange={(val) => setSchool(val || undefined)}
          itemComponent={(props) => (
            <ComboboxItem item={props.item}>
              <ComboboxItemLabel>{props.item.rawValue.name}</ComboboxItemLabel>
              <ComboboxItemIndicator />
            </ComboboxItem>
          )}
        >
          <Label class="mb-1.5 block">Csapat iskolája:</Label>
          <ComboboxControl>
            <ComboboxInput />
            <ComboboxTrigger />
          </ComboboxControl>
          <ComboboxContent />
        </Combobox>
        {/* Category selection */}
        <Combobox<Category>
          required
          options={allCategory()}
          optionValue="id"
          optionTextValue="name"
          optionLabel="name"
          placeholder="Válassz kategóriát..."
          class="w-full"
          value={category()}
          onChange={(val) => setCategory(val || undefined)}
          itemComponent={(props) => (
            <ComboboxItem item={props.item}>
              <ComboboxItemLabel>{props.item.rawValue.name}</ComboboxItemLabel>
              <ComboboxItemIndicator />
            </ComboboxItem>
          )}
        >
          <Label class="mb-1.5 block">Csapat kategóriája:</Label>
          <ComboboxControl>
            <ComboboxInput />
            <ComboboxTrigger />
          </ComboboxControl>
          <ComboboxContent />
        </Combobox>
        {/* Language selection */}
        <Combobox<ProgrammingLanguage>
          required
          options={allProgLang()}
          optionValue="id"
          optionTextValue="name"
          optionLabel="name"
          placeholder="Válassz programnyelvet..."
          class="w-full"
          value={programmingLang()}
          onChange={(val) => setProgrammingLang(val || undefined)}
          itemComponent={(props) => (
            <ComboboxItem item={props.item}>
              <ComboboxItemLabel>{props.item.rawValue.name}</ComboboxItemLabel>
              <ComboboxItemIndicator />
            </ComboboxItem>
          )}
        >
          <Label class="mb-1.5 block">Csapat programnyelve:</Label>
          <ComboboxControl>
            <ComboboxInput />
            <ComboboxTrigger />
          </ComboboxControl>
          <ComboboxContent />
        </Combobox>
        <Button class="mb-4 mt-6 w-full" type="submit">
          <Show when={!saving()} fallback={<Spinner />}>
            <FaSolidFloppyDisk />
          </Show>
          Mentés
        </Button>
      </Show>
    </form>
  );
};

export default NewTeam;
