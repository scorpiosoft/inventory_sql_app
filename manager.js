// Manager View

// If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.
// If a manager selects View Low Inventory, then it should list all items with an inventory count lower than five.
// If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
// If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.

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
  do_prompt();
});

function do_prompt()
{
  inquirer.prompt(
  {
    name: "action",
    type: "list",
    message: "What would you like to manage?",
    choices: [
      "View Products for Sale",
      "View Low Inventory",
      "Add to Inventory",
      "Add New Product"
    ]
  })
  .then(function(answer)
  {
    switch (answer.action)
    {
      case "View Products for Sale":
        display_products();
        break;
      case "View Low Inventory":
        display_low_inventory();
        break;
      case "Add to Inventory":
        // due to the nature of creating complex programs when using inquirer
        // and the necessity of daisy-chaining everything, don't call
        // add_quantity directly, instead call display_products passing true
        display_products(true);
        break;
      case "Add New Product":
        add_product();
        break;
    }
  });
}

var product_list = [];

// display all the products
// parameter 'get_inventory' is optional, if true, do not show the products
//   when 'get_inventory'ing, this function doubles as the product array generator
function display_products(get_inventory)
{
  var query = "SELECT * FROM products ORDER BY department_name";

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
      if (get_inventory !== true)
      {
        var out = sprintf("\tID: %3d   Quantity: %10d   Name: %22s   Price: %10.2f"
                    , res[i].item_id
                    , res[i].stock_quantity
                    , res[i].product_name
                    , res[i].price
                  );
        console.log(out);
      }
      product_list.push({ name: res[i].product_name, qty: res[i].stock_quantity });
    }
    console.log('');
    if (get_inventory !== get_inventory)
      do_prompt();
    else
      add_quantity();
  });
}
