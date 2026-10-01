const allQuestions = window.quizQuestions.map((question, sourceIndex) => ({
  ...question,
  sourceIndex,
  prompt: question.prompt
    .replace(/slik kurset beskriver utviklingen/gi, 'ut fra utviklingen i HICO/S3000L-fagstoffet')
    .replace(/slik kurset presenterer dem/gi, 'i HICO/S3000L-rammeverket')
    .replace(/slik kurset beskriver (den|det)/gi, 'i HICO/S3000L-fagstoffet')
    .replace(/ifølge kurset/gi, 'i HICO/S3000L-fagstoffet')
    .replace(/kursmaterialets/gi, 'HICO/S3000L-fagstoffets')
    .replace(/kursmaterialet/gi, 'HICO/S3000L-fagstoffet')
}));

const courses = {
  easy: { name: 'Kurs 1 · Lett', start: 0, end: 34, matchStarts: [8, 21] },
  medium: { name: 'Kurs 2 · Middels', start: 34, end: 67, matchStarts: [3, 13, 23] },
  hard: { name: 'Kurs 3 · Vanskelig', start: 67, end: 100, matchStarts: [2, 10, 18, 26] }
};

let selectedCourse;
let courseQuestions = [];
let activities = [];
let currentActivityIndex = 0;
let completedQuestionCount = 0;
let correctCount = 0;
let hasAnswered = false;

const coursePicker = document.querySelector('#course-picker');
const quizSession = document.querySelector('#quiz-session');
const questionCount = document.querySelector('#question-count');
const scoreDisplay = document.querySelector('#score');
const progress = document.querySelector('.progress-track');
const progressFill = document.querySelector('#progress-fill');
const category = document.querySelector('#question-category');
const title = document.querySelector('#question-title');
const answers = document.querySelector('#answers');
const feedback = document.querySelector('#feedback');
const feedbackIcon = document.querySelector('#feedback-icon');
const feedbackTitle = document.querySelector('#feedback-title');
const feedbackCopy = document.querySelector('#feedback-copy');
const nextButton = document.querySelector('#next-button');
const nextLabel = document.querySelector('#next-label');
const matchSubmit = document.querySelector('#match-submit');
const keyboardHint = document.querySelector('.keyboard-hint');
const questionContent = document.querySelector('#question-content');
const results = document.querySelector('#results');

function isAbbreviationQuestion(question) {
  return question.options.every((option) => /^(?:S\d{4}[A-Z]?|IPS|ILS|PSA|LCN|XML|XSL|SNS|PBS|LCC|HICO|IETP|LSA)\b/i.test(option.trim()));
}

function buildActivities(course, questions) {
  const activitiesForCourse = [];
  let questionIndex = 0;

  while (questionIndex < questions.length) {
    const matchQuestions = questions.slice(questionIndex, questionIndex + 3);
    const shouldMatch = course.matchStarts.includes(questionIndex)
      && matchQuestions.length === 3
      && matchQuestions.every((question) => !isAbbreviationQuestion(question));

    if (shouldMatch) {
      activitiesForCourse.push({ type: 'match', questions: matchQuestions });
      questionIndex += matchQuestions.length;
      continue;
    }

    const question = questions[questionIndex];
    activitiesForCourse.push({
      type: isAbbreviationQuestion(question) ? 'abbreviation' : 'choice',
      questions: [question]
    });
    questionIndex += 1;
  }

  return activitiesForCourse;
}

function startCourse(courseId) {
  selectedCourse = courses[courseId];
  courseQuestions = allQuestions.slice(selectedCourse.start, selectedCourse.end);
  activities = buildActivities(selectedCourse, courseQuestions);
  currentActivityIndex = 0;
  completedQuestionCount = 0;
  correctCount = 0;
  coursePicker.hidden = true;
  quizSession.hidden = false;
  questionContent.hidden = false;
  results.hidden = true;
  renderActivity();
}

