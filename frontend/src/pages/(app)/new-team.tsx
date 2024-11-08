import { Component, createEffect, createSignal, onMount} from "solid-js";
import {
  TextField,
  TextFieldLabel,
  TextFieldInput,
} from "~/components/ui/text-field.tsx";
// import { Combobox, ComboboxContent, ComboboxControl, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxItemLabel, ComboboxSection, ComboboxTrigger} from "../ui/combobox.tsx"
import { OcArrowdown2 } from "solid-icons/oc";
import { Button } from "~/components/ui/button.tsx";

import { Combobox } from "@kobalte/core/combobox";
import { makeRequest } from "~/lib/api";
import { Category, ProgrammingLanguage, School } from "~/lib/models";
// import { create } from "domain";
import { createStore } from "solid-js/store";

const ALL_SHOOL = ["Mechwart", "Fazekas", "TÁG"];

// const ALL_CATEGORY = ["Info", "Web", "Hálózat"];

// const ALL_PROGRAMMING_LANGS = ["Python", "Java", "C#"];

async function getProgLangs() {
  const res = await makeRequest<{
    status: string;
    error?: string;
    list: ProgrammingLanguage[];
  }>({
    endpoint: "/prog_lang/all",
  });
  return res.data;
}

async function getCategory() {
  const res = await makeRequest<{
    status: string;
    error?: string;
    list: Category[];
  }>({
    endpoint: "/category/all",
  });
  return res.data;
}

async function getSchool() {
  const res = await makeRequest<{
    status: string;
    error?: string;
    list: School[];
  }>({
    endpoint: "/school/all",
  });
  return res.data;
}



const NewTeam: Component<{}> = (props) => {
  const [teamName, setTeamName] = createSignal("");

  const [teamMateOneName, setTeamMateOneName] = createSignal("");
  const [teamMateOneGrade, setTeamMateOneGrade] = createSignal(0);
  const [teamMateSecondName, setTeamMateSecondName] = createSignal("");
  const [teamMateSecondGrade, setTeamMateSecondGrade] = createSignal(0);
  const [teamMateThirdName, setTeamMateThirdName] = createSignal("");
  const [teamMateThirdGrade, setTeamMateThirdGrade] = createSignal(0);
  const [substituteTeamMateName, setSubstitudeTeamMateName] = createSignal("");
  const [substituteTeamMateGrade, setSubstitudeTeamMateGrade] = createSignal(0);


  const [allProgLang, setAllProgLang] = createStore([""]);
  const [allCategory, setAllCategory] = createStore([""]);
  const [allSchool, setAllSchool] = createStore([""]);

  const [allProgLangObj, setAllProgLangObj] = createStore([{}]);
  const [allCategoryObj, setAllCategoryObj] = createStore([{}]);
  const [allSchoolObj, setAllSchoolObj] = createStore([{}]);

  const [teacher, setTeacher] = createSignal("");

  onMount(async () => {
    const resProg = await getProgLangs();
    resProg?.list.forEach(element => {
      setAllProgLang([...allProgLang, element.name]);
      setAllProgLangObj([...allProgLangObj, {"id": element.id, "name": element.name}])
    });

    const resCat = await getCategory();
    resCat?.list.forEach(element => {
      setAllCategory([...allCategory, element.name])
      setAllCategoryObj([...allCategoryObj, {"id": element.id, "name": element.name}])
    });
    
    const resSch = await getSchool();
    resSch?.list.forEach(element => {
      setAllSchool([...allSchool, element.name])
      setAllSchoolObj([...allSchoolObj, {"id": element.id, "name": element.name}])
    });
  });

  // createEffect(()=> {
  //   // console.log(allProgLangObj.find(x => x.name === programmingLang()))
  // })

  const [school, setSchool] = createSignal("");
  const [category, setCategory] = createSignal("");
  const [programmingLang, setProgrammingLang] = createSignal("");

  return (
    <>
      <h1>Új csapat regisztrálása</h1>
      <div>
        <TextField class="grid" value={teamName()} onChange={setTeamName}>
          <TextFieldLabel>Csapatnév:</TextFieldLabel>
          <TextFieldInput type="text" name="teamNameInput"></TextFieldInput>
        </TextField>
        <div>
          <h2>Csapattagok: </h2>
          <TextField
            class="grid"
            value={teamMateOneName()}
            onChange={setTeamMateOneName}
          >
            <TextFieldLabel>Első csapattag neve: </TextFieldLabel>
            <TextFieldInput type="text" name="teamMateOneName"></TextFieldInput>
          </TextField>
          <TextField onChange={setTeamMateOneGrade}>
            <TextFieldLabel>Első csapattag osztálya: </TextFieldLabel>
            <TextFieldInput type="number" min={1} max={13}></TextFieldInput>
          </TextField>
          <TextField
            class="grid"
            value={teamMateSecondName()}
            onChange={setTeamMateSecondName}
          >
            <TextFieldLabel>Második csapattag neve: </TextFieldLabel>
            <TextFieldInput
              type="text"
              name="teamMateSecondName"
            ></TextFieldInput>
          </TextField>
          <TextField onChange={setTeamMateSecondGrade}>
            <TextFieldLabel>Második csapattag osztálya: </TextFieldLabel>
            <TextFieldInput type="number" min={1} max={13}></TextFieldInput>
          </TextField>
          <TextField
            class="grid"
            value={teamMateThirdName()}
            onChange={setTeamMateThirdName}
          >
            <TextFieldLabel>Harmadik csapattag neve: </TextFieldLabel>
            <TextFieldInput
              type="text"
              name="teamMateThirdName"
            ></TextFieldInput>
          </TextField>
          <TextField onChange={setTeamMateThirdGrade}>
            <TextFieldLabel>Harmadik csapattag osztálya: </TextFieldLabel>
            <TextFieldInput type="number" min={1} max={13}></TextFieldInput>
          </TextField>
          <TextField
            class="grid"
            value={substituteTeamMateName()}
            onChange={setSubstitudeTeamMateName}
          >
            <TextFieldLabel>Pót csapattag neve: </TextFieldLabel>
            <TextFieldInput
              type="text"
              name="substitudeTeamMateName"
            ></TextFieldInput>
          </TextField>
          <TextField onChange={setSubstitudeTeamMateGrade}>
            <TextFieldLabel>Pót csapattag osztálya: </TextFieldLabel>
            <TextFieldInput type="number" min={1} max={13}></TextFieldInput>
          </TextField>
        </div>
        <TextField class="grid" value={teacher()} onChange={setTeacher}>
          <TextFieldLabel>Felkészítő tanár neve: </TextFieldLabel>
          <TextFieldInput type="text" name="teachersName"></TextFieldInput>
        </TextField>

        <Combobox
          options={allSchool}
          placeholder="Válassz egy iskolát"
          itemComponent={(props) => (
            <Combobox.Item
              item={props.item}
              class="duration-20000 transition-colors hover:bg-blue-950"
            >
              <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
              <Combobox.ItemIndicator />
            </Combobox.Item>
          )}
          value={school()}
          onChange={setSchool}
        >
          <Combobox.Label>Csapat iskolája:</Combobox.Label>
          <Combobox.Control class="combobox__control" aria-label="Fruit">
            <Combobox.Input class="combobox__input bg-black" />
            <Combobox.Trigger>
              <Combobox.Icon>
                <OcArrowdown2 />
              </Combobox.Icon>
            </Combobox.Trigger>
          </Combobox.Control>

          <Combobox.Portal>
            <Combobox.Content class="bg-black">
              <Combobox.Listbox />
            </Combobox.Content>
          </Combobox.Portal>
        </Combobox>
        <br />

        <Combobox
          options={allCategory}
          placeholder="Válassz egy kategóriát"
          itemComponent={(props) => (
            <Combobox.Item
              item={props.item}
              class="duration-20000 transition-colors hover:bg-blue-950"
            >
              <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
              <Combobox.ItemIndicator />
            </Combobox.Item>
          )}
          value={category()}
          onChange={setCategory}
        >
          <Combobox.Label>Csapat kategóriája:</Combobox.Label>
          <Combobox.Control class="combobox__control" aria-label="Fruit">
            <Combobox.Input class="combobox__input bg-black" />
            <Combobox.Trigger>
              <Combobox.Icon>
                <OcArrowdown2 />
              </Combobox.Icon>
            </Combobox.Trigger>
          </Combobox.Control>

          <Combobox.Portal>
            <Combobox.Content class="bg-black">
              <Combobox.Listbox />
            </Combobox.Content>
          </Combobox.Portal>
        </Combobox>

        <br />

        <Combobox
          options={allProgLang}
          placeholder="Válassz egy programnyelvet"
          itemComponent={(props) => (
            <Combobox.Item
              item={props.item}
              class="duration-20000 transition-colors hover:bg-blue-950"
            >
              <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
              <Combobox.ItemIndicator />
            </Combobox.Item>
          )}
          value={programmingLang()}
          onChange={setProgrammingLang}
        >
          <Combobox.Label>Csapat programnyelve:</Combobox.Label>
          <Combobox.Control class="combobox__control" aria-label="Fruit">
            <Combobox.Input class="combobox__input bg-black" />
            <Combobox.Trigger>
              <Combobox.Icon>
                <OcArrowdown2 />
              </Combobox.Icon>
            </Combobox.Trigger>
          </Combobox.Control>

          <Combobox.Portal>
            <Combobox.Content class="bg-black">
              <Combobox.Listbox />
            </Combobox.Content>
          </Combobox.Portal>
        </Combobox>

        <br />
        <Button>Beadás</Button>

        {/* <p>{console.log(allProgLangObj)}</p> */}
      </div>
    </>
  );
};

export default NewTeam;
