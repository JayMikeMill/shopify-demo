import { prisma as db } from "../db.server";

export async function getRewardCustomers(shop) {
  return await db.rewardCustomer.findMany({
    where: { shop },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { totalPoints: "desc" },
  });
}

export async function getRewardCustomer(id) {
  return await db.rewardCustomer.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getOrCreateRewardCustomer(
  email,
  shop,
  firstName,
  lastName,
) {
  return await db.rewardCustomer.upsert({
    where: { email },
    update: {
      firstName,
      lastName,
    },
    create: {
      email,
      shop,
      firstName,
      lastName,
      totalPoints: 0,
    },
  });
}

export async function addRewardPoints(
  email,
  shop,
  points,
  description,
  orderAmount,
  orderId,
) {
  const customer = await getOrCreateRewardCustomer(email, shop, null, null);

  const updatedCustomer = await db.rewardCustomer.update({
    where: { id: customer.id },
    data: {
      totalPoints: {
        increment: points,
      },
      transactions: {
        create: {
          points,
          description,
          orderAmount,
          orderId,
        },
      },
    },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return updatedCustomer;
}

export async function removeRewardPoints(customerId, points, description) {
  return await db.rewardCustomer.update({
    where: { id: customerId },
    data: {
      totalPoints: {
        decrement: points,
      },
      transactions: {
        create: {
          points: -points,
          description,
        },
      },
    },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
