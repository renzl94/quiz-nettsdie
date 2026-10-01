const questions = window.quizQuestions;

let currentIndex = 0;
let correctCount = 0;
let hasAnswered = false;

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
const questionContent = document.querySelector('#question-content');
const results = document.querySelector('#results');

function renderQuestion() {
  const question = questions[currentIndex];
  hasAnswered = false;
  questionCount.textContent = `SPØRSMÅL ${String(currentIndex + 1).padStart(3, '0')} / ${String(questions.length).padStart(3, '0')}`;
  scoreDisplay.textContent = correctCount;
  progress.setAttribute('aria-valuemax', questions.length);
  progress.setAttribute('aria-valuenow', currentIndex);
  progressFill.style.width = `${(currentIndex / questions.length) * 100}%`;
  category.textContent = question.category;
  title.textContent = question.prompt;
  answers.replaceChildren();
  feedback.hidden = true;
  feedback.classList.remove('is-wrong');
  nextButton.hidden = true;

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
    button.addEventListener('click', () => selectAnswer(optionIndex));
    answers.append(button);
  });
}

function selectAnswer(selectedIndex) {
  if (hasAnswered) return;
  hasAnswered = true;
  const question = questions[currentIndex];
  const isCorrect = selectedIndex === question.answer;
  if (isCorrect) correctCount += 1;
  progress.setAttribute('aria-valuenow', currentIndex + 1);
  progressFill.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  [...answers.children].forEach((button, optionIndex) => {
    button.disabled = true;
    if (optionIndex === question.answer) button.classList.add('correct');
    else if (optionIndex === selectedIndex) button.classList.add('incorrect');
    else button.classList.add('dimmed');
  });
  scoreDisplay.textContent = correctCount;
  feedback.hidden = false;
  feedback.classList.toggle('is-wrong', !isCorrect);
  feedbackIcon.textContent = isCorrect ? '✓' : '×';
  feedbackTitle.textContent = isCorrect ? 'Helt riktig!' : 'Ikke helt, men nå vet du det.';
  feedbackCopy.textContent = isCorrect
    ? 'Du valgte riktig alternativ.'
    : `Riktig svar er: ${question.options[question.answer]}`;
  nextLabel.textContent = currentIndex === questions.length - 1 ? 'Se resultatet' : 'Neste spørsmål';
  nextButton.hidden = false;
  nextButton.focus();
}

function showResults() {
  questionContent.hidden = true;
  results.hidden = false;
  document.querySelector('#final-score').textContent = correctCount;
  document.querySelector('#final-total').textContent = questions.length;
  const ratio = correctCount / questions.length;
  document.querySelector('#result-title').textContent = ratio === 1 ? 'Full pott!' : ratio >= 0.625 ? 'Dette kan du.' : 'God øving.';
  document.querySelector('#result-copy').textContent = ratio === 1
    ? 'Du svarte riktig på alt. Kunnskapen sitter.'
    : `${correctCount} av ${questions.length} riktige. Gå gjerne gjennom spørsmålene en gang til, så sitter enda mer.`;
  progress.setAttribute('aria-valuenow', questions.length);
  progressFill.style.width = '100%';
  questionCount.textContent = 'RUNDE FULLFØRT';
}

nextButton.addEventListener('click', () => {
  if (currentIndex === questions.length - 1) showResults();
  else {
    currentIndex += 1;
    renderQuestion();
    title.focus();
  }
});

document.querySelector('#restart-button').addEventListener('click', () => {
  currentIndex = 0;
  correctCount = 0;
  questionContent.hidden = false;
  results.hidden = true;
  renderQuestion();
  answers.querySelector('button')?.focus();
});

document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  if (results.hidden && !hasAnswered && /^[1-4]$/.test(event.key)) answers.children[Number(event.key) - 1]?.click();
  else if (results.hidden && hasAnswered && (event.key === 'Enter' || event.key === ' ')) {
    if (document.activeElement !== nextButton) return;
    event.preventDefault();
    nextButton.click();
  }
});

renderQuestion();