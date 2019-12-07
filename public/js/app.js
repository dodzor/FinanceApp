const StorageCtrl = (function(){

  getExpenses = function(){
    let expenses;
    // if(localStorage.getItem('expenses') === null) {
    //   expenses = [];
    // } else {
    //   expenses = JSON.parse(localStorage.getItem('expenses'));
    // }
    const storageExp = JSON.parse(localStorage.getItem('expenses'));
    // console.log(storageExp);
      // console.log(Array.isArray(storageExp));
      // console.log(storageExp.length);

    // If local storage is empty set dummy expenses
    if (!Array.isArray(storageExp) || !storageExp.length) {
      expenses = [];
      // expenses = [{"description":"groceries","value":"270","category":"Food","dateTime":"4/1/2019","uniqueId":1553250787866},
      //             {"description":"energy bill","value":"65","category":"Utilities","dateTime":"4/1/2019","uniqueId":1553250844445},
      //             {"description":"vacation","value":"800","category":"Personal","dateTime":"4/1/2019","uniqueId":1553250914767},
      //             {"description":"new sneakers","value":"320","category":"Clothes","dateTime":"4/1/2019","uniqueId":1553250948517}];

      readTextFile('../db/expenses.json', function(text){
        console.log(text);
        expenses = JSON.parse(text);
      
        localStorage.setItem('expenses', JSON.stringify(expenses)); 
      });

      return expenses;
    } else {
      return storageExp;
    }
  }

  readTextFile = function(file, callback){
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
  }

  getCategories = function(){
    // let categories;
    // if(localStorage.getItem('categories') === null) {
    //   categories = [];
    // } else {
    //   categories = JSON.parse(localStorage.getItem('categories'));
    // }

    // return categories;

    const storageCat = JSON.parse(localStorage.getItem('categories'));

    // If local storage is empty set dummy categories
    if (!Array.isArray(storageCat) || !storageCat.length) {
      categories = ["Food", "Personal", "Living", "Utilities", "Transport", "Tech", "Sport", "Clothes", "Health"];
      localStorage.setItem('categories', JSON.stringify(categories));

      return categories;
    } else {
      return storageCat;
    }

  }

  addExpense = function(expense) {
    const expenses = getExpenses();

    expenses.push(expense);

    localStorage.setItem('expenses', JSON.stringify(expenses));
  }

  addCategory = function(category) {
    const categories = StorageCtrl.getCategories();

    if (categories.indexOf(category) === -1) {
      // console.log('New category!');
      categories.push(category);
      localStorage.setItem('categories', JSON.stringify(categories)); 
    }
  }

  getExpenseById = function(id) {
    const expenses = getExpenses();

    let found = null;
    expenses.forEach(function(expense) {
      if(expense.id = id) {
        found = expense;
      }
    });
    return found;
  }

  removeExpense = function(uniqueId) {
    // console.log(uniqueId);
    const expenses = getExpenses();

    expenses.forEach(function(expense, index){
     if(expense.uniqueId == uniqueId) {
      expenses.splice(index, 1);
     }
    });

    // console.log(expenses);

    localStorage.setItem('expenses', JSON.stringify(expenses));
  }

  updateItemStorage = function(updatedExpense) {
    let expenses = JSON.parse(localStorage.getItem('expenses'));

    expenses.forEach(function(expense, index) {
      if (updatedExpense.uniqueId === expense.uniqueId) {
        expenses.splice(index, 1, updatedExpense);
      }
    });

    localStorage.setItem('expenses', JSON.stringify(expenses));

    // Display updated chart
    UICtrl.displayChart(expenses);
  }

  return {
    getExpenses : getExpenses,
    getCategories : getCategories,
    addExpense : addExpense,
    addCategory : addCategory,
    removeExpense : removeExpense,
    updateItemStorage: updateItemStorage,
  }

})();


