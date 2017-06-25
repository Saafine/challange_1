import React from 'react';
let countries = require('./countries.json'); // imports autocomplete data, expects objects with props: 'name' (string), 'code' (string)

// Styling of a selected / unselected suggestion
const styleUnselected = {color: '#111111'};
const styleSelected = {color: '#0054b3', borderLeft: '3px solid #001f3f'};

export default class Autocomplete extends React.Component {
  constructor () {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.state = {
      input: '',
      autocompleteShown: false,
      suggestionSelected: 0, // index of a selected suggestion, used when user uses arrow to go through suggestions
      suggestions: [], // array with filtered suggestions
      countryChosen: null // confirmed country of choice
    };
  }

  // # Function - handle input change #
  // 1. Hide suggestions if input's length === 0
  // 2. Update input's state
  // 2. Call filter function based on new input
  handleChange (e) {
    let newVal = e.target.value;
    (newVal.length > 0) ? this.showAutocomplete(true) : this.showAutocomplete(false);
    this.updateInput(newVal);
    this.filterSuggestions(newVal);
  }

  handleKeyDown (e) {
    let keyCode = e.which;
    switch (keyCode) {
      case (9): // tab
      case (13): // enter
        this.handleCountrySelection(); // new country selected
        break;
      case (38): // arrow down
        this.handleArrowDown(e); // go down on the suggestion list
        break;
      case (40): // arrow up
        this.handleArrowUp(e); // go up on the suggestion list
        break;
    }
  };

  // # Function - handle input's blur #
  // 1. If country was not chosen, clear the input
  // 2. If country was chosen, set input value to it's name
  // 3. Hide suggestions
  handleBlur () {
    if (!this.state.countryChosen) {
      this.updateInput('');
    } else {
      this.updateInput(this.state.countryChosen);
    }
    this.showAutocomplete(false);
  }

  // # Function - handle country selection #
  // 1. If there are no available records in suggestions or input's length === 0, call selectCountry with null
  // 2. If there are valid suggestion, get country's name based on selected suggestion's index
  // 3. Update input to match full country's name
  // 4. Hide suggestions
  handleCountrySelection () {
    if (this.state.suggestions.length === 0 || !this.state.autocompleteShown) {
      this.selectCountry(null);
    } else {
      let newVal = this.state.suggestions[this.state.suggestionSelected].name;
      this.updateInput(newVal);
      this.selectCountry(newVal);
      this.showAutocomplete(false);
    }
  }

  // # Function - handle arrow down in suggestions #
  handleArrowDown (e) {
    e.preventDefault();
    this.selectionUpdate(this.state.suggestionSelected - 1);
  }

  // # Function - handle arrow up in suggestions #
  handleArrowUp (e) {
    e.preventDefault();
    this.selectionUpdate(this.state.suggestionSelected + 1);
  }

  // # Function - suggestion index #
  // 1. Specifies correct suggestion index and updates state
  selectionUpdate (newSelectedIndex) {
    if (newSelectedIndex === -1) {
      newSelectedIndex = this.state.suggestions.length - 1;
    } else if (newSelectedIndex === this.state.suggestions.length) {
      newSelectedIndex = 0;
    }
    this.setState(() => {
      return {
        suggestionSelected: newSelectedIndex
      };
    });
  }

  // # Function - update new input #
  // 1. New input is set
  // 2. Suggestion's selected index gets reset
  updateInput (newVal) {
    this.setState(() => {
      return {
        input: newVal
      };
    });
    this.selectionUpdate(0);
  }

  // # Function - select country #
  // 1. Set new state with correct country's name using a promise, so that
  //        handleBlur function gets called with up-to-date data
  // 2. Blur the input element using react's refs
  selectCountry (newSelect) {
    let waitForState = new Promise((resolve) => {
      resolve(this.setState(() => {
        return {
          countryChosen: newSelect
        };
      }));
    });

    // Element gets set out of focus, so handleBlur function will be called
    waitForState.then(() => {
      this.refs.autocompleteInput.blur();
    });
  }

  // # Function - shows/hides autocomplete suggestions
  // 1. Arg (val) is a boolean
  showAutocomplete (val) {
    this.setState(() => {
      return {
        autocompleteShown: val
      };
    });
  }

  // # Function - filter suggestions #
  // 1. User input is transformed to upper case, filter is case-insensitive
  // 2. Filter returns values if: input matches part of a country name or it's full code
  // 3. State with filtered suggestions gets updated
  filterSuggestions (newVal) {
    let matchInput = newVal.toUpperCase();
    let matchLength = matchInput.length;
    let filtered = countries.filter((country) => {
      return country.name.substring(0, matchLength).toUpperCase() === matchInput || country.code.toUpperCase() === matchInput;
    });

    this.setState(() => {
      return {
        suggestions: filtered
      };
    });
  }

  // # Function - render all suggestions #
  // 1. Render suggestions only if input length > 0
  renderSuggestions () {
    if (!this.state.autocompleteShown) return;
    return this.state.suggestions.map((country, i) => {
      return (<div class="autocomplete-suggestion"
                   style={i === this.state.suggestionSelected ? styleSelected : styleUnselected}
                   key={i}>{country.name} ({country.code})</div>);
    });
  }

  render () {
    // don't display suggestions if not needed
    let showAutocomplete = this.state.autocompleteShown ? 'block' : 'none';
    let styleAutocomplete = {display: showAutocomplete};

    // # Render display text #
    // 1. Country specified - show country's name
    // 2. Country unspecified - promp user to select a country
    let countryChosen = this.state.countryChosen;
    let display = null;
    if (countryChosen) {
      display = <div class="autocomplete-title">You are currently looking at flights from: <span
        class="autocomplete-choice">{countryChosen}</span></div>;
    } else {
      display = <div class="autocomplete-title">Select a country.</div>;
    }
    return (
      <div class="autocomplete-wrapper">
        {display}
        <input type="text" placeholder="Enter country name"
               class="autocomplete-input"
               ref="autocompleteInput"
               onChange={this.handleChange}
               onKeyDown={this.handleKeyDown}
               onBlur={this.handleBlur}
               value={this.state.input}/>
        <div class="autocomplete-suggestions-wrapper" style={styleAutocomplete}>{this.renderSuggestions()}</div>
      </div>
    );
  }
};
