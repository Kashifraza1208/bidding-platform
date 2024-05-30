// Create a new item

const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Connection = require("../config/database");
const ErrorHandler = require("../utils/errorhandleer");
const ApiFetures = require("../utils/apiFetures");
const path = require("path");
const multer = require("multer");

//image upload on multer

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image_url");

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}


//create auction items
exports.createItem = catchAsyncErrors(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return next(new ErrorHandler("Error uploading image", 400));
    }

    const { name, description, starting_price, current_price, end_time } =
      req.body;

    const image_url = req.file ? req.file.path : null;


    // Insert item into database
    Connection.query(
      "INSERT INTO items (name, description, starting_price, current_price, image_url, end_time) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, starting_price, current_price, image_url, end_time],
      (error, result) => {
        if (error) {
          return next(new ErrorHandler("Internal Server Error", 500));
        } else {
          res.status(201).json({ message: "Item created successfully" });
        }
      }
    );
  });
});

// Get all items --> pagination , searching and filtering
exports.getItems = catchAsyncErrors(async (req, res, next) => {
  let query = "SELECT * FROM items";
  const apiFeatures = new ApiFetures(query, req.query)
    .search()
    .filter()
    .pagination(4);


  Connection.query(apiFeatures.query, (error, results) => {
    if (error) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }

    res.status(200).json({ success: true, results });
  });
});

// Get single item by ID
exports.getItemDetails = catchAsyncErrors(async (req, res, next) => {
  const itemId = req.params.id;

  Connection.query(
    "SELECT * FROM items WHERE id = ?",
    [itemId],
    (error, result) => {
      if (error) {
        return next(new ErrorHandler("Internal Server Error", 500));
      }
      if (result.length === 0) {
        return next(new ErrorHandler(`Item not found with id ${itemId}`, 404));
      } else {
        res.status(200).json({ success: true, item: result[0] });
      }
    }
  );
});

// Update an item by ID
exports.updateItem = catchAsyncErrors(async (req, res, next) => {
  const itemId = req.params.id;
  const {
    name,
    description,
    starting_price,
    current_price,
    image_url,
    end_time,
  } = req.body;

  Connection.query(
    "UPDATE items SET name = ?, description = ?, starting_price = ?, current_price = ?, image_url = ?, end_time = ? WHERE id = ?",
    [
      name,
      description,
      starting_price,
      current_price,
      image_url,
      end_time,
      itemId,
    ],
    (error, result) => {
      if (error) {
        return next(new ErrorHandler("Internal Server Error", 500));
      }

      if (result.affectedRows === 0) {
        return next(new ErrorHandler(`Item not found with id ${itemId}`, 404));
      }
    }
  );

  // Fetch the updated item from database
  Connection.query(
    "SELECT * FROM items WHERE id = ?",
    [itemId],
    (error, result) => {
      if (error) {
        return next(new ErrorHandler("Internal Server Error", 500));
      }

      res.status(200).json({ success: true, item: result[0] });
    }
  );
});

// Delete an item by ID
exports.deleteItem = catchAsyncErrors(async (req, res, next) => {
  const itemId = req.params.id;

  Connection.query(
    "DELETE FROM items WHERE id = ?",
    [itemId],
    (error, result) => {
      if (error) {
        return next(new ErrorHandler("Internal Server Error", 500));
      }
      if (result.affectedRows === 0) {
        return next(new ErrorHandler(`Item not found with id ${itemId}`, 404));
      } else {
        res.status(200).json({
          success: true,
          message: `Item with id ${itemId} deleted successfully`,
        });
      }
    }
  );
});
