import type { Article } from "./types";
// Original illustrative copy, not reported events. Links go to resource pages.
const stories = [
  [
    "science",
    "A closer look at the planet we call home",
    "From the ocean floor to the atmosphere, a changing climate offers a new perspective on our shared world.",
    "NASA Earth Observatory",
    "https://earthobservatory.nasa.gov/",
    "photo-1446776811953-b23d57bd21aa",
  ],
  [
    "technology",
    "The next chapter of AI is being written in the open",
    "Researchers are asking what more transparent, useful technology could look like.",
    "MIT Technology Review",
    "https://www.technologyreview.com/topic/artificial-intelligence/",
    "photo-1485827404703-89b55fcc595e",
  ],
  [
    "world",
    "What makes a city a good place to live?",
    "A walk through the ideas shaping more connected, human-scale neighborhoods.",
    "UN Habitat",
    "https://unhabitat.org/",
    "photo-1519501025264-65ba15a82390",
  ],
  [
    "business",
    "A new perspective on the way we work",
    "How changing habits are reshaping the places where ideas become businesses.",
    "World Economic Forum",
    "https://www.weforum.org/",
    "photo-1497366754035-f200968a6e72",
  ],
  [
    "science",
    "Why the future of energy starts with better questions",
    "Exploring the science behind a lower-carbon climate and the choices ahead.",
    "International Energy Agency",
    "https://www.iea.org/topics/renewables",
    "photo-1466611653911-95081537e5b7",
  ],
  [
    "health",
    "The everyday spaces that help us feel better",
    "Green spaces, daily movement, and the relationship between place and wellbeing.",
    "World Health Organization",
    "https://www.who.int/health-topics/urban-health",
    "photo-1441974231531-c6227db76b6e",
  ],
  [
    "entertainment",
    "Inside the enduring appeal of the independent bookshop",
    "Small spaces, local stories, and the simple pleasure of finding your next read.",
    "UNESCO",
    "https://www.unesco.org/en/culture",
    "photo-1507842217343-583bb7270b66",
  ],
  [
    "sports",
    "Beyond the finish line: the places that bring us together",
    "Looking at the communities and shared spaces at the heart of sport.",
    "Olympics",
    "https://olympics.com/",
    "photo-1461896836934-ffe607ba8211",
  ],
  [
    "world",
    "Listening to the ocean, one discovery at a time",
    "The tools helping scientists understand one of the least explored parts of our world.",
    "NOAA",
    "https://oceanexplorer.noaa.gov/",
    "photo-1518837695005-2083093ee35b",
  ],
  [
    "technology",
    "Designing a web that more people can use",
    "Accessibility as a starting point for better digital experiences.",
    "W3C Web Accessibility Initiative",
    "https://www.w3.org/WAI/",
    "photo-1498050108023-c5249f4df085",
  ],
];
export function demoArticles(category = "general", query = ""): Article[] {
  return stories
    .filter(
      (s) =>
        (category === "general" || s[0] === category) &&
        (!query ||
          `${s[1]} ${s[2]} ${s[0]}`
            .toLowerCase()
            .includes(query.toLowerCase())),
    )
    .map((s, i) => ({
      id: s[4],
      url: s[4],
      title: s[1],
      description: s[2],
      image: `https://images.unsplash.com/${s[5]}?auto=format&fit=crop&w=1200&q=85`,
      source: { name: s[3], url: null },
      publishedAt: `2026-10-29T${String(8 - (i % 6)).padStart(2, "0")}:00:00.000Z`,
    }));
}
