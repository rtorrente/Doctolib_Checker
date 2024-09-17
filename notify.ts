import {Pushover} from 'pushover-js'
import nodemailer from "nodemailer"


export const notify = async (subject: string, message: string) => {
    try{
        if(process.env.PUSHOVER_USER && process.env.PUSHOVER_TOKEN){
            const pushover = new Pushover(process.env.PUSHOVER_USER!, process.env.PUSHOVER_TOKEN!)
            await pushover.send(subject, message)
        }
        if(process.env.EMAIL_SERVER && process.env.EMAIL_FROM && process.env.EMAIL_TO){
            const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: process.env.EMAIL_TO,
                subject: subject,
                text: message,
            };
            await transporter.sendMail(mailOptions)
        }
    }
    catch (e){
        console.error(e);
    }
}