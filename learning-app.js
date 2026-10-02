const catalog = window.quizCourses;
const sourceQuestions = window.quizQuestions;
const root = document.querySelector('#course-options');
const coursePicker = document.querySelector('#course-picker');
const quizSession = document.querySelector('#quiz-session');
const lessonScreen = document.querySelector('#lesson-screen');
const lessonTitle = document.querySelector('#lesson-title');
const lessonSummary = document.querySelector('#lesson-summary');
const lessonEyebrow = document.querySelector('#lesson-eyebrow');
const conceptList = document.querySelector('#concept-list');
const startLessonButton = document.querySelector('#start-lesson');
const courseMenuButton = document.querySelector('#course-menu');
const lessonBackButton = document.querySelector('#lesson-back');
const previousButton = document.querySelector('#previous-button');
const nextButton = document.querySelector('#next-button');
const nextLabel = document.querySelector('#next-label');
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
const matchSubmit = document.querySelector('#match-submit');
const keyboardHint = document.querySelector('.keyboard-hint');
const questionContent = document.querySelector('#question-content');
const results = document.querySelector('#results');

let selectedCourse = null;
let activities = [];
let currentActivityIndex = 0;
let learningStarted = false;
let courseCompleted = false;

function normalizePrompt(prompt) {
  return prompt
    .replace(/slik kurset beskriver utviklingen/gi, 'ut fra utviklingen i HICO/S3000L-fagstoffet')
    .replace(/slik kurset presenterer dem/gi, 'i HICO/S3000L-rammeverket')
    .replace(/slik kurset beskriver (den|det)/gi, 'i HICO/S3000L-fagstoffet')
    .replace(/ifølge kurset/gi, 'i HICO/S3000L-fagstoffet')
    .replace(/kursmaterialets/gi, 'HICO/S3000L-fagstoffets')
    .replace(/kursmaterialet/gi, 'HICO/S3000L-fagstoffet');
}

function isAbbreviationQuestion(question) {
  return question.options.every((option) => /^(?:S\d{4}[A-Z]?|IPS|ILS|PSA|LCN|XML|XSL|SNS|PBS|LCC|HICO|IETP|LSA)\b/i.test(option.trim()));
}

function buildCourseActivities(course) {
  const questions = sourceQuestions.slice(course.start, course.end).map((question, offset) => ({
    ...question,
    prompt: normalizePrompt(question.prompt),
    sourceIndex: course.start + offset,
    offset
  }));
  const foundationQuestions = course.foundation.map((offset) => questions[offset]);
  const appliedQuestions = questions.filter((question) => !course.foundation.includes(question.offset));
  const activitiesForCourse = foundationQuestions.map((question) => ({
    type: 'choice',
    stage: 'Grunnlag',
    question,
    selectedIndex: null
  }));

  if (course.matching) {
    activitiesForCourse.push({
      type: 'match',
      stage: 'Begrepskobling',
      pairs: course.matching,
      selected: null
    });
  }

  appliedQuestions.forEach((question) => {
    activitiesForCourse.push({
      type: 'choice',
      stage: isAbbreviationQuestion(question) ? 'Forkortelser' : 'I praksis',
      question,
      selectedIndex: null
    });
  });

  return activitiesForCourse;
}

function renderCatalog() {
  root.replaceChildren();
  catalog.forEach((course, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'course-option';
    card.dataset.course = course.id;
    const number = document.createElement('span');
    number.className = 'course-number';
    number.textContent = String(index + 1).padStart(2, '0');

    const details = document.createElement('span');
    details.className = 'course-detail';
    const titleText = document.createElement('strong');
    titleText.textContent = course.title;
    const subtitle = document.createElement('span');
    subtitle.textContent = course.subtitle;
    details.append(titleText, subtitle);

    const count = document.createElement('span');
    count.className = 'course-total';
    count.textContent = `${course.end - course.start} spørsmål${course.matching ? ` · ${course.matching.length} begreper` : ''}`;

    const arrow = document.createElement('span');
    arrow.className = 'course-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';

    card.append(number, details, count, arrow);
    card.addEventListener('click', () => openCourse(course));
    root.append(card);
  });
}

function openCourse(course) {
  if (selectedCourse?.id !== course.id) {
    selectedCourse = course;
    activities = buildCourseActivities(course);
    currentActivityIndex = 0;
    learningStarted = false;
    courseCompleted = false;
  }

  coursePicker.hidden = true;
  quizSession.hidden = false;
  courseMenuButton.hidden = false;
  if (courseCompleted) showResults();
  else if (learningStarted) renderActivity();
  else renderLesson();
}

