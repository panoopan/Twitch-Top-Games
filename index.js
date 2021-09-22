const API_URL = "https://api.twitch.tv/kraken";
const ACCEPT = "application/vnd.twitchtv.v5+json";
const CLIENT_ID = "z0vtb0aw3epmvls35t9pn8xyl65kj9";
const STRAEM_TEMPLATE = `
<div class="stream_top">
    <a href="$url" target="_blank">
        <img src="$preview">
    </a>
</div>
<div class="stream_bottom">
    <div class="stream_avatar"><img src="$logo" alt=""></div>
    <div class="stream_info">
        <div class="stream_info-title">$status</div>
        <div class="stream_info-name">$name</div>
    </div>
</div>
`;

document.querySelector("nav").addEventListener("click", function (e) {
  if (e.target.parentNode.classList.contains("nav__list")) {
    const gameName = e.target.innerText;
    changeGame(gameName);
  }
});

function appendGame(stream) {
  const div = document.createElement("div");
  div.classList.add("stream");
  div.innerHTML = STRAEM_TEMPLATE.replace("$preview", stream.preview.medium)
    .replace("$url", stream.channel.url)
    .replace("$logo", stream.channel.logo)
    .replace("$status", stream.channel.status)
    .replace("$name", stream.channel.name);
  document.querySelector(".streams__block").appendChild(div);
}

async function getGame() {
  const res = await fetch(`${API_URL}/games/top?limit=5`, {
    method: "GET",
    headers: new Headers({
      Accept: ACCEPT,
      "Client-ID": CLIENT_ID,
    }),
  });

  const json = await res.json();
  return json;
}

async function appendTopGame() {
  try {
    const json = await getGame();
    const games = json.top;
    for (let game of games) {
      const div = document.createElement("div");
      div.innerText = game.game.name;
      document.querySelector(".nav__list").appendChild(div);
    }
    changeGame(games[0].game.name);
  } catch (err) {
    console.log(err);
  }
}
appendTopGame();

async function getStream(gameName) {
  const res = await fetch(
    `${API_URL}/streams/?limit=20&game=${encodeURIComponent(gameName)}`,
    {
      method: "GET",
      headers: new Headers({
        Accept: ACCEPT,
        "Client-ID": CLIENT_ID,
      }),
    }
  );
  const json = await res.json();
  return json;
}

async function changeGame(gameName) {
  document.querySelector("h1").innerText = gameName;
  document.querySelector(".streams__block").innerHTML = "";
  try {
    const json = await getStream(gameName);
    const streams = json.streams;
    for (let stream of streams) {
      appendGame(stream);
    }
    const empty = document.createElement("div");
    empty.classList.add("stream");
    empty.classList.add("hide");
    document.querySelector(".streams__block").appendChild(empty);
  } catch (err) {
    console.log(err);
  }
}
