// SIMULATION OTP — à remplacer par WhatsApp Business API plus tard
const sendOTP = async (phone, code) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('═══════════════════════════════════');
    console.log(`📱 OTP SIMULÉ pour ${phone}`);
    console.log(`🔑 Code : ${code}`);
    console.log('═══════════════════════════════════');
    return { success: true, simulated: true };
  }
  // ICI on branchera WhatsApp Business API en production
  throw new Error('WhatsApp API non configurée en production');
};

module.exports = { sendOTP };