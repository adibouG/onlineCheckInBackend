First use : 

1 - run :
npm install 


2 - Set the .env to fit with your environment ( default http , localhost , port 3003 )  

3 - run :
npm run dev 

Note :
A call to the /reset endpoint should be made manually at startup to reset the db reservations with dates relative to Today checkin dates
"

/email 
accept GET request 

GET : with email query parameter (e,g .../email?email=qwerty@azerty.com)

If a valid reservation (that can be checked in) is found , an email is triggered. This email contains a link to the checkin app with a jsonwebtoken (2 hours validity) as query parameter. This token contains all the data needed to pursue the check in flow but ... it should be, encrypted and signed with a ssl certificate , in order to be verified before being used to start the checkin process.


/reservation 
accept GET and POST requests

GET : with token query parameter

POST : with reservation JSON object updated 

actual available "tokens" (e.g. uuid in the meanwhile jsonwebtoken are generated and used) 

"43c98ac2-8493-49b0-95d8-de843d90e6ca"
"0be8c80a-82b7-4d0e-a6f2-4b96fb50a8b2" 
"7569ace8-a67d-43db-a4b3-faff1585f9f5"
"17611452-1c95-42a7-a63d-2dfb4ca326f6"
"85ba0f1a-c202-42c8-b02c-790fa34f2a8a" 
"688fbfc5-1c43-42de-a1cf-f1f2c7a73c6f" 
"3a4e4236-01fe-4d1a-b104-d4ded4e96c6b" 
"38dd6554-d344-45ad-bd0d-9f4c256c5c13" 
        

/reset 
accept POST : reset the DB , and set new dates.
