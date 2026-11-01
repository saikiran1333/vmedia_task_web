export const contact = {
  brand: "TribeGreen",
  legalEntity: "V Green Media Pvt. Ltd.",
  email: "enquiry@tribegreengifts.com",
  supportEmail: "support@tribegreengifts.com",
  phoneDisplay: "+91 8008 200 794",
  phoneTel: "+918008200794",
  phoneHours: "Monday to Friday, 9:30 AM – 6:00 PM",
  whatsappDisplay: "+91 9063 09 9063",
  whatsappDigits: "919063099063",
  officeHours: "Monday to Saturday, 11:00 AM – 6:00 PM. Second Saturday and Sunday closed.",
  addressLines: [
    "The Tribe Green",
    "3-6-530/2, 1st Floor, Street No. 7",
    "Lane opposite Minerva Coffee Shop, Himayathnagar",
    "Hyderabad 500029, Telangana, India",
  ],
  termsUrl: "https://tribegreengifts.com/terms-and-conditions/",
  grievanceUrl: "https://tribegreengifts.com/contact-and-grievance-redressal/",
};

export function whatsappHref(message: string) {
  return `https://wa.me/${contact.whatsappDigits}?text=${encodeURIComponent(message)}`;
}

export function productWhatsappMessage(product: { id: string; name: string; displayedPrice: number | null }) {
  const price = product.displayedPrice == null ? "price on request" : `displayed price ₹${product.displayedPrice}`;
  return `Hello TribeGreen, I would like to enquire about ${product.name} (${product.id}, ${price}).`;
}
