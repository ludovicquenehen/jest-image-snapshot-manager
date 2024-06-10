import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Mailgen from "mailgen";

dotenv.config(); // configure our app to use env variables
const app = express();
/** middlewares */
app.use(express.json());
app.use(cors());
app.disable("x-powered-by"); // less hackers know about our stack

const port = process.env.PORT || 8080;
/** HTTP GET Request */
app.get("/", (req, res) => {
  res.status(201).json("Health Check PASS");
});

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTPPORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});
// define a route for sending emails
app.post("/send", (req, res) => {
  // get the recipient's email address, name and message from the request body
  const { subject, to, intro, message, outro, sender, action, link } = req.body;

  // generate email body using Mailgen
  const MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: sender,
      link: "https://mailgen.js/",
    },
  });

  // body of the email
  const email = {
    body: {
      intro,
      outro,
    },
  };

  if (action) {
    email.body.action = {
      instructions: action,
      button: {
        color: "#963484",
        text: "Confirm your account",
        link,
      },
    };
  }

  const emailBody = MailGenerator.generate(email);
  // send mail with defined transport object
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to,
    subject,
    html: emailBody,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent: " + info.response);
      res.send("Email sent successfully");
    }
  });
});
// start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