const ExpenseCtrl = (function(StorageCtrl){
  // Expense Contructor
  const Expense = function(description, value, category, date, uniqueId) {
    this.description = description;
    this.value = value;
    this.category = category;
    this.dateTime = date,
    this.uniqueId = uniqueId;
  }

  // Data Structure / State
  const data = {
    // expenses: StorageCtrl.getExpenses(),
    expenses: null,
    categories: StorageCtrl.getCategories(),
    currentExpense: null,
    currentCategory: null,
    totalExpenses: 0,
  }

  return {
    addExpense: function(description, value, category, date, uniqueId) {
      const newExpense = new Expense(description, value, category, date, uniqueId);

      data.expenses.push(newExpense);

      return newExpense;
    },

    updateExpense: function(description, value, category, date) {
      value = parseInt(value);

      let found = null;

      this.getExpenses().forEach(function(expense){
        if (expense.uniqueId === data.currentExpense.uniqueId) {
          expense.description = description;
          expense.value = value;
          expense.category = category;
          expense.dateTime = date;
          found = expense;
        }
      });
      return found;
    },

    getExpenseById: function(id) {
      let found = null;

      data.expenses.forEach(function(expense) {
        if (expense.uniqueId == id) {
          found = expense;
        }
      });
      
      return found;
    },
    deleteExpense: function(id) {
      const ids = data.expenses.map(function(expense){
        return expense.uniqueId;
      });

      const index = ids.indexOf(parseInt(id));
      
      data.expenses.splice(index, 1);

      // console.log(data.expenses);
    },
    getExpenses: function(fromStorage = false) {
      if (fromStorage) {
        return StorageCtrl.getExpenses();
      }
      else {
        return data.expenses;
      }
    },  
    getExpensesByDate: function(startDate, endDate) {
      // console.log(startDate, endDate);

      const filtered = this.getExpenses(true).filter(function(expense){
        const expenseDate = expense.dateTime;
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const expenseDateObject = new Date(expenseDate);

        return (expenseDateObject.getTime() >= startDateObj.getTime() && expenseDateObject.getTime() <= endDateObj.getTime());
      });

      this.setExpenses(filtered);
      // console.log('in getExpensesByDate:' + data.expenses.length);

      return filtered;
    },
    setExpenses: function(expenses) {
      data.expenses = expenses;
    },
    setCurrentExpense: function(expense) {
      data.currentExpense = expense;
    },
    getCategories: function() {
      return data.categories;
    },
    getTotal: function(expenses = null) {
      var total = 0;

      var expenses = (expenses == null) ? this.getExpenses(false) : expenses;

      // console.log('in getTotal: ' + data.expenses.length);
      expenses.forEach(function(expense){
        total += parseFloat(expense.value);
      });
      return total;
    },
    setCurrentCategory: function(category) {
      data.currentCategory = category;
    },
    getCurrentExpense: function() {
      return data.currentExpense;
    },
    getCurrentCategory: function() {
      return data.currentCategory;
    },
    logData: function(){
      return data;
    },
    filterExpensesByDate: function(expenses, startDate, endDate) {
      const filtered = expenses.filter(function(expense){
        const expenseDate = expense.dateTime;
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const expenseDateObject = new Date(expenseDate);

        return (expenseDateObject.getTime() >= startDateObj.getTime() && expenseDateObject.getTime() <= endDateObj.getTime());
      });
      // set state
      // this.setExpenses(filtered);
      return filtered;
    },
    filterExpensesByCategory: function(category) {
      const filtered = this.getExpenses(false).filter(function(expense){
        if (expense.category == category)
          return true;
      });
      return filtered;
    }

  }
})(StorageCtrl);