function renderActivity() {
  const activity = activities[currentActivityIndex];
  const firstQuestionNumber = completedQuestionCount + 1;
  const lastQuestionNumber = firstQuestionNumber + activity.questions.length - 1;
  const questionRange = activity.questions.length === 1
    ? String(firstQuestionNumber).padStart(3, '0')
    : `${String(firstQuestionNumber).padStart(3, '0')}–${String(lastQuestionNumber).padStart(3, '0')}`;

  hasAnswered = false;
  questionCount.textContent = `SPØRSMÅL ${questionRange} / ${String(courseQuestions.length).padStart(3, '0')}`;
  scoreDisplay.textContent = correctCount;
  progress.setAttribute('aria-valuemax', courseQuestions.length);
  progress.setAttribute('aria-valuenow', completedQuestionCount);
  progressFill.style.width = `${(completedQuestionCount / courseQuestions.length) * 100}%`;
  category.textContent = activity.type === 'match'
    ? 'Koble sammen'
    : activity.type === 'abbreviation' ? 'Forkortelser og standarder' : activity.questions[0].category;
  keyboardHint.hidden = activity.type === 'match';
  title.textContent = activity.type === 'match'
    ? 'Koble hvert utsagn til riktig svar.'
    : activity.questions[0].prompt;
  answers.replaceChildren();
  feedback.hidden = true;
  feedback.classList.remove('is-wrong');
  nextButton.hidden = true;
  matchSubmit.hidden = true;

  if (activity.type === 'match') renderMatchingActivity(activity);
  else renderChoiceActivity(activity);
}

function renderChoiceActivity(activity) {
  const question = activity.questions[0];
  question.options.forEach((option, optionIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer';
    const key = document.createElement('span');
    key.className = 'answer-key';
    key.setAttribute('aria-hidden', 'true');
    key.textContent = String.fromCharCode(65 + optionIndex);
    const text = document.createElement('span');
    text.className = 'answer-text';
    text.textContent = option;
    button.append(key, text);
    button.addEventListener('click', () => submitChoice(optionIndex));
    answers.append(button);
  });
}

function renderMatchingActivity(activity) {
  const answerBank = [...activity.questions];
  for (let index = answerBank.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [answerBank[index], answerBank[randomIndex]] = [answerBank[randomIndex], answerBank[index]];
  }

  activity.questions.forEach((question, questionIndex) => {
    const row = document.createElement('div');
    row.className = 'match-row';
    const prompt = document.createElement('label');
    prompt.className = 'match-prompt';
    prompt.htmlFor = `match-${question.sourceIndex}`;
    prompt.textContent = question.prompt;
    const select = document.createElement('select');
    select.className = 'match-select';
    select.id = `match-${question.sourceIndex}`;
    select.dataset.correct = String(question.sourceIndex);
    select.setAttribute('aria-label', `Velg svar for utsagn ${questionIndex + 1}`);
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Velg et svar';
    select.append(placeholder);

    answerBank.forEach((answerQuestion) => {
      const option = document.createElement('option');
      option.value = String(answerQuestion.sourceIndex);
      option.textContent = answerQuestion.options[answerQuestion.answer];
      select.append(option);
    });

    select.addEventListener('change', updateMatchingChoices);
    row.append(prompt, select);
    answers.append(row);
  });
  matchSubmit.disabled = true;
  matchSubmit.hidden = false;
}

function updateMatchingChoices() {
  const selects = [...answers.querySelectorAll('.match-select')];
  const selectedValues = selects.map((select) => select.value).filter(Boolean);
  selects.forEach((select) => {
    [...select.options].forEach((option) => {
      option.disabled = option.value !== '' && option.value !== select.value && selectedValues.includes(option.value);
    });
  });
  matchSubmit.disabled = selects.some((select) => !select.value);
}

function showFeedback(isCorrect, message) {
  feedback.hidden = false;
  feedback.classList.toggle('is-wrong', !isCorrect);
  feedbackIcon.textContent = isCorrect ? '✓' : '×';
  feedbackTitle.textContent = isCorrect ? 'Helt riktig!' : 'Noen svar må justeres.';
  feedbackCopy.textContent = message;
  nextLabel.textContent = currentActivityIndex === activities.length - 1 ? 'Se resultatet' : 'Neste oppgave';
  nextButton.hidden = false;
  nextButton.focus();
}

