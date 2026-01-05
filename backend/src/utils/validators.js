export function isEmail(s) {
  return typeof s === "string" && /\S+@\S+\.\S+/.test(s.trim());
}

export function isStrongPassword(s) {
  return (
    typeof s === "string" &&
    s.length >= 8 &&
    /[a-z]/.test(s) &&
    /[!@#$%^&*]/.test(s)
  );
}
