First use : 

1 - run :
npm install 


2 - Set the .env to fit with your environment ( default http , localhost , port 3003 )  

3 - run :
npm run dev 


Flow :

to start the flow , call the email endpoint with your email address as parameter. if a reservation with this email exist , a checkin start email is send.
Once the checkin is finished , an email with the Qrcode is send

Note :
A call to the /reset endpoint can be made manually to reset the db and the reservations 





Endpoints : 

/email 
accept GET request 

GET : with email query parameter (e,g .../email?email=qwerty@azerty.com)

If a valid reservation (that can be checked in) is found , an email is triggered. This email contains a link to the checkin app with a jsonwebtoken (2 hours validity) as query parameter. This token is then verified before being used to start the checkin process.


/reservation 
accept GET and POST requests

GET : with token query parameter (e.g reservation?token=xxxxxxxx )

POST : with reservation JSON object updated 

        
/qrcode : 
POST : : with reservation JSON object ,  trigger a new qrcode email 

/reset 
accept POST : reset the DB , and set new dates.
