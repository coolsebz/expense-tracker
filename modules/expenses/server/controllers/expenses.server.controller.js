'use strict';

var path = require('path'),
  _ = require('lodash'),
  User = require(path.resolve('./modules/users/server/models/user.server.model')),
  Users = require(path.resolve('./modules/users/server/collections/user.server.collection')),
  Expense = require(path.resolve('./modules/expenses/server/models/expense.server.model')),
  Expenses = require(path.resolve('./modules/expenses/server/collections/expense.server.collection')),
  Category = require(path.resolve('./modules/categories/server/models/category.server.model')),
  Categories = require(path.resolve('./modules/categories/server/collections/category.server.collection')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/*
 * Create a new expense
 */
exports.create = function(req, res) {
  var selectedContacts = req.body.selectedContacts;
  delete req.body.selectedContacts;

	var expense = new Expense(req.body);
	expense.attributes.user_id = req.user.attributes.id;

	expense.save().then(function(savedExpense) {

    //note(seb): tad bit slower than a classic for but a lot easier to read
    selectedContacts.map(function(contact) {
      savedExpense.shared_users().attach(contact.id);
    });

    if(expense.attributes.type === 'expense') {
      req.user.attributes.balance -= expense.attributes.amount;
    }
    else if(expense.attributes.type === 'income') {
      req.user.attributes.balance += expense.attributes.amount;
    }

    //todo(seb): ask about formula for updating the balance of shared contacts
    req.user.save(null, { method: 'update' }).then(function(savedUser) {
      res.json(savedExpense);
    }).catch(function(err) {
      return res.status(400).send({
        err: err,
        message: errorHandler.getErrorMessage(err)
      });
    });
	}).catch(function(err) {
    console.log(err);
		return res.status(400).send({
      err: err,
			message: errorHandler.getErrorMessage(err)
		});
	});
};

/* 
 * Show an expense
 */
exports.read = function(req, res) {
	res.json(req.expense);
};

exports.update = function(req, res) {


  //todo(seb): add  _.extend here
  var expense = req.expense;

  //todo(seb): support more operations
  expense.attributes.category_id = req.body.category_id;

  //note(seb): setting the method explicitly to 'update' makes it so that if it fails we get a different,
  //           more accurate error message back than just 'no rows updated'
  expense.save().then(function(savedExpense) {
    res.json(savedExpense);
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });

};

exports.delete = function(req, res) {
  var expense = req.expense;

  expense.destroy().then(function(deletedExpense) {
    res.json(deletedExpense);
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

exports.list = function(req, res) {

  if(!req.user) {
    return [];
  }

  var whereQuery = {
    user_id: req.user.attributes.id
  };

  if(req.query.categoryId) {
    whereQuery.category_id = req.query.categoryId;
  }
  else if(req.query.category) {
    //todo(seb): build the loading of categories as word parameters
    //           should do a lookup based on the name of the category instead of its ID
  }

  Expenses.query({ 
    where: whereQuery
  }).fetch({
    withRelated: ['category', 'shared_users']
  }).then(function(loadedModels) {
    res.json(loadedModels);
  }).catch(function(err) {
    console.log(err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

exports.expenseById = function(req, res, next, id) {

  new Expense({ id: id })
    .fetch({
      withRelated: ['category', 'user', 'shared_users']
    })
    .then(function(loadedExpense) {

      if(!loadedExpense) {
        return res.status(404).send({
          message: 'No article with that identifier has been found'
        });  
      }

      req.expense = loadedExpense;
      return next();
    }).catch(function(err) {
      return next(err);
    });
};

exports.stats = function(req, res) {

  Expenses.query({
    where: {
      user_id: req.user.attributes.id
    }
  }).fetch({
    withRelated: ['category', 'shared_users']
  }).then(function(loadedExpenses) {

      if(req.query.daily) {
        return res.json(dailyStats(loadedExpenses));
      }
      else if(req.query.perCategory) {
        return res.json(categoryStats(loadedExpenses));
      }
      else if(req.query.weekly) {
        return res.json(weeklyStats(loadedExpenses));
      }
      else if(req.query.weeklyDetailed) {
        return res.json(weeklyDetailedStats(loadedExpenses));
      }
      else if(req.query.sharedExpenses) {
        return res.json(sharedStats(loadedExpenses));
      }
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

function dailyStats(expenses) {
  return _.chain(expenses.models)
  .map(function(expense) { 

    //note(seb): here we transform the original model into something closer to the end result
    // for example, we combine the expense type with the nested array requirement for the graph data
    // and based on the expense type we create an array of the form [ expense_value, income_value ]
    
    if(expense.attributes.type === 'income') {
      return { receipt_date: new Date(expense.attributes.receipt_date).getDate() + '/' + new Date(expense.attributes.receipt_date).getMonth(), daily_value: [0, expense.attributes.amount] };
    }
    else if(expense.attributes.type === 'expense') {
      return { receipt_date: new Date(expense.attributes.receipt_date).getDate() + '/' + new Date(expense.attributes.receipt_date).getMonth(), daily_value: [expense.attributes.amount, 0] };
    }
  })
  .reduce(function(result, expense) {
  
    //note(seb): now that we have a better model, we can start working with the reduce function
    // combining the receipt date with the nested array for the final version of the chart data
  
    if(result.labels.indexOf(expense.receipt_date) !== -1) {
      result.values[0][result.labels.indexOf(expense.receipt_date)] += expense.daily_value[0];
      result.values[1][result.labels.indexOf(expense.receipt_date)] += expense.daily_value[1];
    }
    else {
      result.labels.push(expense.receipt_date);
      result.values[0][result.labels.indexOf(expense.receipt_date)] = expense.daily_value[0];
      result.values[1][result.labels.indexOf(expense.receipt_date)] = expense.daily_value[1];
    }
    
    return result;

  }, { labels: [], values: [ [], [] ], series: ['Expenses', 'Incomes'] }).value();
}

function categoryStats(expenses) {
  return _.chain(expenses.models)
  .map(function(expense) { 
    //note(seb): here we transform the original model into something closer to the end result
    // for example, we combine the expense type with the nested array requirement for the graph data
    // and based on the expense type we create an array of the form [ expense_value, income_value ]

    expense = expense.toJSON(); // quick way to make bookshelf resolve all other nested relations

    if(expense.type === 'income') {
      return { category: expense.category_id ? expense.category.name : 'Uncathegorized', daily_value: [0, expense.amount] };
    }
    else if(expense.type === 'expense') {
      return { category: expense.category_id ? expense.category.name : 'Uncathegorized', daily_value: [expense.amount, 0] };
    }
  })
  .reduce(function(result, expense) {
  
    //note(seb): now that we have a better model, we can start working with the reduce function
    // combining the receipt date with the nested array for the final version of the chart data
  
    if(result.labels.indexOf(expense.category) !== -1) {
      result.values[0][result.labels.indexOf(expense.category)] += expense.daily_value[0];
      result.values[1][result.labels.indexOf(expense.category)] += expense.daily_value[1];
    }
    else {
      result.labels.push(expense.category);
      result.values[0][result.labels.indexOf(expense.category)] = expense.daily_value[0];
      result.values[1][result.labels.indexOf(expense.category)] = expense.daily_value[1];
    }
    
    return result;

  }, { labels: [], values: [ [], [] ], series: ['Expenses', 'Incomes'] }).value();
}

function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(+d);
    d.setHours(0,0,0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay()||7));
    // Get first day of year
    var yearStart = new Date(d.getFullYear(),0,1);
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return [weekNo, d.getFullYear()];
}

function weeklyStats(expenses) {
  return _.chain(expenses.models)
  .map(function(expense) { 
    //note(seb): here we transform the original model into something closer to the end result
    // for example, we combine the expense type with the nested array requirement for the graph data
    // and based on the expense type we create an array of the form [ expense_value, income_value ]

    expense = expense.toJSON(); // quick way to make bookshelf resolve all other nested relations

    if(expense.type === 'income') {
      return { category: 'Week #' + getWeekNumber(new Date(expense.receipt_date)), daily_value: [0, expense.amount] };
    }
    else if(expense.type === 'expense') {
      return { category: 'Week #' + getWeekNumber(new Date(expense.receipt_date)), daily_value: [expense.amount, 0] };
    }
  })
  .reduce(function(result, expense) {
  
    //note(seb): now that we have a better model, we can start working with the reduce function
    // combining the receipt date with the nested array for the final version of the chart data
  
    if(result.labels.indexOf(expense.category) !== -1) {
      result.values[0][result.labels.indexOf(expense.category)] += expense.daily_value[0];
      result.values[1][result.labels.indexOf(expense.category)] += expense.daily_value[1];
    }
    else {
      result.labels.push(expense.category);
      result.values[0][result.labels.indexOf(expense.category)] = expense.daily_value[0];
      result.values[1][result.labels.indexOf(expense.category)] = expense.daily_value[1];
    }
    
    return result;

  }, { labels: [], values: [ [], [] ], series: ['Expenses', 'Incomes'] }).value();
}

function weeklyDetailedStats(expenses) {
  return _.chain(expenses.models)
  .map(function(expense) { 
    //note(seb): here we transform the original model into something closer to the end result
    // for example, we combine the expense type with the nested array requirement for the graph data
    // and based on the expense type we create an array of the form [ expense_value, income_value ]

    expense = expense.toJSON(); // quick way to make bookshelf resolve all other nested relations

    if(expense.type === 'income') {
      return { week: 'Week #' + getWeekNumber(new Date(expense.receipt_date)), category: expense.category_id ? expense.category.name : 'Uncathegorized', daily_value: [0, expense.amount] };
    }
    else if(expense.type === 'expense') {
      return { week: 'Week #' + getWeekNumber(new Date(expense.receipt_date)), category: expense.category_id ? expense.category.name : 'Uncathegorized', daily_value: [expense.amount, 0] };
    }
  })
  .reduce(function(result, expense) {
  
    //note(seb): now that we have a better model, we can start working with the reduce function
    // combining the receipt date with the nested array for the final version of the chart data
    if(!result[expense.week]) {
      result[expense.week] = { categories: {} };
    }

    if(!result[expense.week].categories[expense.category]) {
      result[expense.week].categories[expense.category] = [0, 0];
    }

    result[expense.week].categories[expense.category][0] += expense.daily_value[0];
    result[expense.week].categories[expense.category][1] += expense.daily_value[1];

    return result;

  }, {}).value();
}

function sharedStats(expenses) {
  return _.chain(expenses.models)
  .map(function(expense) { 
    //note(seb): here we transform the original model into something closer to the end result
    // for example, we combine the expense type with the nested array requirement for the graph data
    // and based on the expense type we create an array of the form [ expense_value, income_value ]

    expense = expense.toJSON(); // quick way to make bookshelf resolve all other nested relations

    if(expense.type === 'income') {
      return { category: expense.shared_users.length > 0 ? 'Shared' : 'Personal', daily_value: [0, expense.amount] };
    }
    else if(expense.type === 'expense') {
      return { category: expense.shared_users.length > 0 ? 'Shared' : 'Personal', daily_value: [expense.amount, 0] };
    }
  })
  .reduce(function(result, expense) {
  
    //note(seb): now that we have a better model, we can start working with the reduce function
    // combining the receipt date with the nested array for the final version of the chart data
  
    if(result.labels.indexOf(expense.category) !== -1) {
      result.values[0][result.labels.indexOf(expense.category)] += expense.daily_value[0];
      result.values[1][result.labels.indexOf(expense.category)] += expense.daily_value[1];
    }
    else {
      result.labels.push(expense.category);
      result.values[0][result.labels.indexOf(expense.category)] = expense.daily_value[0];
      result.values[1][result.labels.indexOf(expense.category)] = expense.daily_value[1];
    }
    
    return result;

  }, { labels: [], values: [ [], [] ], series: ['Expenses', 'Incomes'] }).value();
}