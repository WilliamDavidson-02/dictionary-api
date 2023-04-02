const searchElement = document.getElementById("word");
const form = document.getElementById("form");
const main = document.getElementById("main");
const definitionContainer = document.getElementById("definition-container");

let inputWord = "";
let isSuggesting = false;
let suggestionArray;
let storedDefinition = [];

function searchWord() {
  storedDefinition = [];
  inputWord = searchElement.value;
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${inputWord}`)
    .then(res => res.json())
    .then(result => {
      storedDefinition.push(result[0]);
      formArray();
      createDefinitionElements();
    })
  searchElement.value = "";
  isSuggesting = false;
}

function formArray() {
  suggestionArray = Array.from(form.children);
  suggestionArray.forEach(element => {
    if(element.nodeName === "DIV") {
      element.remove();
    }
  })
}

function createDefinitionElements() {
  definitionContainer.innerHTML = "";
  const definitionWord = document.createElement("div");
  definitionWord.classList.add("definition-word");
  const definitionh1 = document.createElement("h1");
  definitionh1.textContent = storedDefinition[0].word;
  const definitionSymbols = document.createElement("h2");
  definitionSymbols.textContent = storedDefinition[0].phonetics[0].text;
  const definitionAudio = document.createElement("i");
  definitionAudio.setAttribute("id", "definition-speech");
  definitionAudio.classList.add("fa-solid", "fa-volume-high");
  // Get audio link
  let audioUrl = "";
  storedDefinition[0].phonetics.forEach(element => {
    if(element.audio.length > 1) {
      audioUrl = element.audio;
    }
  })
  
  const hr = document.createElement("hr");

  const definitionContent = document.createElement("div");
  storedDefinition[0].meanings.forEach(element => {
    const definitionType = document.createElement("h3");
    definitionType.textContent = element.partOfSpeech;
    const definitionUl = document.createElement("ul");
    const definitionLi = document.createElement("li");
    definitionLi.textContent = element.definitions[0].definition;
    definitionUl.appendChild(definitionLi);
    definitionContent.append(definitionType, definitionUl)
  });

  definitionWord.appendChild(definitionh1);
  if (definitionSymbols.textContent.length > 1) {
    definitionWord.appendChild(definitionSymbols);
  }
  if (audioUrl.length > 1) {
    definitionWord.appendChild(definitionAudio);
  }

  definitionContainer.append(definitionWord, hr, definitionContent);

  definitionAudio.addEventListener("click", () => {
    const audioElement = new Audio(audioUrl);
    audioElement.play()
  })
}

searchElement.addEventListener("input", async () => {
  let inputCheck = searchElement.value.split(/\s+/);
  formArray();

  if(inputCheck.length === 1 && searchElement.value.length > 0) {
    isSuggesting = true;
    const response = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(searchElement.value)}`);
    const suggestions = await response.json();

    suggestions.forEach(element => {
      if(element.word.split(/\s+/).length === 1) {
        const suggestionDiv = document.createElement("div");
        suggestionDiv.classList.add("suggestions-active", "form-input", "suggestions");
        suggestionDiv.textContent = element.word;
        // evenetlistener for every element that is created
        suggestionDiv.addEventListener("click", (e) => {
          searchElement.value = e.target.textContent;
          searchWord();
        });

        form.appendChild(suggestionDiv);
      }
    });
    if(isSuggesting) {
      definitionContainer.innerHTML = "";
    }
  } else {
    isSuggesting = false;
  }

  if(isSuggesting) {
    suggestionArray.forEach(element => {
      element.classList.replace("form-radius","suggestions-active");      
    });
  } else {
    suggestionArray.forEach(element => {
      element.classList.replace("suggestions-active", "form-radius");      
    });  
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  searchWord();
})