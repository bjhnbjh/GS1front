const player = videojs("my-video");

const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const infoIcon = new Image();
infoIcon.src = "https://cdn-icons-png.flaticon.com/512/1828/1828817.png"; // ⓘ 아이콘

let currentPolygons = []; // cue마다 저장된 폴리곤 정보들

function drawPolygonGlow(polygon, width = canvas.width, height = canvas.height) {
  ctx.beginPath();
  ctx.moveTo(polygon[0][0] * width, polygon[0][1] * height);
  polygon.slice(1).forEach(([x, y]) => {
    ctx.lineTo(x * width, y * height);
  });
  ctx.closePath();
  ctx.stroke();

  // 후광 효과 (파란색)
  ctx.shadowColor = "rgba(0, 150, 255, 1)";
  ctx.shadowBlur = 25;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = "rgba(0, 150, 255, 1)"; // 거의 보이지 않는 선
  ctx.lineWidth = 3;
  ctx.stroke();

  // shadow 사용 후 반드시 리셋
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}

player.ready(() => {
  const track = player.textTracks()[0];
  track.mode = "hidden";

  console.log("Track: ", track);
  track.addEventListener("cuechange", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentPolygons = [];

    const cues = Array.from(track.activeCues);

    for (let cue of cues) {
      const data = JSON.parse(cue.text);
      const originalPolygon = data.polygon[0];
      console.log("Original Polygon: ", originalPolygon);
      //   const scaledPolygon = originalPolygon.map(([x, y]) => [x * 1280, y * 720]);
      //   const scaledPolygon = originalPolygon.map(([x, y]) => [x * 640, y * 360]);
      const scaledPolygon = originalPolygon.map(([x, y]) => [x / canvas.width, y / canvas.height]);

      console.log("Scaled Polygon: ", scaledPolygon);
      drawPolygonGlow(scaledPolygon);
      currentPolygons.push({ scaledPolygon, cue });
    }
  });
});
