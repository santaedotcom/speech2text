const recognition = new webkitSpeechRecognition();
let recognizing;
let translateTo;
const maxHistory = 5;
const translationUrlBase =
  "https://script.google.com/macros/s/AKfycbwrFsPW-MQMeP5-sdIVS3ZfJezgGnTmtYwtv4j2ToN_HAWrlk4n/exec";

const getPermission = () => {
  const permissionUrl = `chrome-extension://${chrome.runtime.id}/getPermission.html`;
  chrome.tabs.create({ url: permissionUrl });
};

const initializeRecognition = () => {
  const statuses = [
    "start",
    "audiostart",
    "soundstart",
    "speechstart",
    "speechend",
    "soundend",
    "audioend",
    "end"
  ];
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onstart = e => {
    showMessage("start");
    recognition.status = "start";
    iconForLoading();
  };
  recognition.onaudiostart = e => {
    showMessage("audio start");
    recognition.status = "audiostart";
    iconForReady();
  };
  recognition.onsoundstart = e => {
    showMessage("sound start");
    recognition.status = "soundstart";
  };
  recognition.onspeechstart = e => {
    showMessage("speech start");
    recognition.status = "speechstart";
  };
  recognition.onspeechend = e => {
    showMessage("speech end");
    recognition.status = "speechend";
    iconForStop();
  };
  recognition.onsoundend = e => {
    showMessage("sound end");
    if (recognition.status != "speechend") {
      showMessage(`[Error] Latest status is ${recognition.status}`);
      iconForStop();
    }
    recognition.status = "soundend";
  };
  recognition.onaudioend = e => {
    showMessage("audio end");
    if (recognition.status != "soundend") {
      showMessage(`[Error] Latest status is ${recognition.status}`);
      iconForStop();
    }
    recognition.status = "audioend";
  };
  recognition.onend = e => {
    showMessage("end");
    if (recognition.status != "audioend") {
      showMessage(`[Error] Latest status is ${recognition.status}`);
      iconForStop();
    }
    recognition.status = "end";
    recognizing = false;
  };

  recognition.onerror = e => {
    if (e.error === "not-allowed") {
      getPermission();
    }
  };
  recognition.onnomatch = e => showMessage("nomatch");

  recognition.onresult = event => {
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      let transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        $("#result").text(transcript);
        $("#interim").text("");
        translate(transcript, recognition.lang, translateTo);
        navigator.clipboard.writeText(`${transcript}\n`);
      } else {
        $("#interim").text(transcript);
      }
    }
  };
};

const iconForStop = () => {
  $(".fa-microphone-slash").css("display", "block");
  $(".fa-microphone.loading").css("display", "none");
  $(".fa-microphone.ready").css("display", "none");
};

const iconForLoading = () => {
  $(".fa-microphone-slash").css("display", "none");
  $(".fa-microphone.loading").css("display", "block");
  $(".fa-microphone.ready").css("display", "none");
};

const iconForReady = () => {
  $(".fa-microphone-slash").css("display", "none");
  $(".fa-microphone.loading").css("display", "none");
  $(".fa-microphone.ready").css("display", "block");
};

const showMessage = msg => {
  console.log(msg);
};

const stop = () => {
  recognition.stop();
  recognizing = false;
};

const start = () => {
  recognition.start();
  recognizing = true;
};

const toggleStartStop = () => {
  recognizing ? stop() : start();
};

$(document).on("click", ".statusIcon", () => {
  toggleStartStop();
});

