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
      if (get_inventory !== true)
      {
        dept = res[i].department_name;
        if (dept !== sav_dept)
        {
          console.log('Department:', dept);
          sav_dept = dept;
        }
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
    if (get_inventory !== true)
      do_prompt();
    else
      add_quantity();
  });
}

// display low inventory products
function display_low_inventory(get_inventory)
{
  var query = "SELECT product_name, stock_quantity FROM products WHERE stock_quantity < 5";

  connection.query(query, function(err, res)
  {
    if (err) console.log(err);

    for (var i = 0; i < res.length; i++)
    {
      var out = sprintf("\tQuantity: %10d   Name: %22s"
                  , res[i].stock_quantity
                  , res[i].product_name
                );
      console.log(out);
    }
    do_prompt();
  });
}

// add quantity to a product
function add_quantity()
{
  inquirer.prompt([
  {
    name: "product",
    type: "list",
    message: "Which product to add to?",
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
    var query = "UPDATE products SET ? WHERE ?";
    var p = product_list.find(p => p.name === answers.product);
    var qty = parseInt(p.qty) + parseInt(answers.quantity);

    var sql = connection.query(query,
      [
        {
          stock_quantity: qty
        },
        {
          product_name: answers.product
        }
      ],
      function(err, res)
      {
        if (err) console.log(err);

        // console.log(res);
        console.log("quantity updated,", res.changedRows == 1 ? 'true' : 'false', '\n');
        do_prompt();
      }
    );
    // console.log(sql.sql);
  });
}

function add_product()
{
  inquirer.prompt([
  {
    name: "product",
    type: "input",
    message: "What is the name of the new product?"
  },
  {
    name: "department",
    type: "input",
    message: "What department does the product belong to?"
  },
  {
    name: "price",
    type: "input",
    message: "Price?",
    validate: function(value)
    {
      if (isNaN(value)) return false;
      return true;
    }
  },
  {
    name: "quantity",
    type: "input",
    message: "Initial quantity?",
    validate: function(value)
    {
      if (isNaN(value)) return false;
      return true;
    }
  }
  ]).then(function(answers)
  {
    var query = "INSERT INTO products SET ?";

    connection.query(query,
      {
        product_name:    answers.product,
        department_name: answers.department,
        price:           answers.price,
        stock_quantity:  answers.quantity
      },
      function(err, res)
      {
        if (err) console.log(err);

        console.log("product added,", res.affectedRows == 1 ? 'true' : 'false', '\n');
        do_prompt();
      }
    );
  });
}
