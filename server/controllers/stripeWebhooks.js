import stripe from 'stripe'
import Booking from '../models/Booking.js'


export const stripeWebhooks = async (request, response)=>{
    console.log('webhook hit');
    
const stripInstance= new stripe(process.env.STRIPE_SECRET_KEY)
const sig=request.headers["stripe-signature"]

let event;
try {
    event=stripInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    console.log("event type :", event.type);
    
} catch (error) {
    return response.status(400).send(`Webhook error: ${error.message}`)
}
try {
    switch(event.type){
        case "payment_intent.succeeded": {
            const paymentIntent=event.data.object;
            const sessionList= await stripInstance.checkout.sessions.list({payment_intent: paymentIntent.id})
            const session=sessionList.data[0];
            const {bookingId}=session.metadata;
            await Booking.findByIdAndUpdate(bookingId, {isPaid : true ,paymentLink : ''})
            console.log(`Booking ${bookingId} marked as paid`);
            break;
        }
        default:
            console.log('unhandle event type: ',event.type);
            
         
    }
    response.json({received: true})
             
} catch (error) {
    console.log("Webhook processing error: ",error);
    response.status(500).send('Internal Server Error')
}

}