import { useEffect, useState } from "react";
import personsService from "./services/persons";
import Notification from "./components/Notification";
import "./index.css";

const Filter = ({ handleSearch, search }) => {
  return (
    <div>
      filter shown with <input onChange={handleSearch} value={search} />
    </div>
  );
};

const PersonForm = ({
  handleNameChange,
  handleNumberChange,
  handleSubmit,
  newName,
  newNumber,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div>
        name: <input onChange={handleNameChange} value={newName} />
      </div>
      <div>
        number: <input onChange={handleNumberChange} value={newNumber} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

const Persons = ({ search, persons, handleDelete }) => {
  const filteredPersons =
    search.length > 0
      ? persons.filter((person) =>
          person.name.toLowerCase().includes(search.toLowerCase())
        )
      : persons;

  return (
    <div>
      {filteredPersons.map((person) => (
        <div key={person.id}>
          {person.name} {person.number}
          <button onClick={() => handleDelete(person.id)}>delete</button>
        </div>
      ))}
    </div>
  );
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    personsService.getAll().then((response) => {
      setPersons(response);
    });
  }, []);

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const existingPerson = persons.find((person) => person.name === newName);

    if (
      existingPerson &&
      window.confirm(
        `${newName} is already added to phonebook. Replace the old number with a new one?`
      )
    ) {
      personsService
        .update(existingPerson.id, {
          ...existingPerson,
          number: newNumber,
        })
        .then((response) => {
          setPersons(
            persons.map((person) =>
              person.id === response.id ? response : person
            )
          );
          setNewName("");
          setNewNumber("");
        })
        .catch((error) => {
          setMessage(
            `Information of ${newName} has already been removed from server`
          );
        });
      return;
    } else if (existingPerson) {
      return;
    }

    personsService
      .create({
        name: newName,
        number: newNumber,
      })
      .then((response) => {
        setPersons(persons.concat(response));
        setNewName("");
        setNewNumber("");
        setMessage(`Added ${newName}`);
      });
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const handleDelete = (id) => {
    if (
      window.confirm(
        `Delete ${persons.find((person) => person.id === id).name}?`
      )
    ) {
      personsService.remove(id).then((response) => {
        console.log("delete", response);
        setPersons(persons.filter((person) => person.id !== id));
      });
    }
  };

  return (
    <div>
      <h2>Phonebook</h2>
      {message && <Notification message={message} />}
      <Filter handleSearch={handleSearch} search={search} />
      <h3>Add a new</h3>
      <PersonForm
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        handleSubmit={handleSubmit}
        newName={newName}
        newNumber={newNumber}
      />
      <h3>Numbers</h3>
      <Persons search={search} persons={persons} handleDelete={handleDelete} />
    </div>
  );
};

export default App;
