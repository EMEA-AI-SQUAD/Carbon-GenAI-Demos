export const DEFAULTS = {
  free_form_text: `The name of our next book is The Hunger Games. Now, some of you might have read this book earlier, but in
my personal opinion, reading it again won't hurt, right? It gets even more interesting when we read it a second time.
So, the author of this book is Suzanne Collins, who wrote many books in the past, but this particular book for her
has got a rating of 4.33/5, which I think is a pretty good number considering what we just saw for The Book Thief.
Anyways, this book is a work of fiction, written in English and falls in the Post Apocalyptic genre. This book has 374 pages.
It was published on the 10th of October, 2005. This book is priced at 5 dollars and 9 cents. If anyone is interested in this book,
you can approach Mr Hofstadter after this workshop, he will be glad to sell you this book for only 3 dollars.
Dont miss out this chance to grab such a memorable book.`,
  entities: [
    { label: "Title",  definition: "This is the title of the book." },
    { label: "Author", definition: "This is author of the book. The one who wrote this book." },
    { label: "Price",  definition: "This is the price of the book." },
    { label: "Rating", definition: "This is the rating given for this particular book." },
    { label: "",       definition: "" } // optional spare row for the UI
  ]
};
