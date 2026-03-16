export const DEFAULTS = {
  free_form_text: `Hello, I am Sophie Müller. I am writing to you to report an unauthorised transaction on my credit card. On 30th March 2023, I noticed a charge of €1,200 on my credit card statement that I did not authorise. The transaction was made at a restaurant in Paris, whilst I was in Berlin on that day. I am concerned about the security of my account and I would appreciate if you could investigate this matter promptly. Please contact me at my phone number +49 30 12345678 or email me at sophie.mueller@email.de to provide me with an update on the investigation. My card number is 5425233430109903. I look forward to hearing from you soon.`,
  entities: [
    { label: "Person Name", definition: "The full name of the person submitting the complaint" },
    { label: "Email Address", definition: "The email contact information" },
    { label: "Phone Number", definition: "The telephone contact number including country code" },
    { label: "Credit Card Number", definition: "The credit card number mentioned in the complaint" },
    { label: "Transaction Amount", definition: "The amount of the unauthorised transaction in euros" },
    { label: "Transaction Location", definition: "The location where the unauthorised transaction occurred" },
    { label: "Transaction Date", definition: "The date when the unauthorised transaction occurred" },
    { label: "Person Location", definition: "Where the person was located at the time of the transaction" },
    { label: "", definition: "" } // optional spare row for the UI
  ]
};

// Made with Bob
