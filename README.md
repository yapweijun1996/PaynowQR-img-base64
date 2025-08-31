# PayNow QR Code Generator

This project generates PayNow-compatible QR codes using HTML div elements with data attributes and JavaScript. It leverages the PaynowQR library to create QR payloads and the QRCode library to render them as images.

## Overview

The system works by:
1. Scanning the DOM for elements with class `paynowQrSlot`.
2. Extracting configuration from data attributes.
3. Generating a PayNow QR payload using the PaynowQR library.
4. Rendering the QR code to a canvas using QRCode.js.
5. Optionally embedding a logo in the center.
6. Replacing the div content with an img element displaying the QR code.
7. Marking the element as processed to prevent re-rendering.

## Usage

1. Include the script `js/paynowqr_img_base64.js` in your HTML.
2. Add div elements with class `paynowQrSlot` and required data attributes.
3. The script automatically processes these elements on load.

Example:
```html
<div class="paynowQrSlot"
     data-uen="201403121W"
     data-amount="1.11"
     data-editable="true"
     data-expiry="20991231"
     data-refnumber="INV-001"
     data-company="Company A"
     data-displaypx="50"
     data-dark="#79207a"
     data-light="#ffffff"
     data-margin="1"
     data-qrpx="500"
     data-logo="">
</div>
```

## Data Attributes

### Required Attributes

- **`data-uen`** (string): Unique Entity Number of the recipient.  
  **Logic**: Used directly in PayNow payload.  
  **Default**: None (required).  
  **Max Length/Limitation**: 9-10 characters (standard Singapore UEN format).

- **`data-expiry`** (string): Expiry date in YYYYMMDD format.  
  **Logic**: Used directly in PayNow payload.  
  **Default**: None (required).  
  **Max Length/Limitation**: 8 characters (YYYYMMDD).

- **`data-refnumber`** (string): Reference number for the transaction.  
  **Logic**: Used directly in PayNow payload.  
  **Default**: None (required).  
  **Max Length/Limitation**: Up to 25 characters.

- **`data-company`** (string): Company name of the recipient.  
  **Logic**: Used directly in PayNow payload.  
  **Default**: None (required).  
  **Max Length/Limitation**: Up to 25 characters.

- **`data-amount`** (number): Transaction amount.  
  **Logic**: Parsed as float; required unless `data-editable="true"`.  
  **Default**: None (required unless editable).  
  **Max Length/Limitation**: Up to 2 decimal places; max value ~999999.99 (limited by QR size).

### Optional Attributes

- **`data-editable`** (boolean): Whether the amount is editable in the QR.  
  **Logic**: If true, amount is optional; converted to boolean.  
  **Default**: false.  
  **Max Length/Limitation**: "true" or "false".

- **`data-displaypx`** (number): Display size of the QR image in pixels.  
  **Logic**: Sets img width/height.  
  **Default**: 50.  
  **Max Length/Limitation**: Positive integer; affects visual size only.

- **`data-dark`** (string): Color for dark QR modules (hex code).  
  **Logic**: Passed to QRCode.toCanvas.  
  **Default**: #79207a.  
  **Max Length/Limitation**: Valid hex color (e.g., #000000).

- **`data-light`** (string): Color for light QR modules (hex code).  
  **Logic**: Passed to QRCode.toCanvas.  
  **Default**: #ffffff.  
  **Max Length/Limitation**: Valid hex color (e.g., #ffffff).

- **`data-margin`** (number): Margin around QR code in modules.  
  **Logic**: Passed to QRCode.toCanvas.  
  **Default**: 1.  
  **Max Length/Limitation**: 0-4 (QR standard).

- **`data-qrpx`** (number): Pixel size of the QR canvas.  
  **Logic**: Sets canvas width/height.  
  **Default**: 500.  
  **Max Length/Limitation**: Positive integer; higher values increase detail but file size.

- **`data-logo`** (string): Logo image URL or base64.  
  **Logic**: If empty string, uses default logo; loads and draws on canvas center.  
  **Default**: window.paynowLogoBase64 or null.  
  **Max Length/Limitation**: Valid URL or base64 string; image must load successfully.

- **`data-logoscale`** (number): Scale factor for logo size relative to QR.  
  **Logic**: Logo width/height = qrPx * logoscale.  
  **Default**: 0.25.  
  **Max Length/Limitation**: 0.1-0.5 (too large may obscure QR).

- **`data-padscale`** (number): Padding scale for logo background.  
  **Logic**: Background square = logo size + qrPx * padscale.  
  **Default**: 0.04.  
  **Max Length/Limitation**: 0.01-0.1.

## Limitations

- QR codes are generated with error correction level 'H' for reliability.
- Logo embedding requires CORS-enabled images or base64.
- Large QR sizes may impact performance.
- PayNow payload size limits overall data; excessive lengths may fail.
- Script loads external libraries (PaynowQR and QRCode) asynchronously.
- Elements are processed once unless `rerender` option is set.

## Dependencies

- PaynowQR library (js/paynowqr.min.js)
- QRCode.js library (js/qrcode.min.js)