import { useEffect, useReducer, useMemo } from "react";
import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishScreen from "./FinishScreen";
import Footer from "./Footer";
import Timer from "./Timer";
import "../index.css";

const SECS_PER_QUESTION = 75;

const TEST_SOURCES = {
  GRE: "https://raw.githubusercontent.com/sakskap/grequiz/refs/heads/main/questions.json",
  GMAT: "https://raw.githubusercontent.com/sakskap/grequiz/refs/heads/main/questions.json",
  SAT: "https://raw.githubusercontent.com/sakskap/grequiz/refs/heads/main/questions.json",
};

const initialState = {
  questions: [],
  status: "home", // Displays test selection initially.
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: null,
  answersStatus: [],
  userAnswers: [],
  email: "",
  selectedTest: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "selectTest":
      return { ...state, selectedTest: action.payload, status: "loading" };
    case "dataReceived":
      return {
        ...state,
        questions: action.payload,
        status: "ready",
        answersStatus: new Array(action.payload.length).fill("unanswered"),
      };
    case "dataFailed":
      return { ...state, status: "error" };
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * SECS_PER_QUESTION,
      };
    case "newAnswer": {
      const question = state.questions[state.index];
      const newAnswersStatus = [...state.answersStatus];
      newAnswersStatus[state.index] =
        action.payload === question.correctOption ? "correct" : "incorrect";
      const newUserAnswers = [...state.userAnswers];
      newUserAnswers[state.index] = action.payload;
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
        answersStatus: newAnswersStatus,
        userAnswers: newUserAnswers,
      };
    }
    case "skipQuestion": {
      const newIndex = state.index + 1;
      const skippedAnswersStatus = [...state.answersStatus];
      skippedAnswersStatus[state.index] = "skipped";
      const newUserAnswers = [...state.userAnswers];
      newUserAnswers[state.index] = null;
      return {
        ...state,
        index: newIndex,
        answer: null,
        answersStatus: skippedAnswersStatus,
        userAnswers: newUserAnswers,
        status: newIndex >= state.questions.length ? "finished" : state.status,
      };
    }
    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };
    case "goToQuestion":
      return {
        ...state,
        index: action.payload,
        answer: state.userAnswers[action.payload] ?? null,
      };
    case "finish":
      return {
        ...state,
        status: "finished",
        highscore: Math.max(state.points, state.highscore),
      };
    case "restart":
      return {
        ...initialState,
        questions: state.questions,
        status: "ready",
        answersStatus: new Array(state.questions.length).fill("unanswered"),
        selectedTest: state.selectedTest,
      };
    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
        highscore:
          state.secondsRemaining === 0
            ? Math.max(state.points, state.highscore)
            : state.highscore,
      };
    case "setEmail":
      return { ...state, email: action.payload };
    default:
      throw new Error("Action unknown");
  }
}

function useQuiz() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  useEffect(() => {
    if (!state.selectedTest) return;
    fetch(TEST_SOURCES[state.selectedTest])
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataReceived", payload: data.questions }))
      .catch(() => dispatch({ type: "dataFailed" }));
  }, [state.selectedTest]);

  return { state, dispatch };
}

function HomeScreen({ dispatch }) {
  return (
    <div className="home-screen">
      <h1>Choose Your Test</h1>
      <div className="test-options">
        {Object.keys(TEST_SOURCES).map((test) => (
          <button
            key={test}
            className="btn btn-test"
            onClick={() => dispatch({ type: "selectTest", payload: test })}
          >
            {test}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuestionsMap({ answersStatus, dispatch, currentIndex }) {
  return (
    <div className="questions-map">
      {answersStatus.map((status, index) => (
        <button
          key={index}
          className={`status-dot ${status} ${index === currentIndex ? "active" : ""}`}
          onClick={() =>
            status === "unanswered" && dispatch({ type: "goToQuestion", payload: index })
          }
          disabled={status !== "unanswered"}
          aria-label={`Go to question ${index + 1} - ${status}`}
          title={`Question ${index + 1} - ${status}`}
        />
      ))}
    </div>
  );
}

export default function App() {
  const { state, dispatch } = useQuiz();
  const {
    questions,
    status,
    index,
    answer,
    points,
    highscore,
    secondsRemaining,
    answersStatus,
    userAnswers,
    email,
    selectedTest,
  } = state;

  const numQuestions = questions.length;
  const maxPossiblePoints = useMemo(
    () => questions.reduce((prev, cur) => prev + cur.points, 0),
    [questions]
  );

  return (
    <div className="wrapper">
      <div className="app">
        <div className="headerWrapper">
          {/* Pass selectedTest to Header so it can update its message */}
          <Header selectedTest={selectedTest} />
          <Main>
            {status === "home" && <HomeScreen dispatch={dispatch} />}
            {status === "loading" && <Loader />}
            {status === "error" && <Error />}
            {status === "ready" && (
              <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
            )}
            {status === "active" && (
              <>
                <h2>{selectedTest} Quiz</h2>
                <div className="timer-container">
                  <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
                </div>
                <Progress
                  index={index}
                  numQuestions={numQuestions}
                  points={points}
                  maxPossiblePoints={maxPossiblePoints}
                  answer={answer}
                />
                <QuestionsMap
                  answersStatus={answersStatus}
                  dispatch={dispatch}
                  currentIndex={index}
                />
                <Question
                  question={questions[index]}
                  dispatch={dispatch}
                  answer={answer}
                />
                <Footer>
                  <div className="footer-buttons">
                    {answer === null && (
                      <button
                        className="btn btn-skip"
                        onClick={() => dispatch({ type: "skipQuestion" })}
                        aria-label="Skip current question"
                      >
                        Skip
                      </button>
                    )}
                    <NextButton
                      dispatch={dispatch}
                      answer={answer}
                      numQuestions={numQuestions}
                      index={index}
                    />
                  </div>
                </Footer>
              </>
            )}
            {status === "finished" && (
              <FinishScreen
                points={points}
                maxPossiblePoints={maxPossiblePoints}
                highscore={highscore}
                dispatch={dispatch}
                questions={questions}
                userAnswers={userAnswers}
                email={email}
              />
            )}
          </Main>
        </div>
      </div>
    </div>
  );
}
