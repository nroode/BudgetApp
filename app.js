
//creating two independent modules.  These can be re-used in later projects 

//keeps track of all incomes and expenses
var budgetController = (function () {
    //create a new function constructor for data structure.  There will be lots of expenses so best way to do this.
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    //calculates the % values
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0 ) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1 
        };
    };

    //this one returns the values
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;

    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    // var allExpenses = [];
    // var allIncomes = [];
    // var totalExpenses = 0;

    //better to structure in an object instead of having variables float around like above
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: [],
            inc: []
        },
        budget: 0,
        percentage: -1
    };


    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            //create a new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            //create a new item based on inc or exp type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push it into data structure 
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;

        },

        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;

            });

            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            };
        },

        calculateBudget: function () {
            //calc total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            //calc the budget income - expense
            data.budget = data.totals.inc - data.totals.exp;
            //calc the % of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }


        },
        //for each lets you do something to each value in array
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })
        },

        //map allows you to return something and store in a variable, foreach does not
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },

        testing: function () {
            console.log(data);
        }
    }



})();


var UIController = (function () {



    var DOMstrings = {

        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

    
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.'+ dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i=0; i<list.length; i++ ){
            callback(list[i], i);
        }
    }

    return {
        getInput: function () {
            return { //return an object and remember correct object syntax 
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            //create html string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            }

            //replace the placeholder text with actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //insert the html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID)
            el.parentNode.removeChild(el)
        },

        clearFields: function () {
            var fields, fieldsArr;
            //qselectorAll will return a list, which we can't manipulate like an array so easily. Must convert it using slice
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            //saves the list as an array, but using slide on prototype object and passing in fields
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages) {
            //this will return a node list
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
           
            nodeListForEach(fields, function(current, index){
                if (percentages[index]>0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, year, months, month;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth();
            year = now.getFullYear();;
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            var fields;
            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
        
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');        
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };
    //some code
})();

//using different names as arguments to make more independent. iF pass same names through, would need to update names globally should you use this module again.
//decide what happens with each event and delegate tasks to other modules

var controller = (function (budgetCtrl, UICtrl) {

    var setUpEventListeners = function () {

        var DOM = UICtrl.getDOMstrings();
        // console.log(DOM);

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }

        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function () {
        //1.  Calc the budget
        budgetCtrl.calculateBudget();
        //2.  Return the budget
        var budget = budgetCtrl.getBudget();
        //3.  Display the budget on the UI
        UICtrl.displayBudget(budget);

    }
    var updatePercentages = function () {
        //calc %
        budgetCtrl.calculatePercentages();
        //read from budget controller
        var percentages = budgetCtrl.getPercentages();
        //update user interface
        UICtrl.displayPercentages(percentages);
    }

    var ctrlAddItem = function () {
        var newItem, input;

        //1.  Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // console.log(input);
            //2.  Add the item to the budget controller 
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //3.  Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            //4. Clear the fields
            UICtrl.clearFields();

            //5. calc and update budget
            updateBudget();

            //6. calc and update percentages;
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            //delete item from UI
            UICtrl.deleteListItem(itemID);
            //update and show new totals
            updateBudget();
            //6. calc and update percentages;
            updatePercentages();

        }
    }

    return {
        init: function () {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setUpEventListeners();
        }
    }



})(budgetController, UIController);

controller.init();