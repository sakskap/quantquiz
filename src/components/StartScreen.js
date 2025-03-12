// StartScreen.js

export default function StartScreen({ numQuestions, dispatch, selectedTest }) {
  return (
    <div className="start-screen">
      <h2>Welcome to your {selectedTest} Mastery Quiz!</h2>
      <h2>You have {numQuestions} questions to answer.</h2>
      <button className="btn" onClick={() => dispatch({ type: "start" })}>
        Get Started
      </button>
    </div>
  );
}
