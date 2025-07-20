function importGisFile(file, callback) {
  const reader = new FileReader();
  reader.onload = function () {
    const data = JSON.parse(reader.result);
    console.log("Проект загружен:", data);
    if (callback) callback(data);
  };
  reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", () => {
  const exp = document.getElementById("export");
  exp.innerHTML += `
    <hr>
    <input type="file" id="loadGis" accept=".gis" />
  `;
  document.getElementById("loadGis").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    importGisFile(file, (data) => {
      alert("✅ Загружен проект: " + data.name);
      // можно передать данные в редактор или game.js через глобальный store
      window.loadedGisProject = data;
    });
  });
});