function renderLesson() {
  lessonScreen.hidden = false;
  questionContent.hidden = true;
  results.hidden = true;
  lessonEyebrow.textContent = selectedCourse.subtitle;
  lessonTitle.textContent = selectedCourse.title;
  lessonSummary.textContent = selectedCourse.summary;
  conceptList.replaceChildren();

  selectedCourse.concepts.forEach((concept) => {
    const article = document.createElement('article');
    article.className = 'concept-item';
    const heading = document.createElement('h2');
    heading.textContent = concept.term;
    const definition = document.createElement('p');
    definition.textContent = concept.definition;
    article.append(heading, definition);
    conceptList.append(article);
  });

  startLessonButton.querySelector('span').textContent = learningStarted ? 'Fortsett kurset' : 'Start grunnprøven';
  startLessonButton.focus();
}

function scoreForActivity(activity) {
  if (activity.type === 'choice') {
    return activity.selectedIndex === null ? 0 : Number(activity.selectedIndex === activity.question.answer);
  }
  if (!activity.selected) return 0;
  return activity.pairs.reduce((score, pair, index) => score + Number(activity.selected[index] === index), 0);
}

function maxPossibleScore() {
  return activities.reduce((score, activity) => score + (activity.type === 'match' ? activity.pairs.length : 1), 0);
}

function currentScore() {
  return activities.reduce((score, activity) => score + scoreForActivity(activity), 0);
}

function currentActivityHasAnswer(activity) {
  return activity.type === 'match'
    ? activity.selected !== null
    : activity.selectedIndex !== null;
}

function renderActivity() {
  const activity = activities[currentActivityIndex];
  const activityNumber = String(currentActivityIndex + 1).padStart(2, '0');
  const activityTotal = String(activities.length).padStart(2, '0');
  learningStarted = true;
  lessonScreen.hidden = true;
  questionContent.hidden = false;
  results.hidden = true;
  questionCount.textContent = `OPPGAVE ${activityNumber} / ${activityTotal}`;
  scoreDisplay.textContent = currentScore();
  progress.setAttribute('aria-valuemax', activities.length);
  progress.setAttribute('aria-valuenow', currentActivityIndex);
  progressFill.style.width = `${(currentActivityIndex / activities.length) * 100}%`;
  category.textContent = activity.stage;
  title.textContent = activity.type === 'match' ? 'Koble begrepene til riktig forklaring.' : activity.question.prompt;
  answers.replaceChildren();
  feedback.hidden = true;
  feedback.classList.remove('is-wrong');
  keyboardHint.hidden = activity.type === 'match';
  matchSubmit.hidden = activity.type !== 'match' || currentActivityHasAnswer(activity);
  nextButton.hidden = !currentActivityHasAnswer(activity);
  nextButton.disabled = !currentActivityHasAnswer(activity);
  nextLabel.textContent = currentActivityIndex === activities.length - 1 ? 'Se resultatet' : 'Neste';
  previousButton.disabled = false;
  previousButton.querySelector('span').textContent = '←';
  previousButton.lastChild.textContent = currentActivityIndex === 0 ? ' Til leksjonen' : ' Forrige';

  if (activity.type === 'match') renderMatching(activity);
  else renderChoice(activity);

  if (currentActivityHasAnswer(activity)) renderSavedFeedback(activity);
}

function renderChoice(activity) {
  activity.question.options.forEach((option, optionIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer';
    button.setAttribute('aria-pressed', String(activity.selectedIndex === optionIndex));
    const key = document.createElement('span');
    key.className = 'answer-key';
    key.setAttribute('aria-hidden', 'true');
    key.textContent = String.fromCharCode(65 + optionIndex);
    const text = document.createElement('span');
    text.className = 'answer-text';
    text.textContent = option;
    button.append(key, text);
    button.addEventListener('click', () => {
      activity.selectedIndex = optionIndex;
      renderActivity();
    });
    answers.append(button);
  });

  if (activity.selectedIndex !== null) applyChoiceStates(activity);
}

function applyChoiceStates(activity) {
  [...answers.children].forEach((button, optionIndex) => {
    if (optionIndex === activity.question.answer) button.classList.add('correct');
    else if (optionIndex === activity.selectedIndex) button.classList.add('incorrect');
    else button.classList.add('dimmed');
  });
}