const langs = {
  Afrikaans: "af-ZA",
  "Bahasa Indonesia": "id-ID",
  "Bahasa Melayu": "ms-MY",
  Catal??: "ca-ES",
  ??e??tina: "cs-CZ",
  Deutsch: "de-DE",
  "English [Australia]": "en-AU",
  "English [Canada]": "en-CA",
  "English [India]": "en-IN",
  "English [New Zealand]": "en-NZ",
  "English [South Africa]": "en-ZA",
  "English [United Kingdom]": "en-GB",
  "English [United State]": "en-US",
  "Espa??ol [Argentina]": "es-AR",
  "Espa??ol [Bolivia]": "es-BO",
  "Espa??ol [Chile]": "es-CL",
  "Espa??ol [Colombia]": "es-CO",
  "Espa??ol [Costa Rica]": "es-CR",
  "Espa??ol [Ecuador]": "es-EC",
  "Espa??ol [El Salvador]": "es-SV",
  "Espa??ol [Espa??a]": "es-ES",
  "Espa??ol [Estados Unidos]": "es-US",
  "Espa??ol [Guatemala]": "es-GT",
  "Espa??ol [Honduras]": "es-HN",
  "Espa??ol [M??xico]": "es-MX",
  "Espa??ol [Nicaragua]": "es-NI",
  "Espa??ol [Panam??]": "es-PA",
  "Espa??ol [Paraguay]": "es-PY",
  "Espa??ol [Per??]": "es-PE",
  "Espa??ol [Puerto Rico]": "es-PR",
  "Espa??ol [Rep??blica Dominicana]": "es-DO",
  "Espa??ol [Uruguay]": "es-UY",
  "Espa??ol [Venezuel]": "es-VE",
  Euskara: "eu-ES",
  Fran??ais: "fr-FR",
  Galego: "gl-ES",
  Hrvatski: "hr_HR",
  IsiZulu: "zu-ZA",
  ??slenska: "is-IS",
  "Italiano [Italia]": "it-IT",
  "Italiano [Svizzera]": "it-CH",
  Magyar: "hu-HU",
  Nederlands: "nl-NL",
  "Norsk bokm??l": "nb-NO",
  Polski: "pl-PL",
  "Portugu??s [Brasil]": "pt-BR",
  "Portugu??s [Portugal]": "pt-PT",
  Rom??n??: "ro-RO",
  Sloven??ina: "sk-SK",
  Suomi: "fi-FI",
  Svenska: "sv-SE",
  T??rk??e: "tr-TR",
  ??????????????????: "bg-BG",
  P????????????: "ru-RU",
  ????????????: "sr-RS",
  ?????????: "ko-KR",
  "?????? [????????? (????????????)": "cmn-Hans-CN",
  "?????? [????????? (??????)]": "cmn-Hans-HK",
  "?????? (??????)": "cmn-Hant-TW",
  "?????? [?????? (??????)]": "yue-Hant-HK",
  ?????????: "ja-JP",
  "Lingua lat??na": "la"
};

const code2lang = code => {
  for (let key in langs) {
    if (langs[key] === code) {
      return key;
    }
  }
};

const saveCountrySelection = e => {
  const selectedLangCountry = Object.keys(langs)[e.target.selectedIndex];
  recognition.lang = langs[selectedLangCountry];
  stop();
  chrome.storage.sync.set({
    code: langs[selectedLangCountry]
  });
};

const saveTranslateTargetSelection = e => {
  const selectedTranslateTaregtCountry = Object.keys(langs)[
    e.target.selectedIndex
  ];
  translateTo = langs[selectedTranslateTaregtCountry];
  stop();
  chrome.storage.sync.set({
    translateTarget: langs[selectedTranslateTaregtCountry]
  });
};

const addLangSelection = () => {
  chrome.storage.sync.get("code", selected => {
    const selectedCode = selected.code;
    recognition.lang = selectedCode;
    const langSelection = $("#langSelection");
    const dropdown = $("<select></select>");
    for (let country in langs) {
      let langOption = $("<option></option>")
        .text(country)
        .val(langs[country]);
      if (langs[country] === selectedCode) {
        langOption.prop("selected", true);
      }
      dropdown.append(langOption);
    }
    langSelection.append(dropdown);
    dropdown.on("change", saveCountrySelection);
  });
};

const addTranslateTargetSelection = () => {
  chrome.storage.sync.get("translateTarget", selected => {
    const selectedCode = selected.translateTarget;
    translateTo = selectedCode;
    const langSelection = $("#translateTargetSelection");
    const dropdown = $("<select></select>");
    for (let country in langs) {
      let langOption = $("<option></option>")
        .text(country)
        .val(langs[country]);
      if (langs[country] === selectedCode) {
        langOption.prop("selected", true);
      }
      dropdown.append(langOption);
    }
    langSelection.append(dropdown);
    dropdown.on("change", saveTranslateTargetSelection);
  });
};

