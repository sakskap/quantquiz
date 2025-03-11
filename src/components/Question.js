export default function Question({ question, dispatch, answer }) {
  return (
    <div>
      <h4>{question.question}</h4>
      <div className="options" role="radiogroup" aria-labelledby={`question-${question.id}`}>
        {question.options.map((option, i) => {
          const isCorrect = i === question.correctOption;
          const isSelected = i === answer;

          return (
            <button
              key={i}
              className={`btn btn-option
                ${isSelected ? (isCorrect ? "correct" : "wrong") : ""}
                ${answer !== null && isCorrect ? "correct" : ""}
              `}
              onClick={() => dispatch({ type: "newAnswer", payload: i })}
              disabled={answer !== null}
              role="radio"
              aria-checked={isSelected}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
