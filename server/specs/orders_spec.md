# Specification: Connecting to the Toast Orders API
This document outlines the process for fetching order data from the Toast platform.

## 1. Authentication
Authentication is the first step. You must exchange your API credentials for a temporary access token.

Endpoint: https://ws.toasttab.com/usermgmt/v1/oauth/token

Method: POST

Body Type: application/x-www-form-urlencoded

Body Parameters:

grant_type: Must be the string client_credentials.

client_id: Your provided Client ID.

client_secret: Your provided Client Secret.

Success Response (200 OK):

JSON

{
  "access_token": "your_received_access_token",
  "token_type": "Bearer",
  "expires_in": 7200
}
## 2. Fetching Orders (ordersBulk)
Once authenticated, you can make requests to the primary endpoint for retrieving multiple orders.

Endpoint: https://ws.toasttab.com/orders/v2/ordersBulk

Method: GET

Required Headers:

Authorization: Bearer <your_received_access_token>

Toast-Restaurant-External-Id: The unique ID for the restaurant location.

Common Query Parameters:

startDate & endDate: Retrieves orders within a specific date range. Format: YYYY-MM-DD.

businessDate: Retrieves all orders for a single business day. Format: YYYYMMDD.

pageSize: The number of orders to return per page (e.g., 100).

page: The page number to retrieve, used for pagination.

## 3. Expected Response Data
The API returns a JSON array of Order objects. Each object is a detailed record of a transaction.

Key Fields to Expect in an Order Object:
guid: A unique identifier for the entire order. (Primary Key)

diningOption: An object indicating how the order was placed (e.g., Dine-In, Take-Out, Delivery).

createdDate: Timestamp for when the order was created.

paidDate: Timestamp for when the order was paid.

checks: An array containing one or more checks (bills) associated with the order.

guid: Unique identifier for the check.

selections: An array of menu items ordered on that check.

item: An object containing the name of the menu item (e.g., "Classic Burger").

quantity: The number of this item ordered.

unitPrice: The price of a single unit.

modifiers: An array of modifiers applied to the item (e.g., "Add Bacon", "No Onions").

payments: An array of payments made against the check.

type: The payment method (e.g., CREDIT, CASH).

amount: The value of the payment.

Example Response Snippet:
JSON

[
  {
    "guid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "diningOption": {
      "name": "Take Out"
    },
    "createdDate": "2025-10-06T18:30:00.000Z",
    "paidDate": "2025-10-06T18:35:00.000Z",
    "checks": [
      {
        "guid": "b2c3d4e5-f6a7-8901-2345-67890abcdef1",
        "selections": [
          {
            "item": { "name": "Classic Burger" },
            "quantity": 1,
            "unitPrice": 14.50,
            "modifiers": []
          },
          {
            "item": { "name": "Fries" },
            "quantity": 1,
            "unitPrice": 4.00,
            "modifiers": []
          }
        ],
        "payments": [
          {
            "type": "CREDIT",
            "amount": 18.50
          }
        ]
      }
    ]
  }
]
## 4. Connection Flow Summary
Request Token: POST your credentials to the /oauth/token endpoint.

Store Token: Securely store the received access_token.

Request Orders: Make a GET request to the /orders/v2/ordersBulk endpoint, passing the access token and restaurant ID in the headers. Include date parameters to filter the results.

Process Response: Parse the JSON array of orders returned by the API.

Handle Expiration: If you receive a 401 Unauthorized error, your token has likely expired. Repeat Step 1 to get a new token.