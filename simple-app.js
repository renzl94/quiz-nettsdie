const handbook = window.hicoLearningData;
const quizBank = window.hicoQuizQuestions;
const progressKey = 'hico-learning-simple-v2';
const moduleTitles = ['Prosjektgrunnlag', 'Produkt og struktur', 'Vedlikehold og dokumentasjon'];
const moduleDescriptions = [
  'HICO, S-Series og prosjektoppsett',
  'Product, Article, Device Type og PBS',
  'MTA, Maintenance Task, Info Code og Data Module'
];
const freshProgress = () => ({ completed: [], answers: {}, attempts: 0 });
let progress = loadProgress();
let activeModuleId = null;
let activeQuestionIndex = 0;

const $ = (selector, root = document) => root.querySelector(selector);
const moduleScreen = $('#module-screen');
const questionScreen = $('#question-screen');
const resultScreen = $('#result-screen');
const moduleGrid = $('#module-grid');

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey)) || {};
    return { ...freshProgress(), ...saved, attempts: Number(saved.attempts) || 0 };
  } catch {
    return freshProgress();
  }
}

function questionsForModule(moduleId = activeModuleId) {
  return quizBank.filter((question) => question.module === moduleId);
}

function answersForModule(moduleId = activeModuleId) {
  const count = questionsForModule(moduleId).length;
  if (!progress.answers[moduleId] || progress.answers[moduleId].length !== count) {
    progress.answers[moduleId] = Array(count).fill(null);
  }
  return progress.answers[moduleId];
}

function scoreForModule(moduleId = activeModuleId) {
  return questionsForModule(moduleId).reduce((score, question, index) => (
    score + Number(answersForModule(moduleId)[index] === question.answer)
  ), 0);
}

function saveProgress() {
  try {
    localStorage.setItem(progressKey, JSON.stringify(progress));
  } catch {
    $('.save-note').textContent = 'Lokal lagring er ikke tilgjengelig.';
  }
  renderProgress();
  renderModuleCards();
}

function renderProgress() {
  $('#module-count').textContent = `${progress.completed.length} / ${moduleTitles.length}`;
}

function renderModuleCards() {
  moduleGrid.replaceChildren();
  moduleTitles.forEach((title, index) => {
    const moduleId = index + 1;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'module-card';
    if (progress.completed.includes(moduleId)) card.classList.add('is-complete');

    const number = document.createElement('span');
    number.className = 'module-index';
    number.textContent = String(moduleId).padStart(2, '0');
    const copy = document.createElement('span');
    copy.className = 'module-card-copy';
    const moduleName = document.createElement('strong');
    moduleName.textContent = title;
    const description = document.createElement('small');
    description.textContent = moduleDescriptions[index];
    copy.append(moduleName, description);
    const state = document.createElement('span');
    state.className = 'module-card-state';
    state.textContent = progress.completed.includes(moduleId) ? '✓' : '→';
    card.append(number, copy, state);
    card.addEventListener('click', () => startModule(moduleId));
    moduleGrid.append(card);
  });
}