const UICtrl = (function(){
  // Load event listerners
  const UISelectors = {
    expenseForm: '#expense-form',
    expenseList: '#expense-list',
    categoryList: '#category-list',
    sortList: '#sort-list',
    total: '#total',
    startDateInput: '#start',
    endDateInput: '#end',
    description: '#description',
    value: '#value',
    category: '#category',
    date: '#date',
    chart: '#chart',
    submit: '#submit',
    edit: '#edit',
  }

  addExpenseToList = function(expense) {
    // console.log(expense);

    const list = document.querySelector(UISelectors.expenseList);
    const row = document.createElement('tr');
    row.id = 'expense-'+ expense.uniqueId;
    // Insert cols
    row.innerHTML = `
      <td>${expense.description}</td>
      <td>${expense.value}</td>
      <td>${expense.category}</td>
      <td>${expense.dateTime.toLocaleString("ro-RO")}</td>
      <td><a class="secondary-content" href="#"><i class="edit-item fas fa-pencil-alt"></i></a></td>
      <td><a href="#" class="delete">X</a></td>
    `;
    list.appendChild(row);
  }

  updateExpenseItem = function(expense) {
    let listItems = document.querySelectorAll(UISelectors.expenseList);

    // Turn list node into array and get children
    listItems = Array.from(listItems)[0].children;

    // Turn children node to array
    listItems = Array.from(listItems);

    listItems.forEach(function(listItem){
      const itemId = listItem.getAttribute('id');
      
      if (itemId === `expense-${expense.uniqueId}`) {
        document.querySelector(`#${itemId}`).innerHTML = `<td>${expense.description}</td>
                                                          <td>${expense.value}</td>
                                                          <td>${expense.category}</td>
                                                          <td>${expense.dateTime.toLocaleString("ro-RO")}</td>
                                                          <td><a class="secondary-content" href="#"><i class="edit-item fas fa-pencil-alt"></i></a></td>
                                                          <td><a href="#" class="delete">X</a></td>`;
      }
    });

    // console.log(listItems);
  }

  return {

    displayExpenses: function(expenses) {
      document.querySelector(UISelectors.expenseList).innerHTML = '';

      expenses.forEach(function(expense){
        // Add expense to UI
        addExpenseToList(expense);
      });
    },

    displayExpenseByDate: function(expenses, startDate, endDate) {
      const filtered = ExpenseCtrl.filterExpensesByDate(expenses, startDate, endDate);

      this.displayExpenses(filtered);
    },

    displayCategories: function(categories) {
      categories.forEach(function(category){
          const list = document.querySelector(UISelectors.categoryList);
          const option = document.createElement('option');
      
          option.textContent = category;
          list.appendChild(option); 
      });
    },

    displayTotal(totalExpenses) {
      const total = document.querySelector(UISelectors.total);
  
      total.textContent = totalExpenses.toFixed(2) + ' RON';
    },

    displayTotalByDate(expenses, startDate, endDate) {
      const filtered = ExpenseCtrl.filterExpensesByDate(expenses, startDate, endDate);
      const total = document.querySelector(UISelectors.total);

      var t = 0;
      filtered.forEach(function(expense){
        t += parseFloat(expense.value);
      });
  
      total.textContent = t.toFixed(2) + ' RON';
    },

    displayChart(expenses) {
      ChartSingleton.getInstance().render();

      // const dates = HelperCtrl.getFirstLastMonthDate();
      // const filtered = ExpenseCtrl.filterExpensesByDate(expenses, dates.firstDay, dates.lastDay);

      ChartSingleton.updateChart(expenses);
    },

    displayDatePickerRange() {
      const myPicker = new Lightpick({
        field: document.querySelector(UISelectors.startDateInput),
        secondField: document.querySelector(UISelectors.endDateInput),
        singleDate: false,
        format: 'MM/DD/YYYY',
        
        onClose: function(){
          const startDate = document.querySelector(UISelectors.startDateInput).value;
          const endDate = document.querySelector(UISelectors.endDateInput).value;

          // console.log(startDate, endDate);

          const expenses = ExpenseCtrl.getExpensesByDate(startDate, endDate);
          console.log('onClose: ' + expenses.length);
          // const expenses = ExpenseCtrl.getExpenses();
    
          if (expenses.length === 0) {
            UICtrl.hideList();
          }
          else {
            // display selected dates expenses
            UICtrl.displayExpenses(expenses);
            
            // display selected dates chart
            UICtrl.displayChart(expenses);

            UICtrl.showList();
          }
        
          // display current month total
          const totalExpenses = ExpenseCtrl.getTotal();
          UICtrl.displayTotal(totalExpenses);

        }
      });
    },

    displayDatePickerDate() {
      const myPicker = new Lightpick({
        field: document.querySelector(UISelectors.date),
        singleDate: true,
        format: 'MM/DD/YYYY',
        onClose: function(){
        }
      });
    },
    
    deleteExpense(target) {
      if(target.className === 'delete') {
        target.parentElement.parentElement.remove();
      }
    },
      
    showAlert(message, className) {
      // Create div
      const div = document.createElement('div');
      // Add classes
      div.className = `alert ${className}`;
      // Add text
      div.appendChild(document.createTextNode(message));
      // Get parent
      // const container = document.querySelector('.container');
      const container = document.getElementById('form-container');
      // Get form
      const form = document.querySelector('#expense-form');
      // Insert alert
      container.insertBefore(div, form);

      // Timeout after 3 sec
      setTimeout(function(){
        document.querySelector('.alert').remove();
      }, 3000);
    },

    clearFields() {
      document.querySelector(UISelectors.description).value = '';
      document.querySelector(UISelectors.value).value = '';
      document.querySelector(UISelectors.category).value = '';
      document.querySelector(UISelectors.date).value = '';
    },

    hideList() {
      // console.log(UISelectors.list);
      // document.querySelector(UISelectors.expenseList).style.display = 'none';
      document.querySelector('#expense-table').style.display = 'none';
    },

    showList() {
      // console.log(UISelectors.list);
      // document.querySelector(UISelectors.expenseList).style.display = 'block';
      document.querySelector('#expense-table').style.display = 'inline-table';
    },

    showEditState() {
      document.querySelector(UISelectors.submit).style.display = 'none';
      document.querySelector(UISelectors.edit).style.display = 'inline';
    },

    showSubmitState() {
      this.clearFields();
      document.querySelector(UISelectors.submit).style.display = 'inline';
      document.querySelector(UISelectors.edit).style.display = 'none';
    },

    addExpenseToForm() {
      document.querySelector(UISelectors.description).value = ExpenseCtrl.getCurrentExpense().description;
      document.querySelector(UISelectors.value).value = ExpenseCtrl.getCurrentExpense().value;
      document.querySelector(UISelectors.date).value = ExpenseCtrl.getCurrentExpense().dateTime;
      document.querySelector(UISelectors.category).value = '';

      const categList = document.querySelector(UICtrl.getUISelectors().categoryList);
      const options = categList.options;
      // const selectedIndex = categList.selectedIndex;

      const categories = ExpenseCtrl.getCategories();
      const selectedCat = ExpenseCtrl.getCurrentCategory();

      selectedCatIndex = categories.indexOf(selectedCat);
      // console.log(selectedCatIndex);

      categList.selectedIndex = selectedCatIndex + 1;
      
      // console.log(options);
      // console.log(selectedIndex);

      UICtrl.showEditState();
    },

    getExpenseSubmit() {
        // Get form values
        const description = document.querySelector(UICtrl.getUISelectors().description).value,
              value = document.querySelector(UICtrl.getUISelectors().value).value;

        const categList = document.querySelector(UICtrl.getUISelectors().categoryList),
              selectedCateg = categList.options[categList.selectedIndex].text;
              now = new Date();

        let date = document.querySelector(UICtrl.getUISelectors().date).value,
            category = document.querySelector(UICtrl.getUISelectors().category).value,
            dateTime = now.toLocaleString().toString();
          
        const today = dateTime.substr(0, dateTime.indexOf(','));

        // If no new category get selected category
        if (category == '') category = selectedCateg;

        // If no new date get today
        if (date == '') date = today;

        return {
          description: description,
          value: value,
          date: date,
          category: category,
        }
    },
  
    getUISelectors: function(){
      return UISelectors;
    },

    addExpenseToList: addExpenseToList,
    updateExpenseItem: updateExpenseItem,
  }
})();


