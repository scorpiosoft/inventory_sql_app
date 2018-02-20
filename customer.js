var mysql = require("mysql");
var inquirer = require("inquirer");
var sprintf = require("sprintf-js").sprintf;

var connection = mysql.createConnection(
{
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});

connection.connect(function(err)
{
  if (err) throw err;
  display_products();
});

var product_list = [];

function display_products()
{
  var do_add_list = false;
  var query = "SELECT item_id, product_name, price, department_name FROM products ORDER BY department_name";

  if (product_list.length === 0)
    do_add_list = true;

  connection.query(query, function(err, res)
  {
    if (err) console.log(err);

    var dept, sav_dept = '';
    for (var i = 0; i < res.length; i++)
    {
      dept = res[i].department_name;
      if (dept !== sav_dept)
      {
        console.log('Department:', dept);
        sav_dept = dept;
      }
      var out = sprintf("\tID: %3d   Name: %22s   Price: %10.2f"
                  , res[i].item_id
                  , res[i].product_name
                  , res[i].price
                );
      console.log(out);
      if (do_add_list) product_list.push(res[i].product_name);
    }
    // console.log(product_list);
    console.log('');
    make_purchase();
  });
}

function make_purchase()
{
  inquirer.prompt([
  {
    name: "product",
    type: "list",
    message: "What would you like to buy?",
    choices: product_list
  },
  {
    name: "quantity",
    type: "input",
    message: "Quantity?",
    validate: function(value)
    {
      if (isNaN(value)) return false;
      return true;
    }
  }
  ]).then(function(answers)
  {
    // console.log(answers);
    check_inventory(answers);
  });
}

function check_inventory(answers)
{
  var query = "SELECT product_name, price, stock_quantity FROM products WHERE product_name=?";

  connection.query(query, [answers.product], function(err, res)
  {
    if (err) console.log(err);

    // console.log(res);
    if (res[0].stock_quantity >= answers.quantity)
    {
      complete_purchase(answers, res[0].stock_quantity, res[0].price);
    } else {
      console.log('\nInsufficient quantity in stock [', res[0].stock_quantity, ']');
      connection.end();
    }
  });
}

function complete_purchase(answers, qty, price)
{
  var query = "UPDATE products SET ? WHERE ?";
    
  connection.query(query, [{ stock_quantity: qty - answers.quantity },
                           { product_name: answers.product }], function(err, res)
  {
    if (err) console.log(err);

    console.log('Your purchase comes to $' + (answers.quantity * price).toFixed(2));
    connection.end();
  });
}