const getDate = () => {
  let now = new Date();
  const date = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    date: now.getDate(),
    hour: now.getHours(),
    min: now.getMinutes(),
    sec: now.getSeconds()
  };
  return date;
};

const translate = (text, source, target) => {
  const sourceCode = source.split("-")[0];
  const targetCode = target.split("-")[0];
  fetch(
    `${translationUrlBase}?text=${text}&source=${sourceCode}&target=${targetCode}`,
    { mode: "cors" }
  )
    .then(res => {
      console.log(res);
      return res.text();
    })
    .then(res => {
      console.log(res);
      const translated = JSON.parse(res).translated;
      $("#translated").text(translated);
      const result = {
        original: text,
        translated: translated,
        source: source,
        target: target,
        date: getDate()
      };
      saveHistory(result);
    })
    .catch(e => {
      console.log(e);
      const result = {
        original: text,
        translated: "",
        source: source,
        target: "",
        date: getDate()
      };
      saveHistory(result);
    });
};

const saveHistory = result => {
  chrome.storage.sync.get("history", res => {
    res.history.push(result);
    while (res.history.length > maxHistory) {
      res.history.shift();
    }
    chrome.storage.sync.set({
      history: res.history
    });
  });
};

const updateHistory = () => {
  chrome.storage.onChanged.addListener(() => {
    loadHistory();
  });
};

const loadHistory = () => {
  chrome.storage.sync.get("history", res => {
    let history = res.history.reverse();
    $("#historyView").empty();
    for (let i = 0; i < history.length; i++) {
      let record = history[i];
      let block = getHistoryBlock(record);
      $("#historyView").append(block);
    }
  });
};

const getHistoryBlock = record => {
  let originalBlock = $("<div></div>", { addClass: "original block" });
  let translatedBlock = $("<div></div>", { addClass: "translated block" });
  let originalText = $("<span></span>", { addClass: "text" }).text(
    record.original
  );
  let translatedText = $("<span></span>", { addClass: "text" }).text(
    record.translated
  );
  let originalCode = $("<div></div>", { addClass: "code" }).text(record.source);
  let originalCountry = $("<div></div>", { addClass: "country" }).text(
    code2lang(record.source)
  );
  let translatedCode = $("<div></div>", { addClass: "code" }).text(
    record.target
  );
  let translatedCountry = $("<div></div>", { addClass: "country" }).text(
    code2lang(record.target)
  );
  let recordedDate = $("<span></span>", { addClass: "recordedDate" }).text(
    date2Line(record.date)
  );
  let block = $("<div></div>", { addClass: "historyBlock" });

  originalBlock.append(originalText);
  originalBlock.append(originalCode);
  originalBlock.append(originalCountry);
  translatedBlock.append(translatedText);
  translatedBlock.append(translatedCode);
  translatedBlock.append(translatedCountry);
  block.append(originalBlock);
  block.append(translatedBlock);
  //block.append(recordedDate);
  return block;
};

const date2Line = date => {
  return `${date.year}.${date.month}.${date.date} ${date.hour}:${date.min}`;
};

const enableCopyOnClickResults = () => {
  $(document).on("click", ".translated, .original", e => {
    const text = $(e.target)
      .parent()
      .children("span")
      .text();
    navigator.clipboard.writeText(`${text}\n`);
  });
};

const initializeStorage = () => {
  chrome.storage.sync.get("history", res => {
    if (typeof res.history === "undefined") {
      chrome.storage.sync.set({ history: [] });
    }
  });
};

let testUrl = () => {
  fetch(
    `${translationUrlBase}?text=%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%82%8F&source=ja-JP&target=en-US`,
    { mode: "cors", referrer: "strict-origin-when-cross-origin" }
  )
    .then(res => {
      console.log(res);
      return res.json();
    })
    .then(res => {
      console.log(res);
    });
};

addLangSelection();
addTranslateTargetSelection();
initializeStorage();
iconForStop();
initializeRecognition();
loadHistory();
updateHistory();
enableCopyOnClickResults();
setTimeout(start, 1000);
