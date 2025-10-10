import { Resend } from "resend";
import Welcome from "transactional-emails/emails/welcome";

const client = new Resend(process.env.RESEND_API_KEY);

export const loader = async()=>{
    const {data,error} = await client.emails.send({
        from : "Supaplate <nico@codebridge.codes>",
        to : "garethgates88@gmail.com",
        subject : "Welcome to Supaplate",
        react : <Welcome profile={ "test"} />
    });

    return Response.json({data,error});
}