function showScreen(activeScreen) {
  [moduleScreen, questionScreen, resultScreen].forEach((screen) => { screen.hidden = screen !== activeScreen; });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startModule(moduleId) {
  activeModuleId = moduleId;
  activeQuestionIndex = 0;
  renderQuestion();
  showScreen(questionScreen);
}

function normalize(value) {
  return String(value).toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function factScore(fact, questionText, answerText) {
  return fact.aliases.reduce((score, alias) => {
    const key = normalize(alias);
    if (!key) return score;
    if (` ${questionText} `.includes(` ${key} `)) return score + 12 + Math.min(key.length, 24) / 8;
    if (` ${answerText} `.includes(` ${key} `)) return score + 7 + Math.min(key.length, 24) / 8;
    return score;
  }, 0);
}

function findQuestionContext(question) {
  const questionText = normalize(question.prompt);
  const answerText = normalize(question.options[question.answer]);
  const combinedText = `${questionText} ${answerText}`;
  const fact = handbook.handbookFacts
    .map((item) => ({ item, score: factScore(item, questionText, answerText) }))
    .filter((match) => match.score > 0)
    .sort((first, second) => second.score - first.score)[0]?.item;

  const relation = handbook.relationships
    .map((item) => ({
      item,
      score: [item.a, item.b].filter((term) => ` ${combinedText} `.includes(` ${normalize(term)} `)).length
    }))
    .filter((match) => match.score === 2)
    .sort((first, second) => second.item.detail.length - first.item.detail.length)[0]?.item;

  return { fact, relation };
}

function trimExplanation(value, maxLength = 230) {
  const firstSentence = String(value).trim().match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || String(value).trim();
  return firstSentence.length <= maxLength ? firstSentence : `${firstSentence.slice(0, maxLength - 3).trimEnd()}...`;
}

function isDefinitionRepeated(answer, factText) {
  const ignored = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'som', 'med', 'eller', 'for', 'til', 'fra', 'det', 'den', 'en', 'et', 'i', 'av', 'og', 'at', 'er', 'kan', 'brukes']);
  const answerWords = normalize(answer).split(' ').filter((word) => word.length > 2 && !ignored.has(word));
  const factTextNormalized = ` ${normalize(factText)} `;
  if (answerWords.length < 2) return false;
  const repeatedWords = answerWords.filter((word) => factTextNormalized.includes(` ${word} `)).length;
  return repeatedWords / answerWords.length >= 0.65;
}

function explainMatchedFact(fact, answer) {
  const glossaryEntry = handbook.glossary.find(([term]) => normalize(term) === normalize(fact.term));
  if (glossaryEntry && (fact.term === 'ASD' || isDefinitionRepeated(answer, fact.text))) {
    const [, , usage, connected] = glossaryEntry;
    return `Brukes til: ${usage} Koblet til: ${connected}.`;
  }
  return trimExplanation(fact.text);
}

function answerContext(question, selectedIndex) {
  const selectedAnswer = question.options[selectedIndex];
  const correctAnswer = question.options[question.answer];
  const { fact, relation } = findQuestionContext(question);
  let explanation = relation
    ? trimExplanation(relation.detail, 210)
    : fact
      ? explainMatchedFact(fact, correctAnswer)
      : 'Svaret følger definisjonen i quizmaterialet.';
  explanation = explanation.replace(/\s+/g, ' ').trim();
  if (selectedIndex === question.answer) return `Riktig. ${explanation}`;
  return `Du valgte: ${selectedAnswer}. Riktig svar: ${correctAnswer}. ${explanation}`;
}

function renderQuestion() {
  const questions = questionsForModule();
  const question = questions[activeQuestionIndex];
  const selected = answersForModule()[activeQuestionIndex];
  $('#question-position').textContent = `SPØRSMÅL ${String(activeQuestionIndex + 1).padStart(3, '0')} / ${questions.length}`;
  $('#question-score').textContent = `${scoreForModule()} riktige`;
  $('#question-progress-fill').style.width = `${((activeQuestionIndex + 1) / questions.length) * 100}%`;
  $('#question-type').textContent = question.difficulty === 'basic' ? 'GRUNNLEGGENDE' : question.difficulty === 'medium' ? 'SAMMENHENG' : 'I PRAKSIS';
  $('#question-title').textContent = question.prompt;
  $('#question-concepts').textContent = moduleTitles[activeModuleId - 1];
  $('#answer-list').replaceChildren();

  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-option';
    const key = document.createElement('span');
    key.className = 'option-key';
    key.textContent = String.fromCharCode(65 + index);
    const text = document.createElement('span');
    text.className = 'option-copy';
    text.textContent = option;
    button.append(key, text);
    if (selected !== null && selected !== undefined) {
      if (index === question.answer) button.classList.add('is-correct');
      else if (index === selected) button.classList.add('is-wrong');
      else button.classList.add('is-muted');
    }
    button.addEventListener('click', () => selectAnswer(index));
    $('#answer-list').append(button);
  });

  const context = $('#answer-context');
  context.hidden = selected === null || selected === undefined;
  context.classList.toggle('is-wrong', selected !== question.answer);
  if (selected !== null && selected !== undefined) {
    const correct = selected === question.answer;
    $('#context-icon').textContent = correct ? '✓' : '×';
    $('#context-title').textContent = correct ? 'RIKTIG · HVORFOR?' : 'FEIL · FASIT OG HVORFOR';
    $('#context-copy').textContent = answerContext(question, selected);
  }

  $('#previous-question').disabled = false;
  $('#previous-question').innerHTML = activeQuestionIndex === 0 ? '<span aria-hidden="true">←</span> Tilbake' : '<span aria-hidden="true">←</span> Forrige';
  $('#next-question').disabled = selected === null || selected === undefined;
  $('#next-question').innerHTML = activeQuestionIndex === questions.length - 1 ? 'Resultat <span aria-hidden="true">→</span>' : 'Neste <span aria-hidden="true">→</span>';
}

