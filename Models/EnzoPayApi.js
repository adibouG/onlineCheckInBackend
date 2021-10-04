

module.exports = class PaymentLinkRequestBody{
    
    constructor({
    merchantId = null, customerId = null, customerName = null,
    customerEmail = null,description = null,
     amountTotal = null,  languageCode = null, currency = null,
      method = null, issuerId = null } = {}) {
    
    this.merchantId = merchantId ;
    this.customerId =customerId;
    this.customerName = customerName;
    this.customerEmail= customerEmail;
    this.description= description;
    this.amountTotal=amountTotal;
    this.languageCode= languageCode;
    this.currency=currency;
    this.method=method;
    this.issuerId=issuerId;
    }


}
