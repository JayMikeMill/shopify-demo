import { boundary } from "@shopify/shopify-app-react-router/server";

export default function Index() {
  return (
    <s-page heading="Graeter's Custom Shopify App Demo">
      <s-section heading="App Navigation">
        <s-unordered-list>
          <s-list-item>
            <s-link href="/app/rewards">Customer Rewards</s-link>
          </s-list-item>
          <s-list-item>
            <s-link href="/app/qrcodes">Product QR Codes</s-link>
          </s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
