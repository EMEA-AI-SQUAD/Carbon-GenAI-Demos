export const DEFAULTS = {
  free_form_text: `Hi, my name is Sarah Johnson and I'm reaching out regarding my recent order. 
My email address is sarah.johnson@email.com and you can reach me at +1-555-0123. 
I live at 123 Main Street, Apartment 4B, New York, NY 10001. 
My date of birth is March 15, 1985, and my social security number is 123-45-6789. 
I'd like to update my credit card on file - it's a Visa ending in 4532, expiring 12/2025.
My customer ID is CUST-2024-789456. Please contact me as soon as possible.`,
  entities: [
    { label: "Full Name", definition: "The complete name of the person" },
    { label: "Email Address", definition: "The email contact information" },
    { label: "Phone Number", definition: "The telephone contact number" },
    { label: "Street Address", definition: "The complete physical mailing address" },
    { label: "Date of Birth", definition: "The person's birth date" },
    { label: "", definition: "" } // optional spare row for the UI
  ]
};

// Made with Bob
