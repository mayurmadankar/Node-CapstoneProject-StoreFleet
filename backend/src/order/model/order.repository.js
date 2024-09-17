import OrderModel from "./order.schema.js";
// import ProductModel from "./product.schema.js";
import ProductModel from "../../product/model/product.schema.js";
import mongoose from "mongoose";

export const createNewOrderRepo = async (data) => {
  const session = await mongoose.startSession();
  let transactionCommitted = false; // Flag to track if the transaction has been committed

  try {
    session.startTransaction();

    // Reduce the stock
    for (let order of data.orderedItems) {
      const product = await ProductModel.findById(order.product).session(
        session
      );

      if (!product) {
        throw new Error("Product not found: " + order.product);
      }

      product.stock -= order.quantity;
      if (product.stock < 0) {
        throw new Error("Not enough stock for " + product.name);
      }

      await product.save({ session });
    }

    // Create the order
    const order = new OrderModel(data);
    const resp = await order.save({ session });

    await session.commitTransaction();
    transactionCommitted = true; // Mark the transaction as committed
    return resp;
  } catch (error) {
    // Only abort the transaction if it has not been committed yet
    if (!transactionCommitted) {
      await session.abortTransaction();
    }
    throw new Error(error.message); // Return the error message
  } finally {
    session.endSession(); // Ensure the session is always ended
  }
};
