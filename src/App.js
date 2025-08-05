import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';

const BASE_URL = process.env.REACT_APP_API || 'http://127.0.0.1:5000';


function App() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [events, setEvents] = useState([]);
  const [editId, setEditId] = useState(null);
  // const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [personInput, setPersonInput] = useState('');
  const [peopleList, setPeopleList] = useState([]);

  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensesList, setExpensesList] = useState([]);

  // 🔄 Load from API
  useEffect(() => {
    axios.get(`${BASE_URL}/api/events`)
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, []);

  // --------------------
  // 📌 Add or Update
  // --------------------
  function handleSubmit(e) {
    e.preventDefault();
    if (parseFloat(budget) < 0) {
      alert("Budget can't be negative!");
      return;
    }
    const newEvent = {
      name, date, desc, location, budget,
      completed: false,
      people: peopleList,
      expenses: expensesList,
      rating: 0
    };

    if (!editId) {
      axios.post(`${BASE_URL}/api/events`, newEvent)


        .then(res => {
          setEvents([...events, res.data.event]);
          resetForm();
        })
        .catch(err => console.error(err));
    } else {
      axios.put(`${BASE_URL}/api/events/${editId}`, newEvent)
        .then(res => {
          const idx = events.findIndex(e => e.id === editId);
          const updated = [...events];
          updated[idx] = res.data.event;
          setEvents(updated);
          resetForm();
        })
        .catch(err => console.error(err));
    }
  }


  function resetForm() {
    setName('');
    setDate('');
    setDesc('');
    setLocation('');
    setBudget('');
    setEditId(null);
    setPeopleList([]);
    setExpensesList([]);
  }


  function addPerson() {
    if (personInput.trim()) {
      setPeopleList([...peopleList, personInput.trim()]);
      setPersonInput('');
    }
  }

  function addExpense() {
    if (expenseDesc && expenseAmount && !isNaN(expenseAmount)) {
      setExpensesList([...expensesList, { description: expenseDesc, amount: parseFloat(expenseAmount) }]);
      setExpenseDesc('');
      setExpenseAmount('');
    }
  }


  // --------------------
  // 📌 Delete
  // --------------------
  function deleteEvent(id) {
    axios.delete(`${BASE_URL}/api/events/${id}`)

      .then(() => setEvents(events.filter(e => e.id !== id)))
      .catch(err => console.error(err));
  }


  // --------------------
  // 📌 Edit
  // --------------------
  function startEdit(id) {
    const e = events.find(ev => ev.id === id);
    if (!e) return;
    setName(e.name);
    setDate(e.date);
    setDesc(e.desc);
    setLocation(e.location);
    setBudget(e.budget);
    setEditId(id);
    setPeopleList(e.people || []);
    setExpensesList(e.expenses || []);
  }


  // --------------------
  // 📌 Toggle Complete
  // --------------------
  function toggleComplete(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;
    const updatedEvent = { ...event, completed: !event.completed };

    axios.put(`${BASE_URL}/api/events/${id}`, updatedEvent)

      .then(res => {
        const idx = events.findIndex(e => e.id === id);
        const updated = [...events];
        updated[idx] = res.data.event;
        setEvents(updated);
      })
      .catch(err => console.error(err));
  }


  // --------------------
  // 📌 Filter
  // --------------------
  const filteredEvents = events.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --------------------
  // 📌 Totals
  // --------------------
  const totalPeople = events.reduce((acc, e) => acc + e.people.length, 0);
  const totalExpenses = events.reduce(
    (acc, e) => acc + e.expenses.reduce((sum, ex) => sum + parseFloat(ex.amount), 0),
    0
  );

  // if (!role) {
  //   return authMode === 'login'
  //     ? <Login onLogin={(r) => setRole(r)} switchToRegister={() => setAuthMode('register')} />
  //     : <Register onRegister={(r) => setRole(r)} switchToLogin={() => setAuthMode('login')} />;
  // }

  // if (!role) {
  //   return authMode === 'login'
  //     ? <Login onLogin={(r) => setRole(r)} switchToRegister={() => setAuthMode('register')} />
  //     : <Register onRegister={(r) => setRole(r)} switchToLogin={() => setAuthMode('login')} />
  // }

  // if (!role) {
  //   return authMode === 'login'
  //   ? <Register onRegister={(r) => setRole(r)} switchToLogin={() => setAuthMode('login')} />
  //   : <Login onLogin={(r) => setRole(r)} switchToRegister={() => setAuthMode('register')} />;
  // }

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', background: '#e6e27bac', minHeight: '100vh' }}>

      {/* <button
        onClick={() => {
          localStorage.clear();
          setRole(null);
        }}
        style={{
          float: 'right',
          marginBottom: '10px',
          background: '#b74d57',
          color: '#fff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button> */}

      <h1 style={{ textAlign: 'center', color: '#444' }}>Event Manager</h1>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '20px' }}>
        <div style={totalBox}><strong>Total People:</strong> {totalPeople}</div>
        <div style={totalBox}><strong>Total Expenses:</strong> ₹{totalExpenses}</div>
      </div>



      <input
        type="text"
        placeholder="Search event by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ display: 'block', margin: '0 auto 20px auto', padding: '10px', width: '60%', borderRadius: '6px', border: '1px solid #bbb' }}
      />

      {/* {role === 'admin' && ( */}
        <form onSubmit={handleSubmit} style={formBox}>
          <input placeholder="Event Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={inputStyle} />
          <input placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} required style={inputStyle} />
          <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />
          <input type="number" placeholder="Budget ₹" value={budget} onChange={(e) => setBudget(e.target.value)} style={inputStyle} />

          {/* People Section */}
          <div>
            <input
              placeholder="Add person"
              value={personInput}
              onChange={(e) => setPersonInput(e.target.value)}
              style={inputStyle}
            />
            <button type="button" onClick={addPerson} style={{ ...smallButton, marginBottom: '10px' }}>Add Person</button>
            <ul>
              {peopleList.map((p, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="text"
                    value={p}
                    onChange={(e) => {
                      const updated = [...peopleList];
                      updated[i] = e.target.value;
                      setPeopleList(updated);
                    }}
                    style={{ flexGrow: 1, padding: '4px' }}
                  />
                  <button type="button" onClick={() => {
                    setPeopleList(peopleList.filter((_, index) => index !== i));
                  }} style={{ ...smallButton, background: '#b74d57ff' }}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>

          </div>

          {/* Expenses Section */}
          <div>
            <input
              placeholder="Expense description"
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Amount"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              style={inputStyle}
            />
            <button type="button" onClick={addExpense} style={{ ...smallButton, marginBottom: '10px' }}>Add Expense</button>
            <ul>
              {expensesList.map((ex, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <input
                    type="text"
                    value={ex.description}
                    onChange={(e) => {
                      const updated = [...expensesList];
                      updated[i].description = e.target.value;
                      setExpensesList(updated);
                    }}
                    placeholder="Description"
                    style={{ flex: 2, padding: '4px' }}
                  />
                  <input
                    type="number"
                    value={ex.amount}
                    onChange={(e) => {
                      const updated = [...expensesList];
                      updated[i].amount = parseFloat(e.target.value) || 0;
                      setExpensesList(updated);
                    }}
                    placeholder="Amount"
                    style={{ flex: 1, padding: '4px' }}
                  />
                  <button type="button" onClick={() => {
                    setExpensesList(expensesList.filter((_, index) => index !== i));
                  }} style={{ ...smallButton, background: '#b74d57ff' }}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>

          </div>


          <button type="submit" style={{ ...buttonStyle, background: editId === null ? '#6142aeff' : '#6fc884ff' }}>
            {editId === null ? 'Add Event' : 'Update Event'}
          </button>

        </form>

      {/* )} */}

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {filteredEvents.map((e) => (
          <div key={e.id} style={eventBox}>
            <h3 style={{ color: '#333' }}>{e.name} {e.completed && <span style={{ color: 'green' }}>(Completed)</span>}</h3>
            {e.completed && (
              <div style={{ marginTop: '10px' }}>
                <label><strong>Rating:</strong></label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={e.rating}
                  onChange={(ev) => {
                    const updated = { ...e, rating: parseFloat(ev.target.value) || 0 };
                    axios.put(`${BASE_URL}/api/events/${e.id}`, updated)


                      .then(res => {
                        const idx = events.findIndex(ev => ev.id === e.id);
                        const newEvents = [...events];
                        newEvents[idx] = res.data.event;
                        setEvents(newEvents);
                      });
                  }}
                  style={{ marginLeft: '10px', padding: '4px', width: '60px' }}
                />
              </div>
            )}

            <p><strong>Date:</strong> {e.date} | <strong>Location:</strong> {e.location}</p>
            <p>{e.desc}</p>
            <p><strong>Budget:</strong> ₹{e.budget}</p>
            <div>
              <strong>People:</strong>
              <ul>
                {e.people.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            <div>
              <strong>Expenses:</strong>
              <ul>
                {e.expenses.map((ex, i) => (
                  <li key={i}>{ex.description} — ₹{parseFloat(ex.amount).toFixed(2)}</li>
                ))}
              </ul>
              <p><strong>Total Expenses:</strong> ₹{e.expenses.reduce((acc, ex) => acc + parseFloat(ex.amount), 0).toFixed(2)}</p>
            </div>

            {/* {role === 'admin' && (
              <> */}
                <button onClick={() => toggleComplete(e.id)} style={smallButton}>
                  {e.completed ? 'Undo' : 'Complete'}
                </button>
                <button onClick={() => startEdit(e.id)} style={{ ...smallButton, background: '#957d34ff' }}>Edit</button>
                <button onClick={() => deleteEvent(e.id)} style={{ ...smallButton, background: '#b74d57ff' }}>Delete</button>
              {/* </>
            )} */}

            <div style={{ marginTop: '15px' }}>

              {/* <QRCodeCanvas
                value={JSON.stringify({
                  name: e.name,
                  date: e.date,
                  desc: e.desc,
                  location: e.location,
                  budget: e.budget,
                  people: e.people,
                  expenses: e.expenses
                })}
                size={128}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={true}
              /> */}

              <div style={{ marginTop: '15px' }}>

                <QRCodeCanvas
                  value={`Event: ${e.name}
                  Date: ${e.date}
                  Location: ${e.location}
                  Description: ${e.desc}
                  Budget: ₹${e.budget}
                  People: ${e.people.join(', ')}
                  Expenses: ₹${e.expenses.reduce((sum, ex) => sum + parseFloat(ex.amount), 0).toFixed(2)}`}
                  size={128}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                />
              </div>

            </div>
          </div>


        ))}

      </div>

    </div>
  );
}

const totalBox = {
  background: '#fff', padding: '15px 30px',
  borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
};
const formBox = {
  maxWidth: '600px', margin: '0 auto', marginBottom: '25px',
  background: '#fff', padding: '20px', borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(48, 164, 42, 0.76)'
};
const inputStyle = {
  display: 'block', width: '100%', padding: '10px',
  marginBottom: '10px', borderRadius: '6px', border: '1px solid #bbb'
};
const buttonStyle = {
  display: 'block', width: '100%', padding: '12px',
  borderRadius: '6px', border: 'none', color: '#fff',
  fontWeight: 'bold', cursor: 'pointer'
};
const eventBox = {
  background: '#e3b7aeff', padding: '20px', marginBottom: '15px',
  borderRadius: '10px', boxShadow: '0 3px 6px rgba(0,0,0,0.08)'
};
const smallButton = {
  padding: '6px 10px', borderRadius: '4px',
  border: 'none', color: '#fff', cursor: 'pointer',
  background: '#6f5eb8ff', marginRight: '6px'
};

export default App;
