BackEnd providing the base services for sessions, database, api, ... to a client app (onlineCheckin) and provide base interfaces to manage the 2nd and 3rd party app and services inregrations 


Endpoints to the frontend app  : 

/email 
accept GET request 

GET : with email query parameter (e,g .../email?email=qwerty@azerty.com)



/reservation 
accept GET and POST requests

GET : with token query parameter (e.g reservation?token=xxxxxxxx )

POST : with reservation JSON object updated 

        
/qrcode : 
POST : : with reservation JSON object ,  trigger a new qrcode email 

/reset 
accept POST : reset the DB , and set new dates.



Explanations:



You trigger the flow using an email address, by sending a GET request to /email?email=xxxx@ssss  , This is for friendly demo usecases, production mode use a wacther daemon, and trigger the email sending according to the reservsation date offset value (per setting)  and the indexing of the job processed.
. 
If a valid reservation (that can be checked in and within the date offset) is found , an email is triggered. 

This email contains a link (tokenized for a single personal uses and for 2 hours of validity, valididty values from setting) sllowing the  access the checkin app generic entry point/page.
At this generic page load, the token get verified and user is redirected to the customized welcome page (data, stuyyles , etc...  setup and pre-filled according to the user case)  . And the "commercial" flow can start. 

Ivarious steps are offered to finalize registartion and payment, once the flow finish and is succeesfully validated, a QRcode is generated , on the screen and sent by email too.

If you reuse the link while valid, the  prechecked reservation is still retrievd but you re notified that it is already prechcked  and allows you to continue in order to update values . 

In the DEMO MODE 
instead of sending a new 2nd QRcode , this 2nd time end up with the reset of the reservation values and state in the db to eaily porovide a new DEMO flown without access to the backend or manual change 
Note , you can also reset a reservation by calling a GET /reset?email=xxx@dddd or to /reset?uuid=reservationID
