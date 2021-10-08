

class PaymentLinkRequestBody{
    
    constructor({
    merchantId = null, customerId = null, customerName = null,
    customerEmail = null,description = null,
     amountTotal = null,  languageCode = null, currency = null,
      method = null, issuerId = null } = {}) {
    
    this.merchantId = merchantId ;
    this.customerId = customerId;
    this.customerName = customerName;
    this.customerEmail = customerEmail;
    this.description = description;
    this.amountTotal = amountTotal;
    this.languageCode = languageCode;
    this.currency = currency;
    this.method = method;
    this.issuerId = issuerId;
    }


}

class PaymentResult {
  constructor({ 
          transactionId = null,
          merchantId = null,
          status = null, 
          amountPaid = null, 
          currency = null, 
          method = null, 
          issuerId = null, 
          providerId = null, 
          cardNumber = null 
    } = {}) 
  {
      this.transactionId = transactionId;
      this.merchantId = merchantId;
      this.status = status;
      this.amountPaid = amountPaid;
      this.currency = currency;
      this.method = method;
      this.issuerId = issuerId;
      this.providerId = providerId;
      this.cardNumber = cardNumber;
  }
  //get status() { return this.status.toUpperCase(); }
  
}


module.exports = {
  PaymentLinkRequestBody,
  PaymentResult 
}