export default function Question({ question, dispatch, answer }) {
  return (
    <div>
      <h4>{question.question}</h4>
      <div className="options" role="radiogroup" aria-labelledby={`question-${question.id}`}>
        {question.options.map((option, i) => (
          <button
            key={i}
            className={`btn btn-option ${answer === i ? "answer" : ""} ${
              answer !== null && i === question.correctOption ? "correct" : ""
            }`}
            onClick={() => dispatch({ type: "newAnswer", payload: i })}
            disabled={answer !== null}
            role="radio"
            aria-checked={answer === i}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}