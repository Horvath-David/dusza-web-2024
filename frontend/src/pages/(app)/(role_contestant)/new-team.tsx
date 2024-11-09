import { Component, createSignal, onMount } from "solid-js";
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
import { Category, ProgrammingLanguage, School } from "~/lib/models";
import {
  NumberField,
  NumberFieldDecrementTrigger,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from "~/components/ui/number-field";
import { Label } from "~/components/ui/label";
import { toast } from "solid-sonner";

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

  onMount(async () => {
    setAllSchool(await getSchool());
    setAllCategory(await getCategory());
    setAllProgLang(await getProgLangs());
  });

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    // console.log(school()?.value, category()?.value, programmingLang()?.value, teamMateOneName(), teamMateOneGrade().valueOf, teacher().valueOf, teamName().valueOf)
    const res = await makeRequest({
      method: "POST",
      endpoint: "/team/create",
      body: {
        team_name: teamName(),
        school_id: school()?.id,
        names: [teamMateOneName(), teamMateSecondName(), teamMateThirdName()],
        grades: [
          teamMateOneGrade(),
          teamMateSecondGrade(),
          teamMateThirdGrade(),
        ],
        supplementary_names: [substituteTeamMateName()],
        supplementary_grades: [substituteTeamMateGrade()],
        teacher_name: teacher(),
        category_id: category()?.id,
        prog_lang_id: programmingLang()?.id,
      },
    });
    console.log(res);
    if(res.status===200) {
      toast.success("Sikeres hozzáadás");
      setTeamName("");
      setTeamMateOneName("");
      setTeamMateOneGrade(8);
      setTeamMateSecondName("");
      setTeamMateSecondGrade(8);
      setTeamMateThirdName("");
      setTeamMateThirdGrade(8);
      setSubstitudeTeamMateName("");
      setSubstitudeTeamMateGrade(8);
      setTeacher("");
    }
    else {
      toast.error("Hiba történt")
    }
  };

  return (
    <div class="mx-auto flex max-w-sm flex-col items-center gap-4">
      <h1 class="my-8 text-2xl font-semibold">Új csapat regisztrálása</h1>
      <form onSubmit={handleSubmit}>
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
          Beadás
        </Button>
      </form>
    </div>
  );
};

export default NewTeam;
