# Delivery & Logistics Integration Guide (Delhi NCR Express & Pan-India)

OfficeFuel is optimized for **Delhi NCR Hyperlocal/Express Delivery** (Gurgaon, Noida, South/Central/West/East/North Delhi, Faridabad, Ghaziabad) with fallback coverage for Pan-India courier shipping via Shiprocket, Delhivery, or Blowhorn.

---

## 1. Pincode Serviceability & Delivery Tiers

OfficeFuel's backend `DeliveryService` implements an instant pincode lookup engine:

| Pincode Prefix | Region | Delivery Window | Shipping Fee | Free Shipping Threshold |
|---|---|---|---|---|
| `110xxx` | Delhi (Central, South, West, North, East) | Same Day / Next Morning | ₹49 | Free above ₹499 |
| `122xxx` | Gurgaon / Gurugram | Express (4 to 8 Hours) | ₹49 | Free above ₹499 |
| `201xxx` | Noida / Greater Noida / Ghaziabad | Next Day | ₹49 | Free above ₹499 |
| `121xxx` | Faridabad | Next Day | ₹49 | Free above ₹499 |
| Other Indian Pincodes | Pan-India Express | 2–4 Business Days | ₹99 | Free above ₹999 |

---

## 2. Setting Up Shiprocket / Delhivery Courier API

To automate AWB generation, pickup generation, and live GPS tracking links:

1. Register at [Shiprocket](https://app.shiprocket.in/).
2. Generate an API User under **Settings** → **API** → **Create User**.
3. Update `backend/.env`:
   ```env
   DELIVERY_DRIVER=shiprocket
   SHIPROCKET_EMAIL=operations@officefuel.in
   SHIPROCKET_PASSWORD=your_secure_password
   SHIPROCKET_PICKUP_LOCATION=Gurgaon_Warehouse_01
   ```

---

## 3. Order Tracking URLs

When an order status changes to `dispatched` / `shipped`, the system automatically attaches a tracking URL to the customer order:
- **Delhi NCR Express Delivery**: Internal driver status tracker `https://officefuel.in/orders/{ORDER_ID}`
- **Pan-India Courier**: Live courier URL (e.g. `https://shiprocket.co/tracking/{AWB}`)