const HelperCtrl = (function(){
  return {
    getFirstLastMonthDate: function(){
      var date = new Date();
      var firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleString();
      var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toLocaleString();

      // Split hours from string
      firstDay = firstDay.split(',')[0];
      lastDay = lastDay.split(',')[0];

      return {'firstDay': firstDay, 'lastDay': lastDay};
    },

    compareValues(key, order='asc') {
      return function(a, b) {
        // console.log(key);
        if(!a.hasOwnProperty(key) || 
          !b.hasOwnProperty(key)) {
          return 0; 
        }
        
        let varA = (typeof a[key] === 'string') ? 
          a[key].toUpperCase() : a[key];
        let varB = (typeof b[key] === 'string') ? 
          b[key].toUpperCase() : b[key];
  
        varA = (!isNaN(parseFloat(varA)) && isFinite(varA)) ?
          parseFloat(varA) : varA;
        varB = (!isNaN(parseFloat(varB)) && isFinite(varB)) ?
          parseFloat(varB) : varB;
  
        // console.log(!isNaN(parseFloat(varA)) && isFinite(varA));
  
        // console.log(varA);
        // console.log(varB);
          
        let comparison = 0;
        if (varA > varB) {
          comparison = 1;
        } else if (varA < varB) {
          comparison = -1;
        }
        return (
          (order == 'desc') ? 
          (comparison * -1) : comparison
        );
      };
    },

    getExpPerCat(expenses = null) {
      const categories = StorageCtrl.getCategories();
      
      if (expenses == null) {
        expenses = StorageCtrl.getExpenses();
      }
  
      var catTotals = [];
  
      categories.forEach(function(category){
        let catTotal = 0;
        let i = 0;
  
        expenses.forEach(function(expense){ 
          if (expense.category == category) {
            catTotal += parseFloat(expense.value);
          }
          catTotals[category] = catTotal; 
        })
      });
  
      var expPerCatArrayVal = [];
  
      // array values only
      for (const key in catTotals) {
        expPerCatArrayVal[expPerCatArrayVal.length] = catTotals[key];
      }
  
      return expPerCatArrayVal;
    },

    resetCategories() {
      let expenses = Storage.getExpenses();
  
      expenses.forEach(function(expense){
        const cat = expense.category;
        Storage.addCategory(cat);
      });
    },
  
    formatDates(expenses) {
  
      expenses.forEach(function(expense) {
        let dateTime = expense.dateTime.toString();
        let date = dateTime.substr(0, dateTime.indexOf(','));
        let dateStr = date.replace(/[.]/g, '\/');
        // console.log(dateStr);
  
        const arr = dateStr.split('/');
        const day = arr[0];
        const month = arr[1];
        const year = arr[2];
  
        dateStr = month + '/' + day + '/' + year;
  
        expense.dateTime = dateStr;
      });
      
      return expenses;
    },
  
    populateExpenses() {
      let expenses = [{"description":"Cump Obor","value":"220","category":"Food","dateTime":"02/10/2019","uniqueId":1549818018303},{"description":"Asoc Relatii","value":"20","category":"Personal","dateTime":"02/10/2019","uniqueId":1549818101515},{"description":"Chirie feb","value":"910","category":"Living","dateTime":"02/10/2019","uniqueId":1549818190841},{"description":"Cioco ","value":"16.6","category":"Food","dateTime":"02/10/2019","uniqueId":1549818271811},{"description":"Cump Mega","value":"94","category":"Food","dateTime":"02/10/2019","uniqueId":1549818427766},{"description":"Cartela Vodafone","value":"39.6","category":"Utilities","dateTime":"02/10/2019","uniqueId":1549818534915},{"description":"Spaga instalator","value":"20","category":"Living","dateTime":"02/10/2019","uniqueId":1549818591855},{"description":"Rds net x2","value":"75","category":"Utilities","dateTime":"02/10/2019","uniqueId":1549818640623},{"description":"Apa + cioco\t","value":"20","category":"Food","dateTime":"02/10/2019","uniqueId":1549818675480},{"description":"Factura curent x2","value":"58.5","category":"Living","dateTime":"02/10/2019","uniqueId":1549818761944},{"description":"Cump Carrefour","value":"31","category":"Food","dateTime":"02/10/2019","uniqueId":1549818835708},{"description":"Di.fm","value":"19","category":"Personal","dateTime":"02/10/2019","uniqueId":1549818859046},{"description":"cartela metrou","value":"70","category":"Transport","dateTime":"02/10/2019","uniqueId":1549819035480},{"description":"Cump Obor","value":"330","category":"Food","dateTime":"02/10/2019","uniqueId":1549819194181},{"description":"Aparat de ras","value":"133","category":"Tech","dateTime":"02/17/2019","uniqueId":1550417359385},{"description":"Cump Mega","value":"146","category":"Food","dateTime":"02/17/2019","uniqueId":1550417521625},{"description":"Cump Carrefour","value":"9","category":"Food","dateTime":"02/17/2019","uniqueId":1550417605176},{"description":"Branzeturi Bio","value":"63","category":"Food","dateTime":"02/17/2019","uniqueId":1550417687198},{"description":"7 card","value":"125","category":"Sport","dateTime":"02/17/2019","uniqueId":1550417746189},{"description":"Cioco + apa birou","value":"10","category":"Food","dateTime":"02/17/2019","uniqueId":1550417817558},{"description":"Cump Obor","value":"80","category":"Food","dateTime":"02/17/2019","uniqueId":1550418040300},{"description":"Supra shooz","value":"320","category":"Clothes","dateTime":"2/23/2019","uniqueId":1550920885552},{"description":"Cump Mega","value":"80","category":"Food","dateTime":"2/23/2019","uniqueId":1550921811115},{"description":"Intretinere + apometre x2\n","value":"577","category":"Living","dateTime":"2/23/2019","uniqueId":1550922195582},{"description":"Medium monthly","value":"23","category":"Personal","dateTime":"2/23/2019","uniqueId":1550922295500},{"description":"Apa 10L","value":"9","category":"Food","dateTime":"2/23/2019","uniqueId":1550922338878},{"description":"Farm Tei(sapun + spray + Mg)","value":"34","category":"Personal","dateTime":"2/23/2019","uniqueId":1550922449285},{"description":"Placinta ","value":"4","category":"Food","dateTime":"2/23/2019","uniqueId":1550922582369},{"description":"Cumparaturi Obor","value":"178","category":"Food","dateTime":"2/23/2019","uniqueId":1550929842423},{"description":"Cumparaturi Mega","value":"110","category":"Food","dateTime":"02/26/2019","uniqueId":1551523854300},{"description":"Farm. Tei (test candida + dop urechi)","value":"25","category":"Health","dateTime":"02/27/2019","uniqueId":1551524938578},{"description":"Farm Tei(Mg + Spray + Sapun)","value":"34","category":"Health","dateTime":"02/27/2019","uniqueId":1551525141046},{"description":"Apa birou","value":"6","category":"Food","dateTime":"02/28/2019","uniqueId":1551525465384},{"description":"Martisor colege","value":"10","category":"Personal","dateTime":"02/28/2019","uniqueId":1551525559847},{"description":"cafea birou","value":"3","category":"Food","dateTime":"02/26/2019","uniqueId":1551525597690},{"description":"Asoc relatii","value":"20","category":"Personal","dateTime":"03/01/2019","uniqueId":1551525739385},{"description":"Apa 10L","value":"9","category":"Food","dateTime":"03/02/2019","uniqueId":1551525830853},{"description":"Ulei cocos 1L","value":"60","category":"Food","dateTime":"03/02/2019","uniqueId":1551525910858},{"description":"Farm Tei(Dopuri urechi + det vase)","value":"32.5","category":"Health","dateTime":"03/02/2019","uniqueId":1551526069142},{"description":"Internet","value":"37.43","category":"Utilities","dateTime":"01/05/2019","id":1546664508230},{"description":"Asociatia pentru relatii","value":"20","category":"Personal","dateTime":"01/05/2019","id":1546664555179},{"description":"Cumparaturi Mega","value":"205.47","category":"Food","dateTime":"01/05/2019","id":1546664601573},{"description":"Cumparaturi Obor","value":"220","category":"Food","dateTime":"01/09/2019","id":1547056181244},{"description":"Diferenta cartela metrou","value":"27","category":"Transport","dateTime":"01/09/2019","id":1547056250207},{"description":"Drum revelion","value":"50","category":"Transport","dateTime":"01/09/2019","id":1547056314870},{"description":"Fotbal","value":"22","category":"Sport","dateTime":"01/09/2019","id":1547056348188},{"description":"Chirie Ianuarie - apometre","value":"892","category":"Living","dateTime":"01/09/2019","id":1547056561659},{"description":"Ceaiuri + miere Obor","value":"21.6","category":"Food","dateTime":"01/09/2019","id":1547056603026},{"description":"Cumparaturi Mega","value":"58.26","category":"Food","dateTime":"01/09/2019","id":1547056636523},{"description":"Cartela Vodafone","value":"38.78","category":"Living","dateTime":"01/09/2019","id":1547061254935},{"description":"DI.fm","value":"19.35","category":"Personal","dateTime":"01/09/2019","id":1547061285103},{"description":"7Card","value":"125","category":"Sport","dateTime":"01/09/2019","id":1547061316460},{"description":"Cumparaturi Obor","value":"260","category":"Food","dateTime":"01/13/2019","id":1547382855547},{"description":"Intretinere Octombrie","value":"163","category":"Living","dateTime":"01/13/2019","id":1547382918859},{"description":"Mi Fitness Band","value":"90","category":"Tech","dateTime":"01/13/2019","id":1547382987519},{"description":"Imprimanta Canon","value":"225","category":"Tech","dateTime":"01/13/2019","id":1547383023945},{"description":"Cumparaturi Mega","value":"45","category":"Food","dateTime":"01/18/2019","id":1547840928346},{"description":"Detergent vase","value":"7.3","category":"Living","dateTime":"01/18/2019","id":1547841039956},{"description":"orez + apa Carefour","value":"18","category":"Food","dateTime":"01/18/2019","id":1547841093577},{"description":"Fotbal","value":"35","category":"Sport","dateTime":"01/18/2019","id":1547842919482},{"description":"Cumparaturi mega 10 ian","value":"62","category":"Food","dateTime":"01/18/2019","id":1547843056246},{"description":"Cumparaturi Obor","value":"260","category":"Food","dateTime":"01/19/2019","id":1547916378626},{"description":"Ulei cod + alge","value":"40","category":"Food","dateTime":"01/19/2019","id":1547916509438},{"description":"sapun + detergent vase + sampon + pasta de dinti + periuta de dinti Farmacia Tei","value":"119","category":"Personal","dateTime":"01/19/2019","id":1547916724922},{"description":"Airsoft","value":"105","category":"Sport","dateTime":"01/20/2019","id":1547989536110},{"description":"10L apa plata","value":"9","category":"Food","dateTime":"01/20/2019","id":1547989716563},{"description":"TP for my bumhole","value":"7","category":"Personal","dateTime":"01/20/2019","id":1547989754435},{"description":"Medium subscription","value":"23","category":"Personal","dateTime":"01/20/2019","id":1547989833581},{"description":"Cumparaturi Mega ","value":"101","category":"Food","dateTime":"01/21/2019","id":1548102068482},{"description":"Kindle","value":"579","category":"Tech","dateTime":"01/26/2019","id":1548507558077},{"description":"Mortal Kombat present for little brother","value":"286","category":"Personal","dateTime":"01/26/2019","id":1548507805614},{"description":"Fotbal","value":"27","category":"Sport","dateTime":"01/26/2019","id":1548508120252},{"description":"Apa plata 10L","value":"8.6","category":"Food","dateTime":"01/26/2019","id":1548508233964},{"description":"Cumparaturi Obor ","value":"210","category":"Food","dateTime":"01/26/2019","id":1548508338682},{"description":"cumparaturi Karefour","value":"20","category":"Food","dateTime":"01/31/2019","id":1548965569791},{"description":"cumparaturi Mega","value":"89","category":"Food","dateTime":"01/31/2019","id":1548965626715},{"description":"apa + cafea ","value":"9","category":"Food","dateTime":"01/31/2019","id":1548965641976},{"description":"ochelari vedere","value":"37","category":"Personal","dateTime":"01/31/2019","id":1548965747718},{"description":"substanta gandaci","value":"40","category":"Living","dateTime":"01/31/2019","id":1548965763125},{"description":"Husa telefon","value":"40","category":"Tech","dateTime":"01/31/2019","id":1548965793757},{"description":"Cump Kaufland","value":"210","category":"Food","dateTime":"03/03/2019","uniqueId":1552215300662},{"description":"Chirie Martie","value":"867","category":"Living","dateTime":"03/04/2019","uniqueId":1552215366650},{"description":"Cump Mega","value":"154","category":"Food","dateTime":"03/05/2019","uniqueId":1552215397663},{"description":"Portofel","value":"160","category":"Clothes","dateTime":"03/08/2019","uniqueId":1552215762393},{"description":"Acumulator extern","value":"104","category":"Tech","dateTime":"03/08/2019","uniqueId":1552215953442},{"description":"Cartus imprimanta","value":"106","category":"Tech","dateTime":"03/08/2019","uniqueId":1552216011763},{"description":"Cartela metrou","value":"70","category":"Transport","dateTime":"03/08/2019","uniqueId":1552216080105},{"description":"Cump Carrefour","value":"33","category":"Food","dateTime":"03/10/2019","uniqueId":1552216140252},{"description":"DI.fm","value":"20","category":"Personal","dateTime":"03/10/2019","uniqueId":1552216163887},{"description":"Stila de vin","value":"18","category":"Personal","dateTime":"03/03/2019","uniqueId":1552216214108},{"description":"Cump Kaufland","value":"263","category":"Food","dateTime":"03/09/2019","uniqueId":1552216358964},{"description":"Vin + tirbuson","value":"43","category":"Personal","dateTime":"03/09/2019","uniqueId":1552216381132},{"description":"Film + nachos","value":"46","category":"Personal","dateTime":"03/08/2019","uniqueId":1552216607496},{"description":"Cadou colege 8 mar","value":"10","category":"Personal","dateTime":"03/08/2019","uniqueId":1552216650940},{"description":"diverse birou","value":"10","category":"Food","dateTime":"03/06/2019","uniqueId":1552216768258},{"description":"plimbare parc ","value":"40","category":"Personal","dateTime":"03/10/2019","uniqueId":1552722609571},{"description":"Cump Mega","value":"155.5","category":"Food","dateTime":"03/13/2019","uniqueId":1552722681488},{"description":"7Card","value":"129","category":"Sport","dateTime":"03/15/2019","uniqueId":1552722761456},{"description":"Cart Vodafone","value":"40","category":"Utilities","dateTime":"03/16/2019","uniqueId":1552723048779},{"description":"cump Kaufland","value":"192","category":"Food","dateTime":"03/17/2019","uniqueId":1552937108906},{"description":"cump Carrefour","value":"35","category":"Food","dateTime":"03/18/2019","uniqueId":1552937190385},{"description":"2xcurent(feb+mar)","value":"54","category":"Utilities","dateTime":"03/18/2019","uniqueId":1552939831815},{"description":"cump Mega","value":"101","category":"Food","dateTime":"03/20/2019","uniqueId":1553349483424},{"description":"apa + batoane proteice","value":"10","category":"Food","dateTime":"03/21/2019","uniqueId":1553349536448},{"description":"Medium sub","value":"23","category":"Tech","dateTime":"03/22/2019","uniqueId":1553349592963},{"description":"cadou colega","value":"10","category":"Personal","dateTime":"03/19/2019","uniqueId":1553349838332},{"description":"carrefour cioco + apa","value":"23","category":"Food","dateTime":"03/23/2019","uniqueId":1553353543840},{"description":"cump kaufland","value":"198.5","category":"Food","dateTime":"03/24/2019","uniqueId":1553447816160},{"description":"chirie ian","value":"311","category":"Utilities","dateTime":"03/25/2019","uniqueId":1553630744900},{"description":"cump Mega ","value":"57","category":"Food","dateTime":"03/25/2019","uniqueId":1553631397311},{"description":"sticla vin","value":"17.5","category":"Personal","dateTime":"03/24/2019","uniqueId":1553631443939},{"description":"tuns","value":"30","category":"Personal","dateTime":"03/27/2019","uniqueId":1553714215705},{"description":"apa + cioco + legume ciorbix","value":"19.5","category":"Food","dateTime":"03/30/2019","uniqueId":1553936645279},{"description":"cotlet berbecut","value":"27","category":"Food","dateTime":"03/29/2019","uniqueId":1553936709818},{"description":"apa + baton proteic ","value":"5.5","category":"Food","dateTime":"03/29/2019","uniqueId":1553936741684}]
      // expenses = this.formatDates(expenses);

      // console.log(expenses);

      expenses.forEach(function(expense){
        StorageCtrl.addExpense(expense);
      });
  
      // console.log(expenses);
    }
  
  }
})();


