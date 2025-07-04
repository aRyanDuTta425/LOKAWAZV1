const {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
} = require('../src/utils/bcrypt');

const testPassword = 'MyStrong@123';

(async () => {
  const { isValid, errors, strength } = validatePasswordStrength(testPassword);
  console.log('Strength:', strength);
  if (!isValid) {
    console.log('Validation Errors:', errors);
    return;
  }

  const hashed = await hashPassword(testPassword);
  console.log('Hashed Password:', hashed);

  const isMatch = await comparePassword(testPassword, hashed);
  console.log('Do passwords match?', isMatch);
})();