function selectAnswer(index) {
  answersForModule()[activeQuestionIndex] = index;
  progress.attempts += 1;
  saveProgress();
  renderQuestion();
}

function moveQuestion(direction) {
  const nextIndex = activeQuestionIndex + direction;
  if (nextIndex < 0) {
    showScreen(moduleScreen);
    return;
  }
  if (nextIndex >= questionsForModule().length) {
    finishModule();
    return;
  }
  activeQuestionIndex = nextIndex;
  renderQuestion();
}

function finishModule() {
  const score = scoreForModule();
  const total = questionsForModule().length;
  const passed = score >= Math.ceil(total * modules[activeModuleId - 1].passRatio);
  if (passed && !progress.completed.includes(activeModuleId)) progress.completed.push(activeModuleId);
  saveProgress();
  $('#result-title').textContent = passed ? 'Godt jobbet.' : 'Ta en runde til.';
  $('#result-copy').textContent = passed
    ? `${moduleTitles[activeModuleId - 1]}: ${score} av ${total} riktige.`
    : `${score} av ${total} riktige. Prøv modulen på nytt når du er klar.`;
  $('#result-score').textContent = `${score} / ${total}`;
  $('#result-takeaway').textContent = modules[activeModuleId - 1].takeaway;
  $('#continue-module').hidden = !passed || activeModuleId === modules.length;
  showScreen(resultScreen);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]);
}

function showGlossary() {
  $('#utility-title').textContent = 'Begreper';
  $('#utility-copy').textContent = 'Korte oppslag fra HICO-oppslagsverket.';
  $('#utility-content').replaceChildren();
  data.glossary.forEach(([term, definition]) => {
    const item = document.createElement('article');
    item.className = 'glossary-item';
    item.innerHTML = `<strong>${escapeHtml(term)}</strong><p>${escapeHtml(definition)}</p>`;
    $('#utility-content').append(item);
  });
  $('#utility-overlay').hidden = false;
}

function closeGlossary() {
  $('#utility-overlay').hidden = true;
}

$('#question-back-to-modules').addEventListener('click', () => showScreen(moduleScreen));
$('#previous-question').addEventListener('click', () => moveQuestion(-1));
$('#next-question').addEventListener('click', () => moveQuestion(1));
$('#retry-module').addEventListener('click', () => startModule(activeModuleId));
$('#continue-module').addEventListener('click', () => {
  if (activeModuleId < modules.length) startModule(activeModuleId + 1);
  else showScreen(moduleScreen);
});

document.addEventListener('keydown', (event) => {
  if (questionScreen.hidden || event.altKey || event.ctrlKey || event.metaKey || !$('#answer-context').hidden) return;
  if (/^[1-4]$/.test(event.key)) $('#answer-list').children[Number(event.key) - 1]?.click();
});

renderModuleCards();
renderProgress();
