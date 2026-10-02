export const businesses = {
  "default": {
    name: "Glamour Spa Wuse 2",
    address: "23 Aminu Kano Crescent, Wuse 2, Abuja",
    services: [
      { name: "Full Body Massage", price: "₦15,000", duration: "60 mins" },
      { name: "Manicure & Pedicure", price: "₦10,000", duration: "45 mins" }
    ],
    hours: "Mon-Sat 9am-8pm, Sun 12pm-6pm"
  }
};

export function getBusinessInfo(businessId = "default") {
  const b = businesses[businessId];
  return `Business: ${b.name}\nAddress: ${b.address}\nHours: ${b.hours}\nServices: ${b.services.map(s => `${s.name} - ${s.price}`).join(", ")}`;
}
