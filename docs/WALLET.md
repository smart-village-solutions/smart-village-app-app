# Wallet Module Documentation

The Wallet module allows users to store and manage digital cards (e.g., city vouchers, gift cards) directly on their device. Users can view card details, make purchases using QR codes, share cards, and track their last 10 transactions.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Configuration](#configuration)
  - [Global Settings](#global-settings)
  - [Card Types Configuration](#card-types-configuration)
- [Data Storage](#data-storage)
- [User Workflow](#user-workflow)
- [API Integration](#api-integration)
- [Security Considerations](#security-considerations)

## Overview

The Wallet module provides a secure way to store digital payment cards locally on the user's device. All card data is stored using secure storage mechanisms and is never transmitted to the app operator. Cards are validated through external APIs before being saved.

## Features

- **Add Digital Cards**: Users can add multiple types of cards (coupons, bonus cards) by entering card numbers and PIN codes
- **Barcode Scanner**: Scan barcodes to automatically fill card number field
- **QR Code Generation**: Each card generates a QR code for in-store payments
- **Share Cards**: Users can share their card QR code with others
- **Balance Checking**: Real-time balance updates via API (for coupon type cards)
- **Transaction History**: View the last 10 transactions (for coupon type cards)
- **Card Management**: Delete individual cards or all cards
- **Duplicate Prevention**: The same card cannot be added multiple times
- **Custom Card Names**: Users can assign custom names to their cards
- **Local Storage**: All data is stored securely on the device
- **Multiple Card Types**: Support for different card types (coupon, bonus) with different validation flows

## Configuration

To activate the Wallet module, two configurations must be set up in the main server:

### Global Settings

Add a `wallet` object to the `settings` object within `globalSettings`:

```json
{
  "wallet": {
    "homeIconBackgroundColor": "#0F461810",
    "homeIcon": "wallet",
    "iconColor": "#107821",
    "title": "Deine digitalen Karten",
    "description": "Füge deine erste Karte hinzu und habe alle wichtigen Dokumente immer dabei",
    "buttonText": "Karte hinzufügen",
    "infoText": "<h2 style='color: #008000;'>Wichtiger Hinweis zum Datenschutz</h2><p>Deine Karten werden sicher auf dem lokalen Gerät gespeichert. Es findet keine Übertragung an den Appbetreiber statt.</p><p><strong>Achtung: Wenn du die App löschst, werden auch deine Karten unwiderruflich entfernt.</strong></p>",
    "infoIcon": "info-circle"
  }
}
```

#### Global Settings Parameters

| Parameter                 | Type   | Required | Description                                                                                |
| ------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------ |
| `homeIconBackgroundColor` | String | No       | Background color for the wallet icon on home screen (default: `colors.lighterPrimaryRgba`) |
| `homeIcon`                | String | No       | Icon name for the wallet module (default: `"wallet"`)                                      |
| `iconColor`               | String | No       | Color of the wallet icon (default: `colors.primary`)                                       |
| `title`                   | String | No       | Title displayed on the wallet home screen (default: `texts.wallet.home.title`)             |
| `description`             | String | No       | Description text on the wallet home screen (default: `texts.wallet.home.description`)      |
| `buttonText`              | String | No       | Text for the "Add Card" button (default: `texts.wallet.home.buttonText`)                   |
| `infoText`                | String | No       | HTML content for the information/privacy notice (default: `texts.wallet.home.infoText`)    |
| `infoIcon`                | String | No       | Icon name for the info section (default: `"info-circle"`)                                  |

### Card Types Configuration

Create a static content with the name `walletCardTypes` in JSON format. This defines the available card types and their configurations.

The module supports two card types:

- **`coupon`**: Requires API validation, supports balance checking and transactions
- **`bonus`**: No API validation, simpler workflow without PIN

```json
[
  {
    "type": "bonus",
    "title": "Bonus Card Title",
    "description": "Description for bonus card",
    "iconName": "credit-card",
    "iconColor": "#000000",
    "iconBackgroundColor": "#00000020",
    "apiConnection": {
      "qrEndpoint": ""
    },
    "addCardScreenSettings": {
      "title": "Add Bonus Card",
      "description": "Enter your bonus card details",
      "inputsInformation": {
        "cardNumberLenght": 12,
        "cardNumberInputTitle": "Card Number",
        "cardNameInputTitle": "Card Name (optional)",
        "cardNumberInputPlaceholder": "Card Number",
        "cardNameInputPlaceholder": "e.g. My Bonus Card"
      }
    }
  },
  {
    "type": "coupon",
    "title": "Coupon Card Title",
    "description": "Description for coupon card",
    "iconName": "gift",
    "iconColor": "#000000",
    "iconBackgroundColor": "#00000020",
    "apiConnection": {
      "endpoint": "https://api.example.com/validate",
      "network": "your-network-id",
      "origin": "https://example.com",
      "referer": "https://example.com/",
      "qrEndpoint": "https://qr.example.com/"
    },
    "addCardScreenSettings": {
      "title": "Add Coupon Card",
      "description": "Enter your coupon card details",
      "inputsInformation": {
        "cardNumberLenght": 12,
        "pinLength": 3,
        "cardNumberInputTitle": "Card Number",
        "cardPinInputTitle": "PIN",
        "cardNameInputTitle": "Card Name (optional)",
        "cardNumberInputPlaceholder": "Card Number",
        "cardPinInputPlaceholder": "PIN",
        "cardNameInputPlaceholder": "e.g. My Coupon Card"
      }
    }
  }
]
```

#### Card Type Parameters

| Parameter                                      | Type   | Required | Description                                                                   |
| ---------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------- |
| `type`                                         | String | **Yes**  | Card type identifier: `"coupon"` or `"bonus"` (used for validation logic)     |
| `title`                                        | String | **Yes**  | Display title of the card type (shown in card lists)                          |
| `description`                                  | String | **Yes**  | Description of the card type                                                  |
| `iconName`                                     | String | **Yes**  | Icon name from tabler-icons                                                   |
| `iconColor`                                    | String | **Yes**  | Color of the card icon                                                        |
| `iconBackgroundColor`                          | String | **Yes**  | Background color for the card icon                                            |
| `apiConnection`                                | Object | **Yes**  | API connection details                                                        |
| `apiConnection.endpoint`                       | String | No       | API endpoint for card validation (required only for `type: "coupon"`)         |
| `apiConnection.network`                        | String | No       | Network identifier (required only for `type: "coupon"`)                       |
| `apiConnection.origin`                         | String | No       | Origin URL for API requests (required only for `type: "coupon"`)              |
| `apiConnection.referer`                        | String | No       | Referer URL for API requests (required only for `type: "coupon"`)             |
| `apiConnection.qrEndpoint`                     | String | **Yes**  | Base URL for QR code generation (can be empty string for bonus cards)         |
| `addCardScreenSettings`                        | Object | No       | Screen-specific settings for adding cards                                     |
| `addCardScreenSettings.title`                  | String | No       | Title for the add card screen                                                 |
| `addCardScreenSettings.description`            | String | No       | Description for the add card screen                                           |
| `addCardScreenSettings.inputsInformation`      | Object | No       | Input field configurations                                                    |
| `inputsInformation.cardNumberLenght`           | Number | No       | Exact length for card number (renamed from `maxCardNumberLength`)             |
| `inputsInformation.pinLength`                  | Number | No       | Exact length for PIN (only for `type: "coupon"`, renamed from `maxPinLength`) |
| `inputsInformation.cardNumberInputTitle`       | String | No       | Label for card number input                                                   |
| `inputsInformation.cardPinInputTitle`          | String | No       | Label for PIN input (only for `type: "coupon"`)                               |
| `inputsInformation.cardNameInputTitle`         | String | No       | Label for card name input                                                     |
| `inputsInformation.cardNumberInputPlaceholder` | String | No       | Placeholder for card number input                                             |
| `inputsInformation.cardPinInputPlaceholder`    | String | No       | Placeholder for PIN input (only for `type: "coupon"`)                         |
| `inputsInformation.cardNameInputPlaceholder`   | String | No       | Placeholder for card name input                                               |

**Important Notes:**

- The `type` field determines the card behavior:
  - `"coupon"`: Requires PIN, validates via API, shows balance and transactions
  - `"bonus"`: No PIN required, no API validation, simpler workflow
- `cardNumberLenght` and `pinLength` define exact lengths (not maximum)
- For bonus cards, `apiConnection.endpoint`, `network`, `origin`, and `referer` are not required

## Data Storage

All card data is stored locally on the user's device using Expo SecureStore (`expo-secure-store`), which provides encrypted storage.

### Stored Card Data Structure

```typescript
type TCard = {
  apiConnection: TApiConnection;
  cardName?: string;
  cardNumber: string;
  description?: string;
  iconBackgroundColor: string;
  iconColor: string;
  iconName: string;
  pinCode?: string; // Optional - only required for coupon type cards
  title: string;
  type: string; // "coupon" or "bonus"
};
```

### Storage Helpers

The wallet module provides the following helper functions for card management:

- `getSavedCards()`: Retrieve all saved cards
- `saveCard(card)`: Save a new card (validates for duplicates)
- `deleteCardByNumber(cardNumber)`: Delete a specific card
- `deleteAllCards()`: Delete all cards from storage

## User Workflow

### Adding a Card

#### Standard Flow

1. User navigates to Wallet Home Screen
2. Clicks "Add Card" button
3. Selects a card type from the available options
4. Enters card number manually or uses barcode scanner
5. For coupon type: Enters PIN code (hidden by default)
6. For bonus type: No PIN required
7. Optionally enters a custom card name
8. For coupon type: App validates the card via API
9. For bonus type: No API validation
10. If valid (or no validation required), card is saved to device storage
11. User is navigated back to Wallet Home Screen

#### Barcode Scanner Flow

1. User clicks "Scan Barcode" button on Add Card screen
2. Camera scanner opens
3. User scans barcode
4. Card number field is automatically filled with scanned data
5. User continues with standard flow from step 5

### Viewing Card Details

1. User selects a card from Wallet Home Screen
2. Card Detail Screen displays:
   - QR code for payments (if `qrEndpoint` is configured)
   - Card number (formatted)
   - PIN code (for coupon type cards, with show/hide toggle)
   - Current balance (for coupon type cards)
   - Last 10 transactions (for coupon type cards)
   - Action buttons (Share, Delete)
   - Refresh Balance button (for coupon type cards only)

**Note:** Bonus cards show a simplified view without balance, transactions, or refresh functionality.

### Making a Payment

1. User displays the QR code from Card Detail Screen
2. Merchant scans the QR code
3. Payment is processed through the card provider's system

### Sharing a Card

1. User clicks the "Share" button on Card Detail Screen
2. App captures a screenshot of the QR code and card information (including PIN if available)
3. Image is saved to cache directory and converted to shareable format
4. Native share dialog opens
5. User can share via any installed sharing app

**Note:** The shared image includes the QR code, card number, and PIN (if applicable) for easy sharing with others.

### Deleting a Card

1. User clicks the "Delete" button on Card Detail Screen
2. Confirmation modal appears
   - For coupon cards: Shows balance warning if balance exists
   - For bonus cards: Shows standard confirmation
3. User confirms deletion
4. Card is removed from device storage
5. User is navigated back to Wallet Home Screen

## API Integration

### Card Validation Endpoint

**Note:** API validation is only performed for cards with `type: "coupon"`. Bonus cards skip this validation step.

When a user adds a coupon card, the app makes a request to validate the card:

**Request:**

```javascript
POST {apiConnection.endpoint}
Headers:
  - network: {apiConnection.network}
  - origin: {apiConnection.origin}
  - referer: {apiConnection.referer}

Body:
{
  "code": "{cardNumber}",
  "pin": "{pinCode}"
}
```

**Response (Success):**

```json
{
  "balanceAsCent": 1000,
  "balanceAsEuro": "10.00",
  "code": "1234567890123456",
  "codeFormated": "1234-5678-9012-3456",
  "expiringCreditAsEuro": "0.00",
  "expiringCreditTimeNice": "",
  "transactions": [
    {
      "dealerName": "Store Name",
      "timeNice": "01.01.2025 12:00",
      "type": 200,
      "valueAsEuro": "5.00"
    }
  ]
}
```

**Response (Error):**

- Invalid card: HTTP 400 or error response
- Network error: Connection failed

### Transaction Types

- `type: 100` - Credit transaction (displayed with `+` sign in green)
- `type: 200` - Debit transaction (displayed with `-` sign in red)

## Security Considerations

### Local Storage Only

- **No Server Storage**: Card data is NEVER sent to or stored on the app operator's servers
- **Device-Only**: All cards are stored exclusively on the user's device
- **Permanent Deletion**: If the app is uninstalled, all cards are permanently deleted

### Secure Storage

- Uses Expo SecureStore for encrypted storage
- Card numbers and PINs are stored securely
- No plaintext storage of sensitive data

### API Security

- API requests include proper headers (origin, referer, network)
- Card validation happens before storage
- Failed validation prevents card from being saved

### Duplicate Prevention

- Cards are identified by `cardNumber`
- Duplicate cards cannot be added
- Users can add multiple different cards

### User Privacy Warnings

Users are informed through the info text that:

- Cards are stored locally only
- No data transmission to app operator
- Cards will be lost if app is deleted
- Users should keep backup of important card information

## Default Values

The following default values are used when configuration is not provided:

### Wallet Home Screen

- `homeIcon`: `"wallet"`
- `homeIconBackgroundColor`: `colors.lighterPrimaryRgba`
- `iconColor`: `colors.primary`
- `title`: `texts.wallet.home.title`
- `description`: `texts.wallet.home.description`
- `buttonText`: `texts.wallet.home.buttonText`
- `infoText`: `texts.wallet.home.infoText`
- `infoIcon`: `"info-circle"`

### Add Card Screen

- Error messages from `texts.wallet.add.inputs.errors`
- Input labels from `texts.wallet.add.inputs`
- Alert messages from `texts.wallet.alert`

### Card Detail Screen

- UI text from `texts.wallet.detail`
- Action button labels
- Transaction list header

## Troubleshooting

### Card Won't Add

- **For coupon cards:**
  - Check if card number and PIN are correct
  - Verify API connection settings in card type configuration
  - Check network connectivity
  - Ensure API endpoint is accessible
- **For all cards:**
  - Ensure card is not already added (duplicate check)
  - Verify card number matches the required length in configuration
  - For coupon cards: Verify PIN matches the required length

### Barcode Scanner Issues

- Ensure camera permissions are granted
- Check if barcode is clear and well-lit
- Try manual entry if scanner fails
- Verify barcode format matches expected card number format

### Balance Not Updating (Coupon Cards Only)

- Check API endpoint availability
- Verify network connection
- Try manual refresh using the refresh button
- Ensure API credentials (network, origin, referer) are correct

**Note:** Bonus cards do not support balance checking.

### QR Code Not Displaying

- Verify `qrEndpoint` is configured correctly
- Check card number is valid
- Ensure QR code library is properly installed

### Cards Disappeared

- Cards are stored locally only
- Check if app was reinstalled
- Verify device storage is not full
- Cards cannot be recovered if app was deleted
