import {
  BaseLinkerInventory,
  BaseLinkerOrder,
  BaseLinkerOrderStatus,
  BaseLinkerProductData,
  BaseLinkerProductListItem,
} from "@/types/baselinker";

export const mockInventories: BaseLinkerInventory[] = [
  {
    inventory_id: 101,
    name: "Główny Magazyn Sklepu",
    description: "Katalog główny e-commerce",
    languages: ["pl"],
    default_language: "pl",
    price_groups: [1],
    default_price_group: 1,
    warehouses: ["wh_main", "wh_remote"],
    default_warehouse: "wh_main",
    is_default: true,
  },
];

export const mockStatuses: BaseLinkerOrderStatus[] = [
  { id: 8001, name: "Nowe - nieopłacone", color: "#3498db" },
  { id: 8002, name: "Do pakowania", color: "#f39c12" },
  { id: 8003, name: "W trakcie realizacji", color: "#e67e22" },
  { id: 8004, name: "Wysłane", color: "#2ecc71" },
  { id: 8005, name: "Zrealizowane", color: "#27ae60" },
  { id: 8006, name: "Anulowane", color: "#e74c3c" },
];

export const mockProductsList: BaseLinkerProductListItem[] = [
  {
    id: 1001,
    sku: "ELEC-HEADPHONE-01",
    ean: "5901234123457", // Valid EAN-13
    name: "Słuchawki Bezprzewodowe Pro",
    quantity: 15,
    price_brutto: 199.99,
  },
  {
    id: 1002,
    sku: "", // Issue: Missing SKU
    ean: "5901234123464",
    name: "Kabel USB-C 2m Oplot",
    quantity: 40,
    price_brutto: 29.99,
  },
  {
    id: 1003,
    sku: "ELEC-HEADPHONE-01", // Issue: Duplicate SKU with #1001!
    ean: "5901234123457", // Issue: Duplicate EAN with #1001!
    name: "Słuchawki Bezprzewodowe Pro (Czarny)",
    quantity: 5,
    price_brutto: 199.99,
  },
  {
    id: 1004,
    sku: "CASE-IPHONE-15",
    ean: "123INVALID", // Issue: Invalid EAN
    name: "Etui Silikonowe iPhone 15",
    quantity: -3, // Issue: Negative stock!
    price_brutto: 0, // Issue: 0 PLN price!
  },
  {
    id: 1005,
    sku: "CHARGER-GAN-65W",
    ean: "", // Issue: Missing EAN
    name: "Ładowarka Sieciowa GaN 65W",
    quantity: 0, // Issue: 0 stock notice
    price_brutto: 129.0,
  },
  {
    id: 1006,
    sku: "DESK-MAT-XL",
    ean: "5909876543210",
    name: "Podkładka na biurko XL",
    quantity: 10,
    price_brutto: 79.99,
  },
];

export const mockProductsDataMap: Record<string, BaseLinkerProductData> = {
  "1001": {
    is_bundle: false,
    ean: "5901234123457",
    sku: "ELEC-HEADPHONE-01",
    tax_rate: 23,
    weight: 0.35,
    height: 10,
    width: 15,
    length: 20,
    star: 5,
    category_id: 10,
    producer_id: 2,
    prices: { "1": 199.99 },
    stock: { wh_main: 10, wh_remote: 5 },
    text_fields: {
      name: "Słuchawki Bezprzewodowe Pro",
      description: "Wysokiej jakości słuchawki bezprzewodowe z redukcją szumów ANC.",
    },
    images: {
      "1": "https://img.example.com/headphones-1.jpg",
    },
  },
  "1002": {
    is_bundle: false,
    ean: "5901234123464",
    sku: "",
    tax_rate: 23,
    weight: 0, // Issue: 0 kg weight!
    height: 2,
    width: 5,
    length: 10,
    star: 0,
    category_id: 10,
    producer_id: 1,
    prices: { "1": 29.99 },
    stock: { wh_main: 40 },
    text_fields: { name: "Kabel USB-C 2m Oplot" },
    images: {}, // Issue: Missing images!
  },
  "1004": {
    is_bundle: false,
    ean: "123INVALID",
    sku: "CASE-IPHONE-15",
    tax_rate: -1, // Issue: Invalid tax rate
    weight: 0.05,
    height: 1,
    width: 8,
    length: 15,
    star: 0,
    category_id: 12,
    producer_id: 3,
    prices: { "1": 0 },
    stock: { wh_main: -3 },
    text_fields: { name: "Etui Silikonowe iPhone 15" },
    images: { "1": "https://img.example.com/case.jpg" },
  },
  "1006": {
    is_bundle: false,
    ean: "5909876543210",
    sku: "DESK-MAT-XL",
    tax_rate: 23,
    weight: 0.6,
    height: 5,
    width: 40,
    length: 90,
    star: 0,
    category_id: 15,
    producer_id: 4,
    prices: { "1": 79.99 },
    stock: { wh_main: 4, wh_remote: 3 }, // Sum is 7, but totalQuantity is 10! Issue: warehouse desync!
    text_fields: { name: "Podkładka na biurko XL" },
    images: { "1": "https://img.example.com/mat.jpg" },
  },
};

const NOW_SEC = Math.floor(Date.now() / 1000);

