function exportProject() {
  const data = {
    title: "ShitOS Game",
    grid: [[0, 1], [1, 0]],
    tiles: []
  };

  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "project.gis";
  a.click();
}
document.addEventListener("DOMContentLoaded", () => {
  const exp = document.getElementById("export");
  exp.innerHTML = `<button onclick="exportProject()">💾 Сохранить проект (.gis)</button>`;
});