function renderMatching(activity) {
  const options = [...activity.pairs.keys()];
  for (let index = options.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [options[index], options[randomIndex]] = [options[randomIndex], options[index]];
  }
  activity.optionOrder = options;

  activity.pairs.forEach((pair, pairIndex) => {
    const row = document.createElement('div');
    row.className = 'match-row';
    const prompt = document.createElement('label');
    prompt.className = 'match-prompt';
    prompt.htmlFor = `course-match-${pairIndex}`;
    prompt.textContent = pair.left;
    const select = document.createElement('select');
    select.className = 'match-select';
    select.id = `course-match-${pairIndex}`;
    select.setAttribute('aria-label', `Forklaring for ${pair.left}`);
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Velg forklaring';
    select.append(placeholder);
    options.forEach((optionIndex) => {
      const option = document.createElement('option');
      option.value = String(optionIndex);
      option.textContent = activity.pairs[optionIndex].right;
      select.append(option);
    });
    if (activity.selected) select.value = String(activity.selected[pairIndex]);
    select.addEventListener('change', () => {
      const selects = [...answers.querySelectorAll('.match-select')];
      const selectedValues = selects.map((item) => item.value).filter(Boolean);
      selects.forEach((item) => {
        [...item.options].forEach((option) => {
          option.disabled = option.value !== '' && option.value !== item.value && selectedValues.includes(option.value);
        });
      });
      matchSubmit.disabled = selects.some((item) => !item.value);
    });
    row.append(prompt, select);
    answers.append(row);
  });
  matchSubmit.disabled = true;
  matchSubmit.hidden = activity.selected !== null;
  if (activity.selected) applyMatchingStates(activity);
}

function applyMatchingStates(activity) {
  [...answers.querySelectorAll('.match-row')].forEach((row, pairIndex) => {
    const chosenIndex = activity.selected[pairIndex];
    const isCorrect = chosenIndex === pairIndex;
    row.classList.add(isCorrect ? 'correct' : 'incorrect');
    row.querySelector('select').disabled = true;
    if (!isCorrect) {
      const correction = document.createElement('span');
      correction.className = 'match-correction';
      correction.textContent = `Riktig kobling: ${activity.pairs[pairIndex].right}`;
      row.append(correction);
    }
  });
}

function renderSavedFeedback(activity) {
  const points = scoreForActivity(activity);
  const max = activity.type === 'match' ? activity.pairs.length : 1;
  const isCorrect = points === max;
  feedback.hidden = false;
  feedback.classList.toggle('is-wrong', !isCorrect);
  feedbackIcon.textContent = isCorrect ? '✓' : '×';
  feedbackTitle.textContent = isCorrect ? 'Helt riktig!' : 'Her er fasiten.';
  feedbackCopy.textContent = activity.type === 'match'
    ? `${points} av ${max} begreper koblet riktig.`
    : isCorrect ? 'Du valgte riktig alternativ.' : `Riktig svar er: ${activity.question.options[activity.question.answer]}`;
  scoreDisplay.textContent = currentScore();
}

function submitMatching() {
  const activity = activities[currentActivityIndex];
  const selects = [...answers.querySelectorAll('.match-select')];
  if (selects.some((select) => select.value === '')) return;
  activity.selected = selects.map((select) => Number(select.value));
  renderActivity();
}

function showResults() {
  courseCompleted = true;
  questionContent.hidden = true;
  lessonScreen.hidden = true;
  results.hidden = false;
  const points = currentScore();
  const maximum = maxPossibleScore();
  const ratio = points / maximum;
  document.querySelector('#final-score').textContent = points;
  document.querySelector('#final-total').textContent = maximum;
  document.querySelector('#result-title').textContent = ratio === 1 ? 'Full pott!' : ratio >= 0.625 ? 'God forståelse.' : 'God øving.';
  document.querySelector('#result-copy').textContent = `${selectedCourse.title}: ${points} av ${maximum} mulige poeng.`;
  progress.setAttribute('aria-valuenow', activities.length);
  progressFill.style.width = '100%';
  questionCount.textContent = 'KURS FULLFØRT';
  scoreDisplay.textContent = points;
}

function showCourseMenu() {
  quizSession.hidden = true;
  coursePicker.hidden = false;
  courseMenuButton.hidden = true;
  document.querySelector('#course-title').focus();
}

function navigatePrevious() {
  if (currentActivityIndex === 0) {
    renderLesson();
    return;
  }
  currentActivityIndex -= 1;
  renderActivity();
}

function navigateNext() {
  if (!currentActivityHasAnswer(activities[currentActivityIndex])) return;
  if (currentActivityIndex === activities.length - 1) {
    showResults();
    return;
  }
  currentActivityIndex += 1;
  renderActivity();
  title.focus();
}

startLessonButton.addEventListener('click', () => {
  learningStarted = true;
  renderActivity();
  title.focus();
});

lessonBackButton.addEventListener('click', showCourseMenu);
courseMenuButton.addEventListener('click', showCourseMenu);
previousButton.addEventListener('click', navigatePrevious);
nextButton.addEventListener('click', navigateNext);
matchSubmit.addEventListener('click', submitMatching);
document.querySelector('#return-button').addEventListener('click', showCourseMenu);
document.querySelector('#restart-button').addEventListener('click', () => {
  activities = buildCourseActivities(selectedCourse);
  currentActivityIndex = 0;
  learningStarted = true;
  courseCompleted = false;
  renderActivity();
});

document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat || quizSession.hidden || lessonScreen.hidden) return;
  if (event.key === 'Escape') showCourseMenu();
});

renderCatalog();