const ChartSingleton = (function(){
  let instance;
  let options = {};
  
  function createInstance() {
    setOptions();

    const chart = new ApexCharts(document.querySelector(UICtrl.getUISelectors().chart), getOptions());
    return chart;
  }

  function getOptions() {
    return options;
  }

  function setOptions(expenses = null) {
    // options = {
    //   chart: {
    //     height: 450,
    //     width: "100%",
    //     type: "bar",
    //     background: "#f4f4f4",
    //     foreColor: "#333"
    //   },
    //   plotOptions: {
    //     bar: {
    //       horizontal: false
    //     }
    //   },
    //   series: [
    //     {
    //       name: "Expenses",
    //       data: HelperCtrl.getExpPerCat(expenses),
    //     }
    //   ],
    //   xaxis: {
    //     categories: StorageCtrl.getCategories()
    //   },
    //   fill: {
    //     colors: ["#F44336"]
    //   },
    //   dataLabels: {
    //     enabled: false
    //   },

    //   title: {
    //     text: "Expenses/Category",
    //     align: "center",
    //     margin: 20,
    //     offsetY: 20,
    //     style: {
    //       fontSize: "25px"
    //     }
    //   }
    // };
    
   options = {
      chart: {
          width: '100%',
          type: 'pie',
          events: {
            dataPointSelection: function(event, chartContext, config) {
              const category = event.target.parentElement.classList[2];

              const filtered = ExpenseCtrl.filterExpensesByCategory(category);
              
              UICtrl.displayExpenses(filtered);
              
              const totalExpenses = ExpenseCtrl.getTotal(filtered);
              UICtrl.displayTotal(totalExpenses);

              // console.log(config);
            },
          },
      },
      series: HelperCtrl.getExpPerCat(expenses),
      labels: StorageCtrl.getCategories(),
      theme: {
          monochrome: {
              // enabled: true
          }
      },
      title: {
          // text: "Expenses/Category"
      },
      responsive: [{
          breakpoint: 480,
          options: {
              chart: {
                  width: 200
              },
              legend: {
                  position: 'bottom'
              }
          }
      }],
      
    };

    
    return options;
  }

  return {
    getInstance: function() {
      if(!instance) {
        instance = createInstance();
      }
      return instance;
    },
    updateChart: function(expenses) {
      
      if (Array.isArray(expenses) && expenses.length) {
        // console.log(expenses);

        setOptions(expenses);
        this.getInstance().updateOptions(getOptions());  
      }
      else {
        // Clear chart
        document.querySelector(UICtrl.getUISelectors().chart).innerHTML = '';
      }
    }
  }
})();


