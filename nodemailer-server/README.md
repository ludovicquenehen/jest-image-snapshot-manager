# Nodemailer server

This project is a `nodemailer` wrapper with a uniq `POST` endpoint (`/send`) which take these arguments:
-   `to`: Recipient of the email
-   `subject`: Subject of the email
-   `intro`: Header of the message
-   `outro`: Footer of the message
-   `sender`: sender signature
-   `action`: add action button between `intro` and `outro`
-   `link`: link of the action button

# Start
```bash
npm run start
```