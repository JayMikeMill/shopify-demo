import { useState } from "react";
import { useLoaderData, useSubmit, useNavigation } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  getRewardCustomers,
  addRewardPoints,
  removeRewardPoints,
} from "../models/RewardCustomer.server";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const customers = await getRewardCustomers(session.shop);

  return {
    customers,
  };
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "add-points") {
    const email = formData.get("email");
    const firstName = formData.get("firstName") || "";
    const lastName = formData.get("lastName") || "";
    const points = parseInt(formData.get("points"), 10);
    const orderAmount = parseFloat(formData.get("orderAmount") || 0);

    if (!email || isNaN(points) || points <= 0) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    await addRewardPoints(
      email,
      session.shop,
      points,
      `Order purchase`,
      orderAmount || null,
      null,
    );
  }

  if (action === "remove-points") {
    const customerId = parseInt(formData.get("customerId"), 10);
    const points = parseInt(formData.get("points"), 10);

    if (isNaN(customerId) || isNaN(points) || points <= 0) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    await removeRewardPoints(customerId, points, "Points redeemed");
  }

  const customers = await getRewardCustomers(session.shop);
  return { customers };
}

const EmptyState = () => (
  <s-section accessibilityLabel="Empty state section">
    <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
      <s-box maxInlineSize="200px" maxBlockSize="200px">
        <s-image
          aspectRatio="1/1"
          src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          alt="A stylized graphic of a gift box"
        />
      </s-box>
      <s-grid justifyItems="center" maxBlockSize="450px" maxInlineSize="450px">
        <s-heading>No customers yet</s-heading>
        <s-paragraph>
          Start adding customers to track their reward points.
        </s-paragraph>
      </s-grid>
    </s-grid>
  </s-section>
);

const CustomerList = ({ customers }) => (
  <s-section padding="none" accessibilityLabel="Rewards customer list">
    <s-table>
      <s-table-header-row>
        <s-table-header listSlot="primary">Customer</s-table-header>
        <s-table-header>Total Points</s-table-header>
        <s-table-header>Transactions</s-table-header>
        <s-table-header>Joined</s-table-header>
      </s-table-header-row>
      <s-table-body>
        {customers.map((customer) => (
          <CustomerRow key={customer.id} customer={customer} />
        ))}
      </s-table-body>
    </s-table>
  </s-section>
);

const CustomerRow = ({ customer }) => (
  <s-table-row id={customer.id} position={customer.id}>
    <s-table-cell>
      <s-stack direction="inline" gap="small" alignItems="center">
        <s-stack gap="small-100">
          <s-text variant="bodyMd" fontWeight="semibold">
            {customer.firstName && customer.lastName
              ? `${customer.firstName} ${customer.lastName}`
              : customer.email}
          </s-text>
          {customer.firstName && customer.lastName && (
            <s-text variant="bodySm" color="subdued">
              {customer.email}
            </s-text>
          )}
        </s-stack>
      </s-stack>
    </s-table-cell>
    <s-table-cell>
      <s-text variant="bodyMd" fontWeight="semibold">
        {customer.totalPoints.toLocaleString()}
      </s-text>
    </s-table-cell>
    <s-table-cell>{customer.transactions.length}</s-table-cell>
    <s-table-cell>{new Date(customer.createdAt).toDateString()}</s-table-cell>
  </s-table-row>
);

const AddPointsForm = () => {
  const submit = useSubmit();
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    points: "",
    orderAmount: "",
  });

  const isSaving = navigation.state === "submitting";

  function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData();
    data.append("action", "add-points");
    data.append("email", formData.email);
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("points", formData.points);
    data.append("orderAmount", formData.orderAmount);

    submit(data, { method: "post" });

    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      points: "",
      orderAmount: "",
    });
  }

  return (
    <s-section heading="Add Reward Points">
      <s-box padding="400" background="subdued" borderRadius="base">
        <form onSubmit={handleSubmit}>
          <s-stack gap="base">
            <s-text-field
              label="Customer Email"
              placeholder="customer@example.com"
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              autoComplete="off"
              required
            />
            <s-stack direction="inline" gap="base">
              <s-text-field
                label="First Name"
                placeholder="John"
                name="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              <s-text-field
                label="Last Name"
                placeholder="Doe"
                name="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </s-stack>
            <s-stack direction="inline" gap="base">
              <s-text-field
                label="Points"
                type="number"
                min="1"
                name="points"
                value={formData.points}
                onChange={(e) =>
                  setFormData({ ...formData, points: e.target.value })
                }
                required
              />
              <s-text-field
                label="Order Amount (Optional)"
                type="number"
                step="0.01"
                min="0"
                name="orderAmount"
                value={formData.orderAmount}
                onChange={(e) =>
                  setFormData({ ...formData, orderAmount: e.target.value })
                }
              />
            </s-stack>
            <s-button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Adding..." : "Add Points"}
            </s-button>
          </s-stack>
        </form>
      </s-box>
    </s-section>
  );
};

export default function RewardsPage() {
  const { customers } = useLoaderData();

  return (
    <s-page heading="Customer Rewards">
      <AddPointsForm />
      {customers.length === 0 ? (
        <EmptyState />
      ) : (
        <CustomerList customers={customers} />
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
