 /*act as main storage the Global_startDate and Global_endDate as the name suggest are global variables
  and can be accessed from all the files on importing this file, they are updated by date-picker @ Overview.jsx
  and are accessed by find-visits.js to compare the date values and get the range.
  */
 
 class MyClass {
  constructor() {
    this.Global_startDate =null;
    this.Global_endDate = null;
  }
}

export default (new MyClass);