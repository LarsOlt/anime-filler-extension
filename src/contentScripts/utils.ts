/** Will resolve if the condition is truthy */
const isTargetPage = (condition: () => unknown) =>
  new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const res = condition();

      if (res) {
        clearInterval(interval);
        resolve(res);
      }
    }, 100);
  });

export const isTVShowPage = new Promise<{ title: string }>(
  (resolve, reject) => {
    isTargetPage(
      () =>
        document.querySelector("div[data-qa-id='hubTitle']")?.textContent ===
        "Seasons",
    ).then(() => {
      resolve({
        title: document.querySelector(`div[class*="LeftTitle"] span[title]`)
          ?.textContent as string,
      });
    });
  },
);

export const isTVShowSeasonPage = new Promise<{
  season: string;
  title: string;
}>((resolve, reject) => {
  isTargetPage(() =>
    document
      .querySelector(`div[class*="PrePlaySecondaryTitle"]`)
      ?.textContent?.includes("Season"),
  ).then(() => {
    resolve({
      season: document.querySelector(`div[class*="PrePlaySecondaryTitle"]`)
        ?.textContent as string,
      title: document.querySelector(`div[class*="LeftTitle"] a[title]`)
        ?.textContent as string,
    });
  });
});

//export const isTVShowSeasonPage = isTargetPage();

export type AnimeFillerListResponse = {
  number: string;
  title: string;
  type: string;
  airdate: string;
}[];

/** Can only be called from the background scripts because of CORS */
export const getAnimeFillerList = async () => {
  const res = await fetch(
    "https://www.animefillerlist.com/shows/naruto-shippuden",
  );

  const data = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(data, "text/html");

  const parsed: AnimeFillerListResponse = [
    ...(doc.querySelectorAll(".EpisodeList tbody tr") as any),
  ]
    .map((row) => [...row.querySelectorAll("td")])
    .map((row) => {
      return {
        number: row[0].textContent,
        title: row[1].textContent,
        type: row[2].textContent,
        airdate: row[3].textContent,
      };
    });

  return parsed;
};
