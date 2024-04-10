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

  // Tracks both if the name is valid and null. 
  // This prevents an error display when the user has entered nothing.
  const [nameIsValid, setNameIsValid] = useState(false);
  const [nameIsNull, setNameIsNull] = useState(true);

  // Store list of locations. 
  const [locationsList, setLocationsList] = useState([]);

  // Build the displayed list of records.
  const [userEnteredRecords, setUserEnteredRecords] = useState([]);

  /* =============================
     ====== UseEffect Hooks ======
     ============================= */

  // This useEffect will trigger when nameValue changes.
  // It adds a debounce buffer, to reduce the number of API calls. 
  useEffect(() => {
    // Sets the loading state displayed to the user.
    if (nameValue !== "") {
      setIsLoading(true);
    }

    // Creates a 300 millisecond timer before triggering checkName to allow the user to finish typing. 
    const debounceCheckName = setTimeout(() => {
      validateName();
    }, 300);

    // Resets the debounce on every keypress.
    return () => clearTimeout(debounceCheckName)
  }, [nameValue]);

  // Load the locations once before component load.
  useEffect(() => {
    loadLocations();
  },[]);

  /* ============================
     ====== Event Handlers ======
     ============================ */

  // Binds nameValue to a change in input.
  const onChangeName = async (event) => {
    setNameValue(event.target.value);
  };

  // Binds location value to a change in input. 
  const onChangeLocation = (event) => {
    setLocationValue(event.target.value);
  }

  // Populate the user entered data when the user clicks Add. 
  const onClickAdd = () => {
    // Only add a new record if values have been entered. 
    // Optionally, we could provide feedback if the form is invalid.
    if (nameValue !== "" && locationValue !== "") {
      // Define a new HTML entity to add. 
      const newRecord = (
        <div className="row">
          <div className="display_name">{ nameValue }</div>
          <div className="display_location">{ locationValue }</div>
        </div>
      );

      // Add the entity to the useState array using a spread operator.
      setUserEnteredRecords(userEnteredRecords => [...userEnteredRecords, newRecord]);

      // Reset the form. 
      setNameValue("");
      setLocationValue("");
    }
  };

  // Clear the user entered data when the user clicks Clear. 
  // Additionally clears any user entered data. 
  const onClickClear = () => {
    setUserEnteredRecords([]);
    setNameValue("");
    setLocationValue("");
  };

  // Check if the name is valid asynchronously using the entered useState value.
  const validateName = async () => {
    // Do not send an API call if the value is empty. 
    if (nameValue === "") {
      // The updated useState value will not be available to test against until redraw.
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

  // Method to load the locations and save them to useState. 
  // Called by useEffect once on component load.
  const loadLocations = async () => {
    const response = await getLocations()
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
    <div className="app">

      <div className="form_name">
        <label className="form_label">
          Name
        </label>
        <div className="form_input">
          <input type="text" value={nameValue} onChange={onChangeName} />
        </div>
      </div>
      <div className="form_name_validation">
        { isLoading &&
          <div className="loading">checking...</div>
        }
        { !nameIsNull && !isLoading && 
          <>
            { !nameIsValid && 
              <div className="alert">This name has already been taken.</div>
            }
            { nameIsValid &&
              <div className="success">This name is good.</div>
            }
          </>
        }
      </div>

      <div className="form_location"> 
        <label className="form_label">
          Location
        </label>
        <div className="form_input">
          <select value={locationValue} onChange={onChangeLocation}>
            <option>Select Location...</option>
            { locationOptions }
          </select>
        </div>
      </div>

      <div className="submit">
        <button onClick={onClickClear}>Clear</button>
        <button onClick={onClickAdd} disabled={nameValue === "" || locationValue === "" || isLoading === true || nameIsValid === false}>Add</button>
      </div>

      {/* Optionally we could use an HTML table here, as it is tabular data. I chose to use div elements for more control with Flexbox. */}
      <div className="table">
        <div className="header">
          <div className="display_name">Name</div>
          <div className="display_location">Location</div>
        </div>
        { userEnteredRecords }
      </div>
    </div>
  );
}

export default App;