const App = (function(ExpenseCtrl, UICtrl, StorageCtrl, HelperCtrl, ChartSingleton){

  const loadEventElisteners = function(){
    document.querySelector(UICtrl.getUISelectors().sortList).addEventListener('click', sortExpenses);
    document.querySelector(UICtrl.getUISelectors().expenseList).addEventListener('click', deleteExpense);
    document.querySelector(UICtrl.getUISelectors().expenseList).addEventListener('click', editExpense);
    document.querySelector(UICtrl.getUISelectors().submit).addEventListener('click', addExpense);
    document.querySelector(UICtrl.getUISelectors().edit).addEventListener('click', editExpenseSubmit);
    document.querySelector(UICtrl.getUISelectors().edit).addEventListener('click', editExpenseSubmit);    
    document.getElementsByTagName('body')[0].addEventListener('click', showAllExpenses);    
  }

  const showAllExpenses = function(e) {
    // console.log(e.target.nodeName);
    if(e.target.nodeName != 'path') {
      const startDateInputValue = document.querySelector(UICtrl.getUISelectors().startDateInput).value;
      const endDateInputValue = document.querySelector(UICtrl.getUISelectors().endDateInput).value;

      const expenses = ExpenseCtrl.getExpensesByDate(startDateInputValue, endDateInputValue);

      if (expenses.length === 0) {
        UICtrl.hideList();
      }
      else {
        // display current month expenses
        UICtrl.displayExpenses(expenses);
        
        // display current month chart
        UICtrl.displayChart(expenses);
      }
    
      // display current month total
      const totalExpenses = ExpenseCtrl.getTotal();
      UICtrl.displayTotal(totalExpenses);
    }

    e.preventDefault();
  }

  const addExpense = function(e){
    // Get form values
    const description = document.querySelector(UICtrl.getUISelectors().description).value,
          value = document.querySelector(UICtrl.getUISelectors().value).value;
  
    const categList = document.querySelector(UICtrl.getUISelectors().categoryList),
          selectedCateg = categList.options[categList.selectedIndex].text;
          uniqueId = Date.now();
          now = new Date();
    
    let date = document.querySelector(UICtrl.getUISelectors().date).value,
        category = document.querySelector(UICtrl.getUISelectors().category).value,
        dateTime = now.toLocaleString().toString();
        
    // let time = dateTime.substr(0, dateTime.indexOf(','));
    const today = dateTime.substr(0, dateTime.indexOf(','));
    
    // If no new category get selected category
    if (category == '') category = selectedCateg;

    // If no new date get today
    if (date == '') date = today;
  
    // Validate
    if(description === '' || value === '' || category === '' || uniqueId == '') {
      // Error alert
      UICtrl.showAlert('Please fill in all fields', 'error');
    } else {
       // Instantiate expense and add it to data structure
      const expense = ExpenseCtrl.addExpense(description, value, category, date, uniqueId); 

      // Add expense to list
      UICtrl.addExpenseToList(expense);
  
      // Add to LS
      StorageCtrl.addExpense(expense);

      // Show success
      UICtrl.showAlert('Expense Added!', 'success');
      
      // Add category to LS
      StorageCtrl.addCategory(category);
  
      // display current month total
      const totalExpenses = ExpenseCtrl.getTotal();
      UICtrl.displayTotal(totalExpenses);

      // get expenses from data structure, then update chart 
      const expenses = ExpenseCtrl.getExpenses();
      ChartSingleton.updateChart(expenses);
    
      // Clear fields
      UICtrl.clearFields();
    }
  
    e.preventDefault();
  };

  const editExpenseSubmit = function(e) {
    const input = UICtrl.getExpenseSubmit();
    // console.log(input);

    // Validate
    if(input.description === '' || input.value === '' || input.category === '' || input.date == '') {
      // Error alert
      UICtrl.showAlert('Please fill in all fields', 'error');
    } else {
      const updatedExpense = ExpenseCtrl.updateExpense(input.description, input.value, input.category, input.date);
      // console.log(updatedExpense);
  
      UICtrl.updateExpenseItem(updatedExpense);
    
      // Display updated total
      const totalExpenses = ExpenseCtrl.getTotal();
      UICtrl.displayTotal(totalExpenses);
  
      // Update local storage 
      StorageCtrl.updateItemStorage(updatedExpense);

      UICtrl.showSubmitState();

      UICtrl.showAlert('Expense edited successfully', 'success');
    }

    e.preventDefault();
  }

  const sortExpenses = function(e) {
    const th = e.target;
    const order = th.getAttribute('order');
    const expenseList = document.querySelector(UICtrl.getUISelectors().expenseList);

    // const expenses = Storage.getExpenses();
    const expenses = ExpenseCtrl.getExpenses();
    // console.log(expenses);
    
    expenses.sort(HelperCtrl.compareValues(th.id, order));
  
    expenseList.innerHTML = '';
    UICtrl.displayExpenses(expenses);
  
    if (order == 'desc') 
      th.setAttribute('order', 'asc');
    else 
      th.setAttribute('order', 'desc');
  
    e.preventDefault();
  }

  const deleteExpense = function(e) {

    if(e.target.className === 'delete') {
      // const id = e.target.parentElement.previousElementSibling.textContent;
      const id = e.target.parentElement.parentElement.id.split('-')[1];
      // console.log(id);
    
      if (id) {
        // console.log('Delete from data structure');
        ExpenseCtrl.deleteExpense(id);

        // Delete expense from UI
        UICtrl.deleteExpense(e.target);

        // console.log("Get new expenses..");
        const expenses = ExpenseCtrl.getExpenses();
        // console.log(expenses);

        ChartSingleton.updateChart(expenses);

        // console.log("Display total..");
        const totalExpenses = ExpenseCtrl.getTotal();
        UICtrl.displayTotal(totalExpenses);

        // Remove from LS
        StorageCtrl.removeExpense(id);
        
        // Show message
        UICtrl.showAlert('Expense Removed!', 'success');    
      }
      
    }

    e.preventDefault();
  }

  const editExpense = function(e) {
    if (e.target.classList.contains('edit-item')) {
      const id = e.target.parentElement.parentElement.parentElement.id.split('-')[1];

      if (id) {
        const expenseToEdit = ExpenseCtrl.getExpenseById(id);

        ExpenseCtrl.setCurrentExpense(expenseToEdit);
        ExpenseCtrl.setCurrentCategory(expenseToEdit.category);

        UICtrl.addExpenseToForm();

        // Scroll to top  
        const scrollToTop = () => {
          const c = document.documentElement.scrollTop || document.body.scrollTop;
          if (c > 0) {
            window.requestAnimationFrame(scrollToTop);
            window.scrollTo(0, c - c / 8);
          }
        };
        scrollToTop();
      }
    }

    e.preventDefault();
  }

 
  return {
    init: function(){
      const dates = HelperCtrl.getFirstLastMonthDate();
      const firstDay = dates.firstDay;
      const lastDay = dates.lastDay;

      const startDateInput = document.querySelector(UICtrl.getUISelectors().startDateInput);
      const endDateInput = document.querySelector(UICtrl.getUISelectors().endDateInput);

      // console.log(firstDay);
      // console.log(lastDay)
      startDateInput.value = firstDay;
      endDateInput.value = lastDay;

      // HelperCtrl.populateExpenses();

      const expenses = ExpenseCtrl.getExpensesByDate(firstDay, lastDay);
      // console.log('init: ' + expenses.length);
      // const expenses = ExpenseCtrl.getExpenses();

      if (expenses.length === 0) {
        UICtrl.hideList();
      }
      else {
        // display current month expenses
        // UICtrl.displayExpenseByDate(expenses, firstDay, lastDay);
        UICtrl.displayExpenses(expenses);
        
        // display current month chart
        UICtrl.displayChart(expenses);
      }

      // display all categories
      const categories = ExpenseCtrl.getCategories();
      UICtrl.displayCategories(categories);
    
      // display current month total
      const totalExpenses = ExpenseCtrl.getTotal();
      UICtrl.displayTotal(totalExpenses);
      
      // display datepickers
      UICtrl.displayDatePickerRange();
      UICtrl.displayDatePickerDate();

      loadEventElisteners();
    }
  }

})(ExpenseCtrl, UICtrl, StorageCtrl, HelperCtrl, ChartSingleton) 


App.init();