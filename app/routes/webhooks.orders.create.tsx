import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { addRewardPoints } from "../models/RewardCustomer.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (topic === "orders/create") {
    const order = payload;

    // Only process orders with a customer
    if (order.customer) {
      const customer = order.customer;
      const email = customer.email;
      const firstName = customer.first_name || "";
      const lastName = customer.last_name || "";

      // Calculate points: 1 point per $1 spent (rounded down)
      const totalAmount = parseFloat(order.total_price || 0);
      const points = Math.floor(totalAmount);

      if (email && points > 0) {
        try {
          await addRewardPoints(
            email,
            shop,
            points,
            `Order #${order.order_number} - ${totalAmount.toFixed(2)} spent`,
            totalAmount,
            order.id.toString(),
          );

          console.log(
            `Awarded ${points} points to ${email} for order #${order.order_number}`,
          );
        } catch (error) {
          console.error("Error awarding reward points:", error);
        }
      }
    }
  }

  return new Response();
};
