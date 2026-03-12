// Logistics Quote Scenario for Entity Extraction Demo
// Based on real German logistics customer use case

export const LOGISTICS_QUOTE_SCENARIO = {
  title: "German Logistics Quote Request",
  description: "Demonstrates AI's ability to perform calculations and reasoning - extracting dimensions from product quantities",
  language: "German",
  email: `Betreff: Angebotsanfrage - Transport von Kopierpapier nach Polen

Guten Tag,

wir benötigen ein Transportangebot für eine dringende Lieferung von Büromaterial nach Warschau, Polen.

PRODUKTDETAILS:
- Artikel: A4 Kopierpapier, 80g/m²
- Menge: 2.400 Ries (Reams)
- Verpackung: Standardkartons (je 5 Ries pro Karton)

ROUTE:
- Abholung: Hamburg, Deutschland (Lager Harburger Straße 145)
- Lieferung: Warschau, Polen (Bürokomplex Marszałkowska 142)
- Gewünschter Liefertermin: innerhalb von 5 Werktagen

ZUSÄTZLICHE ANFORDERUNGEN:
- Vollständige Ladungssicherung erforderlich
- Lieferung an Laderampe (keine Entladehilfe vor Ort)
- Benötigen Frachtbrief und Lieferschein
- Zahlung auf Rechnung (30 Tage Zahlungsziel)

Bitte teilen Sie uns mit:
1. Transportkosten (netto)
2. Voraussichtliche Lieferzeit
3. Erforderliche Paletten-/Ladeflächengröße
4. Versicherungskosten

Wir freuen uns auf Ihr Angebot.

Mit freundlichen Grüßen,
Klaus Müller
Einkaufsleiter
BüroExpress GmbH
Tel: +49 40 1234 5678
Email: k.mueller@bueroexpress.de`,
  entities: [
    {
      label: "English Summary",
      definition: "A concise summary of the email content in English (2-3 sentences)"
    },
    {
      label: "Customer Name",
      definition: "Name of the person requesting the quote"
    },
    {
      label: "Customer Role",
      definition: "Job title or position of the requester"
    },
    {
      label: "Company Name",
      definition: "Name of the requesting company"
    },
    {
      label: "Product Type",
      definition: "What is being shipped (be specific)"
    },
    {
      label: "Product Quantity",
      definition: "Number of reams/units being shipped"
    },
    {
      label: "Calculated Cartons",
      definition: "How many cartons are needed (calculate from quantity and packing: 5 reams per carton)"
    },
    {
      label: "Standard Pallet Dimensions",
      definition: "Dimensions of a standard Euro pallet (120cm x 80cm)"
    },
    {
      label: "Calculated Pallet Height",
      definition: "Calculate the height of the load on a pallet. A4 paper is 21cm x 29.7cm, a ream is 500 sheets (~5cm thick), carton adds ~1cm. Calculate how many cartons fit on one pallet layer (120x80cm) and stack height for all cartons."
    },
    {
      label: "Number of Pallets Required",
      definition: "Calculate how many standard pallets are needed for the shipment (consider max pallet height ~180cm for transport)"
    },
    {
      label: "Pickup Location",
      definition: "Full pickup address"
    },
    {
      label: "Delivery Location",
      definition: "Full delivery address"
    },
    {
      label: "Delivery Deadline",
      definition: "Required delivery timeframe"
    },
    {
      label: "Special Requirements",
      definition: "Any special handling, insurance, or documentation needs"
    },
    {
      label: "Payment Terms",
      definition: "Payment conditions requested"
    }
  ]
};

export const getLogisticsScenario = () => {
  return LOGISTICS_QUOTE_SCENARIO;
};

// Made with Bob - Demonstrates AI reasoning and calculation capabilities