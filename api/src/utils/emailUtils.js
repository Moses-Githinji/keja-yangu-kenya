/**
 * Normalizes an email address by converting it to lowercase.
 * For Gmail addresses, it also removes any dots in the username part
 * and strips anything after a plus sign.
 *
 * @param {string} email - The email address to normalize
 * @returns {string} The normalized email address
 */
function normalizeEmail(email) {
  if (!email) return email;

  // Convert to lowercase and trim whitespace
  let normalized = email.toLowerCase().trim();

  // Handle Gmail addresses
  if (normalized.endsWith("@gmail.com")) {
    const [username, domain] = normalized.split("@");
    // Remove dots and anything after +
    const cleanUsername = username.split("+")[0].replace(/\./g, "");
    normalized = `${cleanUsername}@${domain}`;
  }

  return normalized;
}

export { normalizeEmail };
