---
config:
  siteName: "Express Mmark"
  meta:
    author: "mmark"
    description: "markdown template engin for express"
    keywords: ["a", "b", "c"]
  cssLinks:
    [
      "https://rawcdn.githack.com/phothinmg/md-view/refs/heads/main/src/mono.css",
    ]
---

## Hello world

| h1    |   h2    |      h3 |
| :---- | :-----: | ------: |
| 100   | [a][1]  | ![b][2] |
| _foo_ | **bar** | ~~baz~~ |

```js
function mark2Html(src) {
  fetch(src)
    .then((response) => response.text())
    .then((text) => {
      var mel = document.createElement("div");
      mel.classList.add("mark2Html");
      mel.innerHTML = converter.makeHtml(text);
      document.body.appendChild(mel);
    });
}
```

၂၂၇ သွယ်သော ဝိနည်းတော်အကျဉ်း

{ပါရာဇိက ၄ ပါး }
၁ ။ မေထုန်မကျင့်ရ
၂ ။ သူတပါးဥစ္စာမခိုးရ
၃ ။ လူမသတ်ရ မသတ်ခိုင်းရ
၄ ။ ဈာန္မဂ္ဖိုလ္မရဘဲ ရသည်ဟုမပြောရ ။
