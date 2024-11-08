import { Component, onMount } from "solid-js";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { toast } from "solid-sonner";
import { makeRequest } from "~/lib/api";
import { currentUser } from "~/lib/signals";

const Home: Component<{}> = () => {
  onMount(() => {
    console.log(currentUser());
  });

  return (
    <div class="flex h-full w-full flex-col items-center justify-center gap-6 text-3xl">
      DuszaWeb 2024
      {currentUser()?.id}
      <Button
        variant="default"
        onClick={async () => {
          const res = await makeRequest({
            endpoint: "/auth/login",
            method: "POST",
            body: {
              username: "husky",
              password: "asd",
            },
          });
          console.log(res);
          if (res.ok)
            toast.success("Sikeres", {
              description: JSON.stringify(res.data),
            });
        }}
      >
        Button
      </Button>
      <div class="flex gap-2">
        <Checkbox id="terms1" />
        <div class="grid gap-1.5 leading-none">
          <Label for="terms1-input">Accept terms and conditions</Label>
          <p class="text-sm text-muted-foreground">
            You agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
