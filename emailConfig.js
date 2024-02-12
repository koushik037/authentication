import nodemailer from 'nodemailer'

export default async(mailOption) =>{
 console.log(mailOption)
const transporter =await nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: "koushik037@gmail.com",
        pass: "lfzsgxklvphrgjhf",
    },
});

const info = await transporter.sendMail({
    from: '<koushik037@gmail.com>', // sender address
    to: `${mailOption.to}`, // list of receivers
    subject: mailOption.subject, // Subject line
    text: " link expire in 5 miniute", // plain text body
    html: mailOption.html

});

return info.messageId;
}