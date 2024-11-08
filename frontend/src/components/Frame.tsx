import { Component } from "solid-js";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { toast } from "solid-sonner";
import { makeRequest } from "~/lib/api";

export const Frame: Component<{}> = () => {
  return (
    <div class="flex h-screen w-full flex-col items-center justify-center gap-6 text-3xl">
      DuszaWeb 2024
      <Button
        variant="default"
        onClick={async () => {
          const res = await makeRequest({
            endpoint: "/api/auth/login",
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
