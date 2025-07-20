'use client'; // This directive marks the file as a Client Component

import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';

// Context for managing recurring date picker state
const RecurringDateContext = createContext();

// Helper function to format dates as YYYY-MM-DD for input fields
const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get day name from day index (0 for Sunday, 6 for Saturday)
const getDayName = (dayIndex) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
};

// Helper to get month name from month index
const getMonthName = (monthIndex) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthIndex];
};

// Helper to get ordinal suffix for numbers (1st, 2nd, 3rd, 4th, etc.)
const getOrdinalSuffix = (n) => {
  if (n > 3 && n < 21) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

// --- Sub-components ---

// Recurrence Options (Daily, Weekly, Monthly, Yearly) and Interval
const RecurrenceOptions = () => {
  const { recurrenceType, setRecurrenceType, interval, setInterval } = useContext(RecurringDateContext);

  const handleRecurrenceChange = (e) => {
    setRecurrenceType(e.target.value);
  };

  const handleIntervalChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setInterval(isNaN(value) || value < 1 ? 1 : value);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-inner mb-4">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">Repeat</h3>
      <div className="flex flex-wrap gap-4 mb-4">
        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((type) => (
          <label key={type} className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              name="recurrenceType"
              value={type}
              checked={recurrenceType === type}
              onChange={handleRecurrenceChange}
              className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded-full"
            />
            <span className="ml-2 text-gray-700">{type}</span>
          </label>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="interval" className="text-gray-700">Every</label>
        <input
          type="number"
          id="interval"
          min="1"
          value={interval}
          onChange={handleIntervalChange}
          className="w-20 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
        />
        <span className="text-gray-700">
          {recurrenceType === 'Daily' && (interval === 1 ? 'day' : 'days')}
          {recurrenceType === 'Weekly' && (interval === 1 ? 'week' : 'weeks')}
          {recurrenceType === 'Monthly' && (interval === 1 ? 'month' : 'months')}
          {recurrenceType === 'Yearly' && (interval === 1 ? 'year' : 'years')}
        </span>
      </div>
    </div>
  );
};

// Weekly Options (selection of specific days of the week)
const WeeklyOptions = () => {
  const { selectedDaysOfWeek, setSelectedDaysOfWeek } = useContext(RecurringDateContext);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayToggle = (dayIndex) => {
    setSelectedDaysOfWeek((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort((a, b) => a - b)
    );
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-inner mb-4">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">Days of the week</h3>
      <div className="flex flex-wrap gap-2">
        {days.map((day, index) => (
          <button
            key={day}
            onClick={() => handleDayToggle(index)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
              ${selectedDaysOfWeek.includes(index)
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-100'
              }
            `}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

// Monthly Options (Day X of month or Nth DayOfWeek of month)
const MonthlyOptions = () => {
  const {
    monthlyDayType, setMonthlyDayType,
    selectedDayOfMonth, setSelectedDayOfMonth,
    selectedNth, setSelectedNth,
    selectedDayOfWeekInMonth, setSelectedDayOfWeekInMonth,
    startDate // Needed to determine the default day of month or day of week
  } = useContext(RecurringDateContext);

  const startDay = startDate ? new Date(startDate).getDate() : 1;
  const startDayOfWeek = startDate ? new Date(startDate).getDay() : 0; // 0=Sunday, 6=Saturday

  // Calculate the 'nth' occurrence of the startDayOfWeek in its month
  const calculateNthOccurrence = useCallback(() => {
    if (!startDate) return 1;
    const date = new Date(startDate);
    const dayOfMonth = date.getDate();
    const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    let count = 0;
    for (let i = 1; i <= dayOfMonth; i++) {
      const d = new Date(date.getFullYear(), date.getMonth(), i);
      if (d.getDay() === dayOfWeek) {
        count++;
      }
    }
    return count;
  }, [startDate]);

  useEffect(() => {
    // Set initial values based on start date when component mounts or startDate changes
    if (startDate) {
      setSelectedDayOfMonth(startDay);
      setSelectedNth(calculateNthOccurrence());
      setSelectedDayOfWeekInMonth(startDayOfWeek);
    } else {
      setSelectedDayOfMonth(1);
      setSelectedNth(1);
      setSelectedDayOfWeekInMonth(0); // Default to Sunday
    }
  }, [startDate, startDay, startDayOfWeek, calculateNthOccurrence, setSelectedDayOfMonth, setSelectedNth, setSelectedDayOfWeekInMonth]);

  const handleMonthlyTypeChange = (e) => {
    setMonthlyDayType(e.target.value);
  };

  const handleDayOfMonthChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setSelectedDayOfMonth(isNaN(value) || value < 1 || value > 31 ? 1 : value);
  };

  const handleNthChange = (e) => {
    setSelectedNth(parseInt(e.target.value, 10));
  };

  const handleDayOfWeekInMonthChange = (e) => {
    setSelectedDayOfWeekInMonth(parseInt(e.target.value, 10));
  };

  const nthOptions = [
    { value: 1, label: 'first' },
    { value: 2, label: 'second' },
    { value: 3, label: 'third' },
    { value: 4, label: 'fourth' },
    { value: 5, label: 'fifth' }, // Some months have a fifth occurrence
  ];
  const dayOfWeekOptions = [
    { value: 0, label: 'Sunday' }, { value: 1, label: 'Monday' }, { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' }, { value: 4, label: 'Thursday' }, { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-inner mb-4">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">Monthly pattern</h3>
      <div className="space-y-3">
        {/* Option 1: Day X of month */}
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name="monthlyDayType"
            value="dayOfMonth"
            checked={monthlyDayType === 'dayOfMonth'}
            onChange={handleMonthlyTypeChange}
            className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded-full"
          />
          <span className="ml-2 text-gray-700">
            Day
            <input
              type="number"
              min="1"
              max="31"
              value={selectedDayOfMonth}
              onChange={handleDayOfMonthChange}
              disabled={monthlyDayType !== 'dayOfMonth'}
              className={`w-16 mx-2 p-1 border rounded-md text-gray-800 ${monthlyDayType !== 'dayOfMonth' ? 'bg-gray-200' : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
            />
            of the month
          </span>
        </label>

        {/* Option 2: The Nth DayOfWeek of month */}
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name="monthlyDayType"
            value="nthDayOfWeek"
            checked={monthlyDayType === 'nthDayOfWeek'}
            onChange={handleMonthlyTypeChange}
            className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded-full"
          />
          <span className="ml-2 text-gray-700 flex items-center">
            The
            <select
              value={selectedNth}
              onChange={handleNthChange}
              disabled={monthlyDayType !== 'nthDayOfWeek'}
              className={`mx-2 p-1 border rounded-md text-gray-800 ${monthlyDayType !== 'nthDayOfWeek' ? 'bg-gray-200' : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
            >
              {nthOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={selectedDayOfWeekInMonth}
              onChange={handleDayOfWeekInMonthChange}
              disabled={monthlyDayType !== 'nthDayOfWeek'}
              className={`mx-2 p-1 border rounded-md text-gray-800 ${monthlyDayType !== 'nthDayOfWeek' ? 'bg-gray-200' : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
            >
              {dayOfWeekOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            of the month
          </span>
        </label>
      </div>
    </div>
  );
};

// Date Range Picker (Start Date and Optional End Date)
const DateRangePicker = () => {
  const { startDate, setStartDate, endDate, setEndDate } = useContext(RecurringDateContext);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    // If end date is before new start date, clear or adjust end date
    if (endDate && new Date(e.target.value) > new Date(endDate)) {
      setEndDate('');
    }
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-inner mb-4">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">Date Range</h3>
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col">
          <label htmlFor="startDate" className="text-gray-700 mb-1">Starts on</label>
          <input
            type="date"
            id="startDate"
            value={formatDateForInput(startDate)}
            onChange={handleStartDateChange}
            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="endDate" className="text-gray-700 mb-1">Ends on (Optional)</label>
          <input
            type="date"
            id="endDate"
            value={formatDateForInput(endDate)}
            onChange={handleEndDateChange}
            min={formatDateForInput(startDate)} // End date cannot be before start date
            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          />
        </div>
      </div>
    </div>
  );
};

// Mini Calendar Preview
const CalendarPreview = () => {
  const { startDate, endDate, recurringDates } = useContext(RecurringDateContext);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (startDate) {
      setCurrentMonth(new Date(startDate));
    }
  }, [startDate]);

  const renderCalendar = () => {
    if (!startDate) {
      return <p className="text-center text-gray-600">Select a start date to see the preview.</p>;
    }

    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const numDays = endOfMonth.getDate();
    const firstDayOfWeek = startOfMonth.getDay(); // 0 = Sunday, 6 = Saturday

    const days = [];
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Add actual days of the month
    for (let i = 1; i <= numDays; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const isRecurring = recurringDates.some(
        (recDate) => recDate.toDateString() === date.toDateString()
      );
      const isStartDate = startDate && date.toDateString() === new Date(startDate).toDateString();
      const isEndDate = endDate && date.toDateString() === new Date(endDate).toDateString();

      days.push(
        <div
          key={i}
          className={`
            p-2 text-center rounded-md text-sm font-medium
            ${isRecurring ? 'bg-blue-200 text-blue-800 border border-blue-400' : 'text-gray-700'}
            ${isStartDate ? 'bg-green-200 text-green-800 border border-green-400 font-bold' : ''}
            ${isEndDate ? 'bg-red-200 text-red-800 border border-red-400 font-bold' : ''}
            ${isStartDate && isEndDate && isRecurring ? 'bg-purple-200 text-purple-800 border border-purple-400' : ''}
            ${!isRecurring && !isStartDate && !isEndDate && 'hover:bg-gray-100'}
            transition-colors duration-150
          `}
        >
          {i}
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            &lt;
          </button>
          <h4 className="font-semibold text-lg text-gray-800">
            {getMonthName(currentMonth.getMonth())} {currentMonth.getFullYear()}
          </h4>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            &gt;
          </button>
        </div>
        <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">Preview</h3>
      {renderCalendar()}
    </div>
  );
};

// --- Recurring Date Calculation Logic ---
const calculateRecurringDates = (
  recurrenceType, interval, startDate, endDate,
  selectedDaysOfWeek, monthlyDayType, selectedDayOfMonth, selectedNth, selectedDayOfWeekInMonth
) => {
  const dates = [];
  if (!startDate) return dates;

  let currentDate = new Date(startDate);
  const endLimit = endDate ? new Date(endDate) : null;
  const maxIterations = 365 * 5; // Prevent infinite loops for very long recurrences

  let count = 0;
  while (count < maxIterations) {
    if (endLimit && currentDate > endLimit) {
      break;
    }

    let addDate = false;
    if (recurrenceType === 'Daily') {
      addDate = true;
    } else if (recurrenceType === 'Weekly') {
      if (selectedDaysOfWeek.includes(currentDate.getDay())) {
        addDate = true;
      }
    } else if (recurrenceType === 'Monthly') {
      if (monthlyDayType === 'dayOfMonth') {
        // Check if current date is the selected day of month, handling month-end overflow
        const targetDay = selectedDayOfMonth;
        if (currentDate.getDate() === targetDay || (currentDate.getDate() === new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() && targetDay > currentDate.getDate())) {
          addDate = true;
        }
      } else if (monthlyDayType === 'nthDayOfWeek') {
        // Calculate the Nth day of week in the current month
        let tempDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        let occurrences = 0;
        let foundDate = null;
        while (tempDate.getMonth() === currentDate.getMonth()) {
          if (tempDate.getDay() === selectedDayOfWeekInMonth) {
            occurrences++;
            if (occurrences === selectedNth) {
              foundDate = tempDate;
              break;
            }
          }
          tempDate.setDate(tempDate.getDate() + 1);
        }
        if (foundDate && foundDate.toDateString() === currentDate.toDateString()) {
          addDate = true;
        }
      }
    } else if (recurrenceType === 'Yearly') {
      // For yearly, we only add if it's the exact start date's month and day
      if (currentDate.getMonth() === new Date(startDate).getMonth() &&
          currentDate.getDate() === new Date(startDate).getDate()) {
        addDate = true;
      }
    }

    // Only add if the date is on or after the start date
    if (addDate && currentDate >= new Date(startDate)) {
      dates.push(new Date(currentDate)); // Push a copy to avoid mutation issues
    }

    // Increment date based on recurrence type and interval
    let nextDate = new Date(currentDate);
    if (recurrenceType === 'Daily') {
      nextDate.setDate(currentDate.getDate() + 1);
    } else if (recurrenceType === 'Weekly') {
      nextDate.setDate(currentDate.getDate() + 1); // Iterate day by day to find next selected day
      if (currentDate.getDay() === 6) { // If it's Saturday, jump to next week's Sunday
        nextDate.setDate(currentDate.getDate() + (7 * interval) - 6);
      }
    } else if (recurrenceType === 'Monthly') {
      nextDate.setDate(currentDate.getDate() + 1); // Iterate day by day
      // Special handling to jump months for monthly recurrence
      if (currentDate.getDate() === new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()) { // If at end of month
         nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + interval, 1);
      }
    } else if (recurrenceType === 'Yearly') {
      nextDate.setDate(currentDate.getDate() + 1); // Iterate day by day
      // Special handling to jump years for yearly recurrence
      if (currentDate.getMonth() === 11 && currentDate.getDate() === 31) { // If at end of year
        nextDate = new Date(currentDate.getFullYear() + interval, 0, 1);
      }
    }

    currentDate = nextDate;
    count++;
  }

  // Filter out dates before startDate and sort them
  const finalDates = dates.filter(date => date >= new Date(startDate)).sort((a, b) => a - b);

  // Limit the number of dates to display in preview to avoid performance issues
  // For a real application, you might calculate dates dynamically for the visible month range.
  return finalDates.slice(0, 365); // Limit to roughly one year of recurring dates for preview
};


// Main Recurring Date Picker Component
const RecurringDatePicker = () => {
  // State for recurrence options
  const [recurrenceType, setRecurrenceType] = useState('Daily');
  const [interval, setInterval] = useState(1);

  // State for weekly options
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState([]); // Array of day indices (0-6)

  // State for monthly options
  const [monthlyDayType, setMonthlyDayType] = useState('dayOfMonth'); // 'dayOfMonth' or 'nthDayOfWeek'
  const [selectedDayOfMonth, setSelectedDayOfMonth] = useState(1); // For 'dayOfMonth'
  const [selectedNth, setSelectedNth] = useState(1); // For 'nthDayOfWeek' (1st, 2nd, etc.)
  const [selectedDayOfWeekInMonth, setSelectedDayOfWeekInMonth] = useState(0); // For 'nthDayOfWeek' (0=Sun, 6=Sat)

  // State for date range
  const [startDate, setStartDate] = useState(formatDateForInput(new Date()));
  const [endDate, setEndDate] = useState('');

  // State for calculated recurring dates for preview
  const [recurringDates, setRecurringDates] = useState([]);

  // State for LLM suggestions
  const [taskSuggestions, setTaskSuggestions] = useState('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');

  // Effect to calculate recurring dates whenever relevant state changes
  useEffect(() => {
    const calculatedDates = calculateRecurringDates(
      recurrenceType, interval, startDate, endDate,
      selectedDaysOfWeek, monthlyDayType, selectedDayOfMonth, selectedNth, selectedDayOfWeekInMonth
    );
    setRecurringDates(calculatedDates);
  }, [
    recurrenceType, interval, startDate, endDate,
    selectedDaysOfWeek, monthlyDayType, selectedDayOfMonth, selectedNth, selectedDayOfWeekInMonth
  ]);

  // Function to generate prompt for LLM
  const generatePrompt = () => {
    let prompt = `Suggest 5 common recurring tasks or reminders for a recurrence pattern that is `;

    if (recurrenceType === 'Daily') {
      prompt += `every ${interval} day${interval > 1 ? 's' : ''}.`;
    } else if (recurrenceType === 'Weekly') {
      prompt += `every ${interval} week${interval > 1 ? 's' : ''}`;
      if (selectedDaysOfWeek.length > 0) {
        prompt += `, specifically on ${selectedDaysOfWeek.map(getDayName).join(' and ')}.`;
      } else {
        prompt += `.`;
      }
    } else if (recurrenceType === 'Monthly') {
      prompt += `every ${interval} month${interval > 1 ? 's' : ''}`;
      if (monthlyDayType === 'dayOfMonth') {
        prompt += `, on day ${selectedDayOfMonth} of the month.`;
      } else if (monthlyDayType === 'nthDayOfWeek') {
        prompt += `, on the ${selectedNth}${getOrdinalSuffix(selectedNth)} ${getDayName(selectedDayOfWeekInMonth)} of the month.`;
      }
    } else if (recurrenceType === 'Yearly') {
      prompt += `every ${interval} year${interval > 1 ? 's' : ''}, starting on ${new Date(startDate).toLocaleDateString()}.`;
    }

    prompt += ` Provide the suggestions as a numbered list.`;
    return prompt;
  };

  // Function to call Gemini API
  const getGeminiSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setSuggestionError('');
    setTaskSuggestions('');

    const prompt = generatePrompt();
    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = { contents: chatHistory };
    const apiKey = ""; // Canvas will automatically provide this at runtime
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setTaskSuggestions(text);
      } else {
        setSuggestionError('No suggestions found. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestionError(`Failed to get suggestions: ${error.message}`);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Provide state and setters via context
  const contextValue = {
    recurrenceType, setRecurrenceType,
    interval, setInterval,
    selectedDaysOfWeek, setSelectedDaysOfWeek,
    monthlyDayType, setMonthlyDayType,
    selectedDayOfMonth, setSelectedDayOfMonth,
    selectedNth, setSelectedNth,
    selectedDayOfWeekInMonth, setSelectedDayOfWeekInMonth,
    startDate, setStartDate,
    endDate, setEndDate,
    recurringDates
  };

  return (
    <RecurringDateContext.Provider value={contextValue}>
      <div className="font-sans antialiased bg-gray-100 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl border border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
            Recurring Date Picker
          </h2>

          <RecurrenceOptions />
          <DateRangePicker />

          {recurrenceType === 'Weekly' && <WeeklyOptions />}
          {recurrenceType === 'Monthly' && <MonthlyOptions />}

          <CalendarPreview />

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            <h3 className="font-semibold text-xl mb-2">Selected Recurrence Summary:</h3>
            <p className="mb-1">
              <span className="font-medium">Frequency:</span> Every {interval} {recurrenceType.toLowerCase()}
              {interval > 1 ? 's' : ''}.
            </p>
            {recurrenceType === 'Weekly' && selectedDaysOfWeek.length > 0 && (
              <p className="mb-1">
                <span className="font-medium">On:</span> {selectedDaysOfWeek.map(getDayName).join(', ')}.
              </p>
            )}
            {recurrenceType === 'Monthly' && monthlyDayType === 'dayOfMonth' && (
              <p className="mb-1">
                <span className="font-medium">On:</span> Day {selectedDayOfMonth} of the month.
              </p>
            )}
            {recurrenceType === 'Monthly' && monthlyDayType === 'nthDayOfWeek' && (
              <p className="mb-1">
                <span className="font-medium">On:</span> The {selectedNth}{getOrdinalSuffix(selectedNth)} {getDayName(selectedDayOfWeekInMonth)} of the month.
              </p>
            )}
            <p className="mb-1">
              <span className="font-medium">Starts:</span> {startDate ? new Date(startDate).toLocaleDateString() : 'Not set'}.
            </p>
            <p>
              <span className="font-medium">Ends:</span> {endDate ? new Date(endDate).toLocaleDateString() : 'Never'}.
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={getGeminiSuggestions}
              disabled={isLoadingSuggestions}
              className={`
                px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300
                ${isLoadingSuggestions
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105'
                }
              `}
            >
              {isLoadingSuggestions ? 'Generating...' : '✨ Suggest Recurring Tasks'}
            </button>

            {suggestionError && (
              <p className="mt-4 text-red-600 text-sm">{suggestionError}</p>
            )}

            {taskSuggestions && (
              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg text-purple-800 text-left">
                <h3 className="font-semibold text-xl mb-2">Suggested Tasks:</h3>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: taskSuggestions.replace(/\n/g, '<br/>') }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </RecurringDateContext.Provider>
  );
};

// Main App component to render the RecurringDatePicker
export default function App() {
  return (
    // No need for <TailwindCSS /> component here when Tailwind is properly configured
    <RecurringDatePicker />
  );
}