function finishActivity(points, message, isFullyCorrect) {
  hasAnswered = true;
  const activity = activities[currentActivityIndex];
  correctCount += points;
  completedQuestionCount += activity.questions.length;
  scoreDisplay.textContent = correctCount;
  progress.setAttribute('aria-valuenow', completedQuestionCount);
  progressFill.style.width = `${(completedQuestionCount / courseQuestions.length) * 100}%`;
  showFeedback(isFullyCorrect, message);
}

function submitChoice(selectedIndex) {
  if (hasAnswered) return;
  const question = activities[currentActivityIndex].questions[0];
  const isCorrect = selectedIndex === question.answer;
  [...answers.children].forEach((button, optionIndex) => {
    button.disabled = true;
    if (optionIndex === question.answer) button.classList.add('correct');
    else if (optionIndex === selectedIndex) button.classList.add('incorrect');
    else button.classList.add('dimmed');
  });
  finishActivity(isCorrect ? 1 : 0, isCorrect
    ? 'Du valgte riktig alternativ.'
    : `Riktig svar er: ${question.options[question.answer]}`, isCorrect);
}

function submitMatching() {
  if (hasAnswered) return;
  const selects = [...answers.querySelectorAll('.match-select')];
  let points = 0;
  selects.forEach((select) => {
    const isCorrect = select.value === select.dataset.correct;
    const row = select.closest('.match-row');
    row.classList.add(isCorrect ? 'correct' : 'incorrect');
    select.disabled = true;
    if (isCorrect) points += 1;
    else {
      const rightAnswer = activities[currentActivityIndex].questions
        .find((question) => String(question.sourceIndex) === select.dataset.correct);
      const correction = document.createElement('span');
      correction.className = 'match-correction';
      correction.textContent = `Riktig kobling: ${rightAnswer.options[rightAnswer.answer]}`;
      row.append(correction);
    }
  });
  matchSubmit.hidden = true;
  finishActivity(points, `${points} av ${selects.length} koblinger riktige.`, points === selects.length);
}

function showResults() {
  questionContent.hidden = true;
  results.hidden = false;
  document.querySelector('#final-score').textContent = correctCount;
  document.querySelector('#final-total').textContent = courseQuestions.length;
  const ratio = correctCount / courseQuestions.length;
  document.querySelector('#result-title').textContent = ratio === 1 ? 'Full pott!' : ratio >= 0.625 ? 'Dette kan du.' : 'God øving.';
  document.querySelector('#result-copy').textContent = ratio === 1
    ? `Du fullførte ${selectedCourse.name.toLowerCase()} med alt riktig.`
    : `${correctCount} av ${courseQuestions.length} riktige. Ta gjerne kurset på nytt for å øve mer.`;
  progress.setAttribute('aria-valuenow', courseQuestions.length);
  progressFill.style.width = '100%';
  questionCount.textContent = 'KURS FULLFØRT';
}

document.querySelectorAll('[data-course]').forEach((button) => {
  button.addEventListener('click', () => startCourse(button.dataset.course));
});

nextButton.addEventListener('click', () => {
  if (currentActivityIndex === activities.length - 1) showResults();
  else {
    currentActivityIndex += 1;
    renderActivity();
    title.focus();
  }
});

matchSubmit.addEventListener('click', submitMatching);

document.querySelector('#restart-button').addEventListener('click', () => {
  startCourse(Object.keys(courses).find((courseId) => courses[courseId] === selectedCourse));
});

document.querySelector('#return-button').addEventListener('click', () => {
  quizSession.hidden = true;
  coursePicker.hidden = false;
  document.querySelector('#course-title').focus();
});

document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat || quizSession.hidden) return;
  if (results.hidden && !hasAnswered && /^[1-4]$/.test(event.key)) {
    const buttons = answers.querySelectorAll('.answer');
    buttons[Number(event.key) - 1]?.click();
  } else if (results.hidden && hasAnswered && (event.key === 'Enter' || event.key === ' ')) {
    if (document.activeElement !== nextButton) return;
    event.preventDefault();
    nextButton.click();
  }
});

Object.entries(courses).forEach(([courseId, course]) => {
  document.querySelector(`#${courseId}-total`).textContent = `${course.end - course.start} spørsmål`;
});