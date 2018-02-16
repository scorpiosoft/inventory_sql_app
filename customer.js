// Customer View

// The app should then prompt users with two messages.

// The first should ask them the ID of the product they would like to buy.
// The second message should ask how many units of the product they would like to buy.

// Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.

// If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.

// However, if your store does have enough of the product, you should fulfill the customer's order.

// This means updating the SQL database to reflect the remaining quantity.
// Once the update goes through, show the customer the total cost of their purchase.

var mysql = require("mysql");
var inquirer = require("inquirer");
var sprintf = require("sprintf-js").sprintf;

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});

// connection.connect(function(err) {
//   if (err) throw err;
//   runSearch();
// });

function display_products()
{
  var query = "SELECT item_id, product_name, price, department_name FROM products ORDER BY department_name";
  // var query = "SELECT item_id, product_name, price FROM products";
  connection.query(query, function(err, res)
  {
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
    }
  });
}

display_products();

connection.end();
