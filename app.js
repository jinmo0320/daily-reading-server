const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");
const translate = require("@vitalets/google-translate-api");

async function getHTML(link) {
  try {
    return await axios.get(link);
  } catch (err) {
    console.error(err);
  }
}

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  getHTML("https://www.bbc.com/news")
    .then((html) => {
      const $ = cheerio.load(html.data);
      const ol = $("ol").last();
      const firstLi = ol.children().first();
      const a = firstLi.find("a").attr("href");
      const link = `https://www.bbc.com${a}`;
      return link;
    })
    .then((link) => {
      getHTML(link).then((html) => {
        const texts = [];
        const translatedTexts = [];

        const $ = cheerio.load(html.data);
        const title = $("h1#main-heading").text();
        const article = $("article");
        const p = article.find("p.ssrcss-1q0x1qg-Paragraph");

        p.each((i, elem) => {
          texts[i] = $(elem).text();
        });

        const data = {
          title: title,
          texts: texts,
        };

        res.json(data);
      });
    });
});

app.post("/translate", (req, res) => {
  const data = req.body;
  translate(data.targetWord, { from: "en", to: "ko" }).then((response) => {
    const result = {
      targetWord: data.targetWord,
      translatedWord: response.text,
    };

    res.json(result);
  });
});

app.listen(port, () => console.log("app listening"));
