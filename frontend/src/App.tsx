import { toast, Toaster } from "solid-sonner";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

export function App() {
  return (
    <>
      <Toaster richColors={true} theme="dark" />
      <div class="flex h-screen w-full flex-col items-center justify-center gap-6 text-3xl">
        DuszaWeb 2024
        <Button
          variant="default"
          onClick={() =>
            toast.success("Event has been created.", {
              description: "asdasdasd",
            })
          }
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
    </>
  );
}
