// import { Resend } from "resend";
// import { WelcomeUser } from "react-email-starter/emails/welcome-user";
// import type { Route } from ".react-router/types/app/features/home/screens/+types/welcome.ts";


// const client = new Resend(process.env.RESEND_API_KEY);

// export const loader = async({params} : Route.LoaderArgs)=>{
//     const {data,error} = await client.emails.send({
//         from : "PhraseLog <wooju@mail.phraselog.online>",
//         to : "garethgates88@gmail.com",
//         subject : "Welcome to Supaplate",
//         react : <WelcomeUser username={params.username} />
//     });

//     return Response.json({data,error});
// }