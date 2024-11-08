import { Toaster } from "solid-sonner";
import { Route, Router } from "@solidjs/router";
import { Frame } from "./components/Frame";
import { NewTeam } from "./components/pages/NewTeam";

export function App() {

  //vami
  return (
    <>
      <Toaster richColors={true} theme="dark" />
      <Router>
        <Route path="/" component={Frame} />
        <Route path="/new-team" component={NewTeam} />
      </Router>
    </>
  );
}