export const mockOrders: BaseLinkerOrder[] = [
  // Order 1: Healthy completed order with tracking
  {
    order_id: 5001,
    order_source: "allegro",
    order_source_id: 1,
    order_status_id: 8004, // Wysłane
    date_add: NOW_SEC - 86400 * 2, // 2 days ago
    date_confirmed: NOW_SEC - 86400 * 2,
    confirmed: true,
    currency: "PLN",
    payment_method: "PayU",
    payment_method_cod: false,
    payment_done: 199.99 + 14.99,
    delivery_method: "Paczkomaty InPost",
    delivery_price: 14.99,
    delivery_package_module: "inpost",
    delivery_package_nr: "620100012345678901234567",
    delivery_fullname: "Jan Kowalski",
    products: [
      {
        product_id: "1001",
        variant_id: 0,
        name: "Słuchawki Bezprzewodowe Pro",
        sku: "ELEC-HEADPHONE-01",
        ean: "5901234123457",
        price_brutto: 199.99,
        tax_rate: 23,
        quantity: 1,
        weight: 0.35,
      },
    ],
  },
  // Order 2: Stuck in processing for 16 days! (CRITICAL)
  {
    order_id: 5002,
    order_source: "shop",
    order_source_id: 2,
    order_status_id: 8003, // W trakcie realizacji
    date_add: NOW_SEC - 86400 * 16, // 16 days ago
    date_confirmed: NOW_SEC - 86400 * 16,
    confirmed: true,
    currency: "PLN",
    payment_method: "Przelewy24",
    payment_method_cod: false,
    payment_done: 59.98,
    delivery_method: "Kurier DPD",
    delivery_price: 15.0,
    delivery_fullname: "Anna Nowak",
    products: [
      {
        product_id: "1002",
        variant_id: 0,
        name: "Kabel USB-C 2m Oplot",
        sku: "KABEL-01",
        ean: "5901234123464",
        price_brutto: 29.99,
        tax_rate: 23,
        quantity: 2,
        weight: 0.1,
      },
    ],
  },
  // Order 3: Shipped status, but missing tracking number! (CRITICAL)
  {
    order_id: 5003,
    order_source: "allegro",
    order_source_id: 1,
    order_status_id: 8004, // Wysłane
    date_add: NOW_SEC - 86400 * 4,
    date_confirmed: NOW_SEC - 86400 * 4,
    confirmed: true,
    currency: "PLN",
    payment_method: "Allegro Finanse",
    payment_method_cod: false,
    payment_done: 149.0,
    delivery_method: "Kurier DHL",
    delivery_price: 19.0,
    delivery_package_module: "dhl",
    delivery_package_nr: "", // Missing tracking number!
    delivery_fullname: "Piotr Wiśniewski",
    products: [
      {
        product_id: "1005",
        variant_id: 0,
        name: "Ładowarka Sieciowa GaN 65W",
        sku: "CHARGER-GAN-65W",
        ean: "5901234123499",
        price_brutto: 130.0,
        tax_rate: 23,
        quantity: 1,
        weight: 0.2,
      },
    ],
  },
  // Order 4: Shipped without payment! (CRITICAL - financial leak)
  {
    order_id: 5004,
    order_source: "shop",
    order_source_id: 2,
    order_status_id: 8005, // Zrealizowane
    date_add: NOW_SEC - 86400 * 5,
    date_confirmed: NOW_SEC - 86400 * 5,
    confirmed: true,
    currency: "PLN",
    payment_method: "Przelew tradycyjny",
    payment_method_cod: false, // NOT COD
    payment_done: 0, // Unpaid!
    delivery_method: "InPost Paczkomat",
    delivery_price: 12.0,
    delivery_package_nr: "620100099999999999999999",
    delivery_fullname: "Marek Ziółkowski",
    products: [
      {
        product_id: "1006",
        variant_id: 0,
        name: "Podkładka na biurko XL",
        sku: "DESK-MAT-XL",
        ean: "5909876543210",
        price_brutto: 79.99,
        tax_rate: 23,
        quantity: 1,
        weight: 0.6,
      },
    ],
  },
  // Order 5: Paid 3 days ago, still unshipped (WARNING)
  {
    order_id: 5005,
    order_source: "allegro",
    order_source_id: 1,
    order_status_id: 8002, // Do pakowania
    date_add: NOW_SEC - 86400 * 4, // 4 days ago
    date_confirmed: NOW_SEC - 86400 * 4,
    confirmed: true,
    currency: "PLN",
    payment_method: "Blik",
    payment_method_cod: false,
    payment_done: 100.0,
    delivery_method: "Paczkomat",
    delivery_price: 10.0,
    delivery_fullname: "Karolina Maj",
    products: [
      {
        product_id: "1006",
        variant_id: 0,
        name: "Podkładka na biurko XL",
        sku: "DESK-MAT-XL",
        ean: "5909876543210",
        price_brutto: 90.0,
        tax_rate: 23,
        quantity: 1,
        weight: 0.6,
      },
    ],
  },
  // Order 6: Underpaid (WARNING)
  {
    order_id: 5006,
    order_source: "shop",
    order_source_id: 2,
    order_status_id: 8001, // Nowe
    date_add: NOW_SEC - 86400 * 1,
    date_confirmed: NOW_SEC - 86400 * 1,
    confirmed: true,
    currency: "PLN",
    payment_method: "Przelew tradycyjny",
    payment_method_cod: false,
    payment_done: 50.0, // Order total is 90 + 10 = 100 PLN! Missing 50 PLN
    delivery_method: "Kurier",
    delivery_price: 10.0,
    delivery_fullname: "Tomasz Dąbrowski",
    products: [
      {
        product_id: "1006",
        variant_id: 0,
        name: "Podkładka na biurko XL",
        sku: "DESK-MAT-XL",
        ean: "5909876543210",
        price_brutto: 90.0,
        tax_rate: 23,
        quantity: 1,
        weight: 0.6,
      },
    ],
  },
];
