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

- **Add Digital Cards**: Users can add multiple cards by entering card numbers and PIN codes
- **QR Code Generation**: Each card generates a QR code for in-store payments
- **Share Cards**: Users can share their card QR code with others
- **Balance Checking**: Real-time balance updates via API
- **Transaction History**: View the last 10 transactions
- **Card Management**: Delete individual cards or all cards
- **Duplicate Prevention**: The same card cannot be added multiple times
- **Custom Card Names**: Users can assign custom names to their cards
- **Local Storage**: All data is stored securely on the device

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

```json
[
  {
    "type": "Stadtgutschein",
    "description": "Gutschein mit nummer hinzufügen",
    "iconName": "gift",
    "iconColor": "#025200",
    "iconBackgroundColor": "#4DEA4B20",
    "apiConnection": {
      "endpoint": "https://api.stadtguthaben.de/widget/codeinfo/v1",
      "network": "138c3a5c-e304-49bf-8e5c-234137198089",
      "origin": "https://partner.stadtguthaben.de",
      "referer": "https://partner.stadtguthaben.de/",
      "qrEndpoint": "https://qr.stadtguthaben.de/sgh-"
    },
    "addCardScreenSettings": {
      "title": "Stadtgutschein hinzufügen",
      "description": "Gib die Daten deines Gutscheines ein",
      "inputsInformation": {
        "maxCardNumberLenght": 12,
        "maxPinLength": 3,
        "isPinVisible": true,
        "cardNumberInputTitle": "Gutscheinummer",
        "cardPinInputTitle": "PIN",
        "cardNameInputTitle": "Name der Karte (optional)",
        "cardNumberInputPlaceholder": "Gutscheinummer",
        "cardPinInputPlaceholder": "PIN",
        "cardNameInputPlaceholder": "z.B. Mein Stadtgutschein"
      }
    }
  }
]
```

#### Card Type Parameters

| Parameter                                      | Type    | Required | Description                               |
| ---------------------------------------------- | ------- | -------- | ----------------------------------------- |
| `type`                                         | String  | **Yes**  | Card type name (e.g., "Stadtgutschein")   |
| `description`                                  | String  | **Yes**  | Description of the card type              |
| `iconName`                                     | String  | **Yes**  | Icon name from tabler-icons               |
| `iconColor`                                    | String  | **Yes**  | Color of the card icon                    |
| `iconBackgroundColor`                          | String  | **Yes**  | Background color for the card icon        |
| `apiConnection`                                | Object  | **Yes**  | API connection details                    |
| `apiConnection.endpoint`                       | String  | **Yes**  | API endpoint for card validation and info |
| `apiConnection.network`                        | String  | **Yes**  | Network identifier                        |
| `apiConnection.origin`                         | String  | **Yes**  | Origin URL for API requests               |
| `apiConnection.referer`                        | String  | **Yes**  | Referer URL for API requests              |
| `apiConnection.qrEndpoint`                     | String  | **Yes**  | Base URL for QR code generation           |
| `addCardScreenSettings`                        | Object  | No       | Screen-specific settings for adding cards |
| `addCardScreenSettings.title`                  | String  | No       | Title for the add card screen             |
| `addCardScreenSettings.description`            | String  | No       | Description for the add card screen       |
| `addCardScreenSettings.inputsInformation`      | Object  | No       | Input field configurations                |
| `inputsInformation.maxCardNumberLenght`        | Number  | No       | Maximum length for card number            |
| `inputsInformation.maxPinLength`               | Number  | No       | Maximum length for PIN                    |
| `inputsInformation.isPinVisible`               | Boolean | No       | Whether PIN should be visible by default  |
| `inputsInformation.cardNumberInputTitle`       | String  | No       | Label for card number input               |
| `inputsInformation.cardPinInputTitle`          | String  | No       | Label for PIN input                       |
| `inputsInformation.cardNameInputTitle`         | String  | No       | Label for card name input                 |
| `inputsInformation.cardNumberInputPlaceholder` | String  | No       | Placeholder for card number input         |
| `inputsInformation.cardPinInputPlaceholder`    | String  | No       | Placeholder for PIN input                 |
| `inputsInformation.cardNameInputPlaceholder`   | String  | No       | Placeholder for card name input           |

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
  pinCode: string;
  type: string;
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

1. User navigates to Wallet Home Screen
2. Clicks "Add Card" button
3. Selects a card type from the available options
4. Enters card number and PIN code
5. Optionally enters a custom card name
6. App validates the card via API
7. If valid, card is saved to device storage
8. User is redirected to the card detail screen

### Viewing Card Details

1. User selects a card from Wallet Home Screen
2. Card Detail Screen displays:
   - QR code for payments
   - Card number (formatted)
   - PIN code
   - Current balance
   - Last 10 transactions
   - Action buttons (Share, Delete, Refresh Balance)

### Making a Payment

1. User displays the QR code from Card Detail Screen
2. Merchant scans the QR code
3. Payment is processed through the card provider's system

### Sharing a Card

1. User clicks the "Share" button on Card Detail Screen
2. App captures a screenshot of the QR code and card information
3. Native share dialog opens
4. User can share via any installed sharing app

### Deleting a Card

1. User clicks the "Delete" button on Card Detail Screen
2. Confirmation modal appears with balance warning
3. User confirms deletion
4. Card is removed from device storage

## API Integration

### Card Validation Endpoint

When a user adds a card, the app makes a request to validate the card:

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

- Check if card number and PIN are correct
- Verify API connection settings in card type configuration
- Check network connectivity
- Ensure card is not already added (duplicate check)

### Balance Not Updating

- Check API endpoint availability
- Verify network connection
- Try manual refresh using the refresh button

### QR Code Not Displaying

- Verify `qrEndpoint` is configured correctly
- Check card number is valid
- Ensure QR code library is properly installed

### Cards Disappeared

- Cards are stored locally only
- Check if app was reinstalled
- Verify device storage is not full
- Cards cannot be recovered if app was deleted
