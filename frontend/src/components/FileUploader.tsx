import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import { type Component, type JSXElement, onMount } from "solid-js";
import { Uppy } from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import Hungarian from "@uppy/locales/lib/hu_HU";
import { toast } from "solid-sonner";
import XHRUpload from "@uppy/xhr-upload";
import { API_URL } from "~/lib/api";

export const FileUploader: Component<{
  children: JSXElement;
  onComplete: (url: string) => any;
  uid: string;
  team: number;
  class?: string;
}> = (props) => {
  const triggerId = `uppy-trigger-${props.uid}`;
  const targetId = `uppy-target-${props.uid}`;

  onMount(() => {
    const uppyDashboard = new Uppy({
      debug: import.meta.env.DEV,
      locale: Hungarian,
      allowMultipleUploadBatches: false,
      restrictions: {
        allowedFileTypes: [
          "image/jpg",
          "image/jpeg",
          "image/png",
          "image/webp",
        ],
        maxNumberOfFiles: 1,
      },
    })
      .use(Dashboard, {
        inline: false,
        theme: "dark",
        hideCancelButton: true,
        trigger: `#${triggerId}`,
        target: `#${targetId}`,
        showProgressDetails: true,
        closeModalOnClickOutside: true,
        disablePageScrollWhenModalOpen: false,
      })
      .use(XHRUpload, {
        endpoint: `${API_URL}/file/upload/${props.team}`,
        withCredentials: true,
      });

    uppyDashboard.on("complete", async (result) => {
      import.meta.env.DEV && console.log("[uppy]", "upload result:", result);
      const res = result.successful?.at(0)?.response;
      if (res?.status !== 200) {
        toast.error("Hiba történt!", {
          description: "Kérjük próbálja újra később",
        });
        console.log("asdasd");
      }
      const url = `${API_URL}/file/get/${res?.body?.file_name}`;
      props.onComplete(url);
    });

    uppyDashboard.on("progress", (res) => {
      import.meta.env.DEV && console.log("[uppy]", "progress:", res);
      if (res == 100) {
        let files = uppyDashboard.getFiles();
        if (!files.length) return;
        uppyDashboard.pauseResume(files[0].id);
        uppyDashboard.pauseResume(files[0].id);
      }
    });
  });

  return (
    <div class={props?.class}>
      <div id={triggerId} class="w-full cursor-pointer">
        {props.children}
      </div>
      <div id={targetId}></div>
    </div>
  );
};
