const Connection = require("../config/database");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorhandleer");
const { io, connectedUsers } = require("../socket/Socket");

// Place a bid on an item
exports.createBid = catchAsyncErrors(async (req, res, next) => {
  const { itemId } = req.params;
  const { bid_amount } = req.body;

  const user_id = req.user.id;

  // Check if item exists and get the current highest bid and item owner
  Connection.query(
    "SELECT * FROM items WHERE id = ?",
    [itemId],
    (error, itemResults) => {
      if (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }
      if (itemResults.length === 0) {
        return next(new ErrorHandler("Item not found", 404));
      }

      const item = itemResults[0];
      console.log(item);

      if (bid_amount <= item.current_price) {
        return next(
          new ErrorHandler(
            "Bid amount must be higher than the current price",
            400
          )
        );
      }

      // Check if user exists
      Connection.query(
        "SELECT id FROM users WHERE id = ?",
        [user_id],
        (error, userResults) => {
          if (error) {
            console.log(error.message);
            return next(new ErrorHandler("Internal server error", 500));
          }
          if (userResults.length === 0) {
            return next(new ErrorHandler("User not found", 404));
          }

          // Insert bid into database
          Connection.query(
            "INSERT INTO bids (item_id, user_id, bid_amount) VALUES (?, ?, ?)",
            [itemId, user_id, bid_amount],
            (error, results) => {
              if (error) {
                console.log(error.message);
                return next(new ErrorHandler("Internal server error", 500));
              }

              console.log("object ", results);

              // Update current price in items table
              Connection.query(
                "UPDATE items SET current_price = ? WHERE id = ?",
                [bid_amount, itemId],
                (updateErr, updateResults) => {
                  if (updateErr) {
                    console.log(updateErr.message);
                    return next(new ErrorHandler("Internal server error", 500));
                  }

                  // Notify the item owner about the new bid
                  const ownerMessage = `Your item with ID ${itemId} has a new bid of ${bid_amount}`;
                  const hardCodedOwnerId = 123;
                  Connection.query(
                    "UPDATE notifications SET message = ? and is_read = true WHERE user_id in (?)",
                    [ownerMessage, hardCodedOwnerId],
                    (notifErr, notifResults) => {
                      if (notifErr) {
                        console.log(notifErr.message);

                        return next(
                          new ErrorHandler("Internal server error", 500)
                        );
                      }

                      // Emit the new bid event to the item owner
                      const ownerSocket = connectedUsers.get(
                        hardCodedOwnerId.toString()
                      );
                      console.log("owner socket", ownerSocket);
                      if (ownerSocket) {
                        ownerSocket.emit("newBid", {
                          itemId,
                          bid_amount,
                          user_id,
                        });
                      }

                      // Check if there is a previous highest bidder to notify them they have been outbid
                      Connection.query(
                        "SELECT user_id FROM bids WHERE item_id = ? ORDER BY bid_amount DESC LIMIT 1, 1",
                        [itemId],
                        (outbidErr, outbidResults) => {
                          if (outbidErr) {
                            console.log(outbidErr.message);

                            return next(
                              new ErrorHandler("Internal server error", 500)
                            );
                          }

                          if (outbidResults.length > 0) {
                            const outbidUserId = outbidResults[0].user_id;

                            const outbidMessage = `You have been outbid on item with ID ${itemId}. The new highest bid is ${bid_amount}`;
                            Connection.query(
                              "UPDATE notifications SET message = ? and is_read = true WHERE user_id in (?)",
                              [outbidMessage, outbidUserId],
                              (outbidNotifErr, outbidNotifResults) => {
                                if (outbidNotifErr) {
                                  return next(
                                    new ErrorHandler(
                                      "Internal server error",
                                      500
                                    )
                                  );
                                }

                                // Emit the outbid event to the previous highest bidder
                                const outbidSocket = connectedUsers.get(
                                  outbidUserId.toString()
                                );
                                if (outbidSocket) {
                                  outbidSocket.emit("outbid", {
                                    itemId,
                                    bid_amount,
                                    user_id,
                                  });
                                }
                              }
                            );
                          }

                          res.status(201).json({
                            success: true,
                            message:
                              "Bid placed successfully and notifications sent",
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

exports.getSpeficBid = catchAsyncErrors(async (req, res, next) => {
  const { itemId } = req.params;
  Connection.query(
    "SELECT id FROM items WHERE id = ?",
    [itemId],
    (error, itemResults) => {
      if (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }
      if (itemResults.length === 0) {
        return next(new ErrorHandler("Bid not found", 404));
      }
      // Insert bid into database
      Connection.query(
        "SELECT * FROM items WHERE id = ?",
        [itemId],
        (error, results) => {
          if (error) {
            return next(new ErrorHandler("Internal server error", 500));
          }
          console.log(results);
          res.status(200).json({ success: true, results });
        }
      );
    }
  );
});
