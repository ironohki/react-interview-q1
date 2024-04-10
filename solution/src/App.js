import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import { isNameValid, getLocations } from './mock-api/apis';
import './App.css';

function App() {
  /* ============================
     ====== UseState Hooks ======
     ============================ */

  // Tracks if the application is in a loading state. 
  const [isLoading, setIsLoading] = useState(false);

  // Tracks the name and location value the user has entered.
  const [nameValue, setNameValue] = useState("");
  const [locationValue, setLocationValue] = useState("");

  // We track both if the name is valid and null. 
  // We do not want to display an error when the user has entered nothing.
  const [nameIsValid, setNameIsValid] = useState(false);
  const [nameIsNull, setNameIsNull] = useState(true);

  // Store list of locations. 
  const [locationsList, setLocationsList] = useState([]);
  const [userEnteredRecords, setUserEnteredRecords] = useState([]);

  /* =============================
     ====== UseEffect Hooks ======
     ============================= */

  // This useEffect will trigger when nameValue changes.
  // It adds a debounce buffer, to reduce the number of API calls. 
  useEffect(() => {
    // sets the loading state displayed to the user.
    if (nameValue !== "") {
      setIsLoading(true);
    }

    // creates a 300 millisecond timer before triggering checkName to allow the user to finish typing. 
    const debounceCheckName = setTimeout(() => {
      validateName();
    }, 300);

    // resets the debounce on every keypress
    return () => clearTimeout(debounceCheckName)
  }, [nameValue]);

  useEffect(() => {
    loadLocations();
  },[]);

  /* ============================
     ====== Event Handlers ======
     ============================ */

  // Binds nameValue to on change input.
  const onChangeName = async (event) => {
    setNameValue(event.target.value);
  };

  const onChangeLocation = (event) => {
    setLocationValue(event.target.value);
  }

  // Populate the user entered data when the user clicks Add. 
  const onClickAdd = () => {
    const newRecord = (
      <div>
        <div>{ nameValue }</div>
        <div>{ locationValue }</div>
      </div>
    );
    setUserEnteredRecords(userEnteredRecords => [...userEnteredRecords, newRecord]);
    setNameValue("");
    setLocationValue("");
  };

  // Clear the user entered data when the user clicks Clear. 
  // Clears any user entered data as well. 
  const onClickClear = () => {
    setUserEnteredRecords([]);
    setNameValue("");
    setLocationValue("");
  };

  // This async method will check if the name is valid. 
  // It looks at the entered useState value.
  const validateName = async () => {
    if (nameValue === "") {
      // No need to make an API call if the value is null. 
      setNameIsNull(true);
      setIsLoading(false);
    } else {
      setNameIsNull(false);
      // Send the entered value to the API.
      const result = await isNameValid(nameValue)
        .then((result) => {
          // Use the result to set form states.
          setNameIsValid(result);
          setIsLoading(false);
        });
    }
  };

  const loadLocations = () => {
    const response = getLocations()
      .then((result) => {
        setLocationsList(result);
      });
  }

  /* ======================================
     ====== Data Responsive Elements ======
     ====================================== */

  // Define element arrays. In Typescript I would type this as Array<JSX.Element>.
  const locationOptions = [];

  // Populate the locations option list.
  // Refreshes on page redraw. 
  locationsList.forEach((location) => {
    locationOptions.push(
      <option key={`option_${location}`} value={`${location}`}>
        {location}
      </option>
    );
  });

  /* =============================
    ====== Returned Element ======
    ============================== */

  return (
    <div className="App">
      <>
        <div>
          <label>
            Name
          </label>
          <input type="text" value={nameValue} onChange={onChangeName} />
          { isLoading &&
            <div className="loading">checking...</div>
          }
          { !nameIsNull && !isLoading && 
            <>
              { !nameIsValid && 
                <div className="alert">This name has already been taken.</div>
              }
              { nameIsValid &&
                <div className="alert">This name is good.</div>
              }
            </>
          }
        </div>
        <div> 
          <label htmlFor="form_location">
            Location
          </label>
          <select itemID="form_location" value={locationValue} onChange={onChangeLocation}>
            <option>Select Location...</option>
            { locationOptions }
          </select>
        </div>
        <div>
          <button onClick={onClickClear}>Clear</button>
          <button onClick={onClickAdd}>Add</button>
        </div>
        <div className="table">
          <div className="header">
            <div>Name</div>
            <div>Location</div>
          </div>
          { userEnteredRecords }
        </div>
      </>
    </div>
  );
}

export default App;
