const Course = ({ course }) => {
  const { name, parts } = course;
  const total = parts.reduce((acc, part) => {
    return acc += part.exercises;
  }, 0);

  return (
    <div>
      <h1>{name}</h1>
      <div>
        {parts.map(part => {
          return (
            <div key={part.id}>
              {part.name} {part.exercises}
            </div>
          );
        })}
      </div>
      <div>
        <strong>total of {total} exercises</strong>
      </div>
    </div>
  )
}

export default Course;