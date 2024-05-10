import { createRoot } from "react-dom/client";
import vkBridge from "@vkontakte/vk-bridge";
import { AppConfig } from "./AppConfig.tsx";

vkBridge
  .send("VKWebAppInit")
  .then((data) => {
    if (!data.result) {
      console.log(`Ошибка VKWebAppInit: ${data}`);
    }
  })
  .catch((error) => {
    console.log(error);
  });

createRoot(document.getElementById("root")!).render(<AppConfig />);

if (import.meta.env.MODE === "development") {
  import("./eruda.ts");
}
