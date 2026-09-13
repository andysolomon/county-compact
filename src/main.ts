import { createMenuScreen } from "./ui/screens/menu";
import { createSelectScreen } from "./ui/screens/select";
import { createStrategicScreen } from "./ui/screens/strategic";
import { store } from "./ui/store";
import { h } from "./ui/dom";

const app = document.getElementById("app")!;
const menu = createMenuScreen(store);
const select = createSelectScreen(store);
const strategic = createStrategicScreen(store);
let current: HTMLElement | undefined;
const toast = h("div", { class: "toast", role: "status", hidden: true });
document.body.appendChild(toast);

function render(): void {
  const target = store.ui.screen === "menu" ? menu : store.ui.screen === "select" ? select : strategic;
  if (current !== target.el) {
    if (current) current.remove();
    app.appendChild(target.el);
    current = target.el;
    target.mounted();
  }
  target.render();
  toast.textContent = store.ui.toast ?? "";
  toast.hidden = !store.ui.toast;
}

store.subscribe(render);
render();

document.addEventListener("keydown", (e) => {
  const tag = (e.target as HTMLElement | null)?.tagName;
  const editable = tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";
  if (store.ui.screen !== "map" || !store.state) return;
  if (e.key === " " && !editable) { e.preventDefault(); store.setPaused(!store.state.paused); }
  else if (!editable && (e.key === "1" || e.key === "2" || e.key === "3")) store.setSpeed(e.key === "1" ? 1 : e.key === "2" ? 4 : 12);
  else if (e.key === "Escape") strategic.escape();
});
