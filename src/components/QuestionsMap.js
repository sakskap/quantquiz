function QuestionsMap({ answersStatus }) {
  return (
    <div className="questions-map">
      {answersStatus.map((status, index) => (
        <div 
          key={index}
          className={`status-dot ${status}`}
          title={`Question ${index + 1} - ${status}`}
        />
      ))}
    </div>
  );
